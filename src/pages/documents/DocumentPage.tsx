import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { createDocument, getDocument, getDocumentPdf, getDocuments, updateDocument } from '@/features/documents/api/documentApi'
import { DocumentForm } from '@/features/documents/components/DocumentForm'
import { DocumentList } from '@/features/documents/components/DocumentList'
import { pdfFilename, toForm, toPatchRequest } from '@/features/documents/lib/documentHelpers'
import type { DocumentSummary, DocumentUpdateRequest } from '@/features/documents/types/document'
import './document.css'

export function DocumentPage() {
  const { caseId: routeCaseId } = useParams()
  const caseId = routeCaseId && /^[1-9]\d*$/.test(routeCaseId) && Number.isSafeInteger(Number(routeCaseId)) ? routeCaseId : null
  const [documents, setDocuments] = useState<DocumentSummary[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [form, setForm] = useState<DocumentUpdateRequest | null>(null)
  const [dirty, setDirty] = useState(false)
  const [activity, setActivity] = useState<'list' | 'create' | 'detail' | 'save' | 'pdf' | null>('list')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const loadList = useCallback(async (id: string) => {
    const result = await getDocuments(id)
    setDocuments(result)
  }, [])

  useEffect(() => {
    if (!caseId) return
    let active = true
    getDocuments(caseId).then((result) => {
      if (active) { setDocuments(result); setError('') }
    }).catch(() => { if (active) setError('문서 목록을 불러오지 못했습니다.') })
      .finally(() => { if (active) setActivity(null) })
    return () => { active = false }
  }, [caseId])

  async function openDocument(documentId: number) {
    if (!caseId || activity) return
    if (dirty && !window.confirm('저장하지 않은 변경 사항이 있습니다. 다른 문서를 여시겠습니까?')) return
    setActivity('detail'); setError(''); setMessage('')
    try {
      const detail = await getDocument(caseId, documentId)
      setSelectedId(detail.documentId)
      setForm(toForm(detail))
      setDirty(false)
    } catch { setError('문서 상세를 불러오지 못했습니다.') }
    finally { setActivity(null) }
  }

  async function handleCreate() {
    if (!caseId || activity) return
    if (dirty && !window.confirm('저장하지 않은 변경 사항이 있습니다. 새 초안을 생성하시겠습니까?')) return
    setActivity('create'); setError(''); setMessage('')
    try {
      const detail = await createDocument(caseId)
      setSelectedId(detail.documentId)
      setForm(toForm(detail))
      setDirty(false)
      setMessage('AI 진정서 초안이 생성되었습니다. 내용을 확인하고 저장해 주세요.')
      try { await loadList(caseId) } catch { setError('초안은 생성되었지만 문서 목록을 새로 불러오지 못했습니다.') }
    } catch { setError('진정서 초안 생성 또는 조회에 실패했습니다. 상담 내역과 서버 상태를 확인해 주세요.') }
    finally { setActivity(null) }
  }

  async function handleSave() {
    if (!caseId || !selectedId || !form || activity || !dirty) return
    setActivity('save'); setError(''); setMessage('')
    try {
      const detail = await updateDocument(caseId, selectedId, toPatchRequest(form))
      setForm(toForm(detail))
      setDirty(false)
      setMessage('진정서를 저장했습니다.')
      try { await loadList(caseId) } catch { setError('저장은 완료되었지만 문서 목록을 새로 불러오지 못했습니다.') }
    } catch { setError('진정서 저장 또는 재조회에 실패했습니다. 내용을 확인한 뒤 다시 시도해 주세요.') }
    finally { setActivity(null) }
  }

  async function handlePdf() {
    if (!caseId || !selectedId || activity || dirty) return
    setActivity('pdf'); setError(''); setMessage('')
    try {
      const { blob, disposition } = await getDocumentPdf(caseId, selectedId)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = pdfFilename(disposition, selectedId)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      setMessage('PDF 다운로드를 시작했습니다.')
    } catch { setError('PDF를 다운로드하지 못했습니다.') }
    finally { setActivity(null) }
  }

  if (!caseId) return <main className="container document-page"><h1>노동청 진정서</h1><p>유효한 사건 ID가 필요합니다.</p><Link to="/cases">사건 목록으로</Link></main>

  return <main className="container document-page">
    <p><Link to={`/cases/${caseId}`}>사건 상세로</Link></p>
    <h1>노동청 진정서</h1>
    <p>AI 초안을 확인하고 필요한 내용을 수정한 뒤 저장하세요.</p>
    {error && <p role="alert">{error}</p>}
    {message && <p role="status">{message}</p>}
    <button type="button" disabled={activity !== null} onClick={() => void handleCreate()}>
      {activity === 'create' ? 'AI 초안 생성 중... 시간이 걸릴 수 있습니다.' : '진정서 초안 생성'}
    </button>
    {activity === 'list' ? <p>문서 목록 조회 중...</p> :
      <DocumentList documents={documents} selectedId={selectedId} disabled={activity !== null}
        onSelect={(id) => void openDocument(id)} />}
    {activity === 'detail' && <p>문서 상세 조회 중...</p>}
    {form && selectedId !== null && <section className="document-editor">
      <h2>진정서 #{selectedId}</h2>
      {dirty && <p>저장하지 않은 변경 사항이 있습니다. PDF는 저장 후 다운로드할 수 있습니다.</p>}
      <DocumentForm value={form} disabled={activity !== null} saving={activity === 'save'} dirty={dirty}
        onChange={(next) => { setForm(next); setDirty(true); setMessage('') }} onSave={() => void handleSave()} />
      <button type="button" disabled={activity !== null || dirty} onClick={() => void handlePdf()}>
        {activity === 'pdf' ? 'PDF 다운로드 중...' : '저장된 진정서 PDF 다운로드'}
      </button>
    </section>}
  </main>
}
