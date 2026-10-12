// 실행: node scripts/quick-consultation-smoke.mjs
// 기존 Vite와 로컬 Chrome/Edge를 사용하며 실제 Backend를 호출하지 않는다.
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { createServer } from 'vite'

const browserPath = process.env.SMOKE_BROWSER_PATH ?? [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
].find(existsSync)
assert.ok(browserPath, 'Chrome/Edge 또는 SMOKE_BROWSER_PATH가 필요합니다.')
const profile = await mkdtemp(path.join(tmpdir(), 'workhelper-smoke-'))
const server = await createServer({ server: { host: '127.0.0.1', port: 0 } })
await server.listen()
const origin = server.resolvedUrls.local[0].replace(/\/$/, '')
await fetch(origin)
const browser = spawn(browserPath, [
  '--headless=new', '--disable-gpu', '--no-proxy-server', '--no-first-run', '--no-default-browser-check',
  '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank',
], { windowsHide: true, stdio: 'ignore' })
let socket
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
async function until(check, label) {
  for (let attempt = 0; attempt < 200; attempt++) {
    if (await check()) return
    await delay(50)
  }
  throw new Error(`시간 초과: ${label}`)
}

try {
  let debugPort
  await until(async () => {
    try { debugPort = Number((await readFile(path.join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]); return true }
    catch { return false }
  }, '브라우저 시작')
  const targets = await (await fetch(`http://127.0.0.1:${debugPort}/json/list`)).json()
  console.log('브라우저 연결 및 모의 API 검증 시작')
  socket = new WebSocket(targets.find((target) => target.type === 'page').webSocketDebuggerUrl)
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('브라우저 WebSocket 연결 시간 초과')), 10000)
    socket.onopen = () => { clearTimeout(timeout); resolve() }
    socket.onerror = (event) => { clearTimeout(timeout); reject(new Error(`WebSocket 연결 실패: ${event.message}`)) }
  })
  console.log('브라우저 WebSocket 연결 완료')
  let nextId = 0
  const pending = new Map()
  const requests = []
  let createFails = false
  let aiFails = false
  let getFails = false
  let caseId = 100
  const messages = new Map()
  function command(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++nextId
      const timeout = setTimeout(() => { pending.delete(id); reject(new Error(`브라우저 명령 시간 초과: ${method}`)) }, 30000)
      pending.set(id, {
        resolve: (value) => { clearTimeout(timeout); resolve(value) },
        reject: (error) => { clearTimeout(timeout); reject(error) },
      })
      socket.send(JSON.stringify({ id, method, params }))
    })
  }
  async function mockRequest(event) {
    const { requestId, request } = event.params
    const pathname = new URL(request.url).pathname
    if (!pathname.startsWith('/api/')) {
      await command('Fetch.continueRequest', { requestId })
      return
    }
    requests.push({ method: request.method, pathname, body: request.postData ? JSON.parse(request.postData) : null })
    let status = 200
    let body = []
    if (request.method === 'OPTIONS') body = null
    else if (pathname === '/api/cases' && request.method === 'POST') {
      await delay(150)
      status = createFails ? 500 : 201
      body = { caseId: ++caseId, ...JSON.parse(request.postData), status: 'CREATED' }
      messages.set(caseId, [])
    } else if (/\/messages$/.test(pathname)) {
      const id = Number(pathname.split('/')[3])
      if (request.method === 'POST') {
        const userMessage = { messageId: requests.length, caseId: id, role: 'USER', content: JSON.parse(request.postData).content, createdAt: '2026-10-12', structuredResult: null }
        const history = messages.get(id) ?? []
        history.push(userMessage)
        messages.set(id, history)
        await delay(200)
        status = aiFails ? 500 : 200
        if (!aiFails) history.push({ ...userMessage, messageId: requests.length + 1000, role: 'ASSISTANT', content: '모의 AI 답변' })
        body = userMessage
      } else {
        status = getFails ? 500 : 200
        body = messages.get(id) ?? []
      }
    } else if (pathname === '/api/cases') {
      body = { content: [], totalElements: 0, totalPages: 0, size: 10, number: 0 }
    } else if (/^\/api\/cases\/\d+$/.test(pathname)) {
      body = { caseId: Number(pathname.split('/')[3]), title: '기존 사건', category: 'WAGE', status: 'CREATED', summary: null, createdAt: '2026-10-12', updatedAt: '2026-10-12' }
    }
    await command('Fetch.fulfillRequest', {
      requestId, responseCode: status,
      responseHeaders: [
        { name: 'Content-Type', value: 'application/json' },
        { name: 'Access-Control-Allow-Origin', value: origin },
        { name: 'Access-Control-Allow-Headers', value: '*' },
        { name: 'Access-Control-Allow-Methods', value: '*' },
      ], body: Buffer.from(JSON.stringify(body)).toString('base64'),
    })
  }
  socket.onmessage = ({ data }) => {
    const event = JSON.parse(data)
    if (event.id) {
      const callback = pending.get(event.id)
      pending.delete(event.id)
      if (event.error) callback.reject(new Error(event.error.message))
      else callback.resolve(event.result)
    } else if (event.method === 'Fetch.requestPaused') {
      mockRequest(event).catch((error) => { console.error(error); browser.kill() })
    } else if (event.method === 'Runtime.exceptionThrown') {
      console.error('브라우저 오류:', event.params.exceptionDetails.exception?.description ?? event.params.exceptionDetails.text)
    }
  }
  const evaluate = async (expression) => {
    const result = await command('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text)
    return result.result.value
  }
  const open = async (pathname) => {
    await command('Page.navigate', { url: origin + pathname })
    await until(() => evaluate('document.readyState === "complete"'), pathname)
  }
  const waitText = async (text) => {
    try { await until(() => evaluate(`document.body.innerText.includes(${JSON.stringify(text)})`), text) }
    catch (error) { console.error(await evaluate('({ url: location.href, text: document.body.innerText })')); throw error }
  }
  const fill = (selector, value) => evaluate(`(() => {
    const input = document.querySelector(${JSON.stringify(selector)});
    const prototype = input.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(prototype, 'value').set.call(input, ${JSON.stringify(value)});
    input.dispatchEvent(new Event('input', { bubbles: true }));
  })()`)
  const submit = () => evaluate(`(() => {
    const form = document.querySelector('main form');
    form.requestSubmit(); form.requestSubmit();
    form.querySelector('button').click();
  })()`)
  const count = (pathname) => requests.filter((request) => request.method === 'POST' && request.pathname === pathname).length
  await command('Fetch.enable', { patterns: [{ urlPattern: '*/api/*' }] })
  await command('Runtime.enable')
  await open('/')
  await waitText('빠른 AI 상담 시작')
  console.log('메인 입력 및 비로그인 검증')
  await fill('#quick-consultation-question', '   ')
  await submit()
  assert.equal(count('/api/cases'), 0)
  await fill('#quick-consultation-question', '비로그인 질문')
  await command('Page.enable')
  let dialogSeen = false
  socket.addEventListener('message', ({ data }) => {
    if (JSON.parse(data).method === 'Page.javascriptDialogOpening') {
      dialogSeen = true
      void command('Page.handleJavaScriptDialog', { accept: true })
    }
  })
  await submit()
  await waitText('로그인 / 회원가입')
  assert.ok(dialogSeen)
  assert.equal(count('/api/cases'), 0)
  await evaluate(`localStorage.setItem('workhelper-auth-storage', JSON.stringify({ state: {
    token: 'mock-token', user: { id: 1, name: '테스트', role: 'GENERAL' }, tokenExpiresAt: Date.now() + 3600000
  }, version: 0 }))`)
  await open('/')
  await waitText('빠른 AI 상담 시작')
  const question = '임금 체불 질문 '.repeat(30).trim()
  await fill('#quick-consultation-question', `  ${question}  `)
  await evaluate(`document.querySelector('#quick-consultation-question').focus()`)
  await command('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13, text: '\r' })
  await command('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 })
  await submit()
  await waitText('모의 AI 답변')
  console.log('첫 질문 전송 및 후속 질문 검증')
  assert.equal(count('/api/cases'), 1)
  assert.deepEqual(requests.find((request) => request.method === 'POST' && request.pathname === '/api/cases').body, { title: question.slice(0, 200), category: 'WAGE' })
  assert.equal(count('/api/cases/101/messages'), 1)
  assert.equal(requests.find((request) => request.method === 'POST' && request.pathname.endsWith('/messages')).body.content, question)
  assert.equal(await evaluate('location.pathname'), '/cases/101/consultation')
  assert.equal(await evaluate('history.state.usr'), null)
  await evaluate(`history.replaceState({ ...history.state, usr: { initialQuestion: ${JSON.stringify(question)} } }, '', location.href); window.dispatchEvent(new PopStateEvent('popstate'))`)
  await until(() => evaluate('history.state.usr === null'), '같은 페이지 state 재사용 후 제거')
  assert.equal(count('/api/cases/101/messages'), 1)
  await fill('#consultation-message', '두 번째 질문')
  await evaluate(`document.querySelector('textarea').parentElement.querySelector('button').click()`)
  await until(() => evaluate('!document.querySelector("textarea").disabled'), '두 번째 질문 완료')
  assert.equal(count('/api/cases/101/messages'), 2)
  await command('Page.reload')
  await waitText('두 번째 질문')
  await delay(300)
  assert.equal(count('/api/cases/101/messages'), 2)
  await evaluate('history.back()')
  await waitText('빠른 AI 상담 시작')
  await evaluate('history.forward()')
  await waitText('두 번째 질문')
  assert.equal(count('/api/cases/101/messages'), 2)
  await open('/')
  await waitText('빠른 AI 상담 시작')
  createFails = true
  console.log('사건 생성/AI/조회 실패 검증')
  await fill('#quick-consultation-question', '사건 생성 실패 질문')
  await submit()
  await waitText('사건을 생성하지 못했습니다')
  assert.equal(await evaluate('document.querySelector("input#quick-consultation-question").value'), '사건 생성 실패 질문')
  assert.equal(await evaluate('location.pathname'), '/')
  createFails = false
  aiFails = true
  await submit()
  await waitText('AI 응답을 받지 못했습니다')
  const failedCase = caseId
  assert.equal(count(`/api/cases/${failedCase}/messages`), 1)
  assert.equal(await evaluate('document.querySelectorAll("article strong").length'), 1)
  await command('Page.reload')
  await waitText('사건 생성 실패 질문')
  assert.equal(count(`/api/cases/${failedCase}/messages`), 1)
  await open('/')
  await waitText('빠른 AI 상담 시작')
  getFails = true
  await fill('#quick-consultation-question', '저장 확인 실패 질문')
  await submit()
  await waitText('질문 저장 여부를 확인할 수 없어')
  await waitText('저장 상태 확인 필요')
  assert.equal(count(`/api/cases/${caseId}/messages`), 1)
  getFails = false
  aiFails = false
  await open('/cases/new')
  await waitText('사건 정보')
  await fill('#title', '직접 등록 사건')
  await fill('#initialDescription', '직접 등록 상담 내용')
  await evaluate(`document.querySelector('main form').requestSubmit()`)
  await waitText('기존 사건')
  assert.deepEqual(requests.filter((request) => request.method === 'POST' && request.pathname === '/api/cases').at(-1).body, {
    title: '직접 등록 사건', category: 'WAGE', initialDescription: '직접 등록 상담 내용',
  })
  await open('/cases')
  await waitText('내 사건')
  await open('/cases/101')
  await waitText('기존 사건')
  await open('/cases/101/consultation')
  await waitText('두 번째 질문')
  assert.equal(count('/api/cases/101/messages'), 2)
  console.log('PASS: StrictMode 빠른 상담, Enter/버튼 중복 제출, 전체 질문/200자 제목, POST→GET, 후속 질문, state 재사용, 새로고침/뒤로/앞으로, 생성 실패, AI 실패, 조회 실패, 비로그인, 기존 사건 등록/목록/상세/상담')
} finally {
  socket?.close()
  browser.kill()
  server.ws.close()
  await server.close()
  // 브라우저가 임시 프로필 파일을 놓을 때까지 기다린다.
  await delay(500)
  assert.equal(path.dirname(path.resolve(profile)), path.resolve(tmpdir()))
  assert.ok(path.basename(profile).startsWith('workhelper-smoke-'))
  await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })
}
