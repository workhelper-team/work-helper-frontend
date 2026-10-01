import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { createDocument, getDocument, getDocumentPdf, getDocuments, updateDocument } from '@/features/documents/api/documentApi'
import { DocumentForm } from '@/features/documents/components/DocumentForm'
import { DocumentList } from '@/features/documents/components/DocumentList'
import { pdfFilename, toForm, toPatchRequest } from '@/features/documents/lib/documentHelpers'
import type { DocumentSummary, DocumentUpdateRequest } from '@/features/documents/types/document'
import { ProtectedPageLayout } from '@/shared/components/layout/ProtectedPageLayout'
import './document.css'

export function DocumentPage() {
  const { caseId: routeCaseId } = useParams()
  const caseId = routeCaseId && /^[1-9]\d*$/.test(routeCaseId) && Number.isSafeInteger(Number(routeCaseId)) ? routeCaseId : null
  const [documents, setDocuments] = useState<DocumentSummary[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [form, setForm] = useState<DocumentUpdateRequest | null>(null)
  const [dirty, setDirty] = useState(false)
  const [activity, setActivity] = useState<'list' | 'create' | 'detail' | 'save' | 'pdf' | null>('list')
  const [listStatus, setListStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const loadList = useCallback(async (id: string) => {
    try {
      const result = await getDocuments(id)
      setDocuments(result)
      setListStatus('success')
    } catch (error) {
      setListStatus('error')
      throw error
    }
  }, [])

  useEffect(() => {
    if (!caseId) return
    let active = true
    getDocuments(caseId).then((result) => {
      if (active) { setDocuments(result); setListStatus('success'); setError('') }
    }).catch(() => { if (active) { setListStatus('error'); setError('문서 목록을 불러오지 못했습니다.') } })
      .finally(() => { if (active) setActivity(null) })
    return () => { active = false }
  }, [caseId])

  async function retryList() {
    if (!caseId || activity) return
    setListStatus('loading')
    setError('')
    try { await loadList(caseId) }
    catch { setError('문서 목록을 불러오지 못했습니다.') }
  }

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

  return <ProtectedPageLayout
    title="노동청 진정서"
    description="상담 내용을 바탕으로 진정서 초안을 작성하고 수정할 수 있습니다."
    backTo={caseId ? `/cases/${caseId}` : '/cases'}
    backLabel={caseId ? '사건 상세로' : '내 사건으로'}
  >
    {!caseId ? (
      <div className="document-notice document-notice-error" role="alert">유효한 사건 ID가 필요합니다.</div>
    ) : (
      <div className="document-page">
        {error && <p className="document-notice document-notice-error" role="alert">{error}</p>}
        {message && <p className="document-notice document-notice-success" role="status">{message}</p>}

        <section className="document-panel document-create" aria-labelledby="document-create-title">
          <div>
            <h2 id="document-create-title">AI 진정서 초안</h2>
            <p>상담 내용을 바탕으로 새 초안을 생성합니다. 생성한 문서는 아래 목록에서 다시 열 수 있습니다.</p>
          </div>
          <button type="button" className="document-primary-button" disabled={activity !== null} onClick={() => void handleCreate()}>
            {activity === 'create' ? 'AI 초안 생성 중...' : '진정서 초안 생성'}
          </button>
          {activity === 'create' && <p className="document-progress" role="status">AI 초안을 생성하고 있습니다. 시간이 걸릴 수 있습니다.</p>}
        </section>

        {listStatus === 'loading' ? (
          <section className="document-panel document-list-loading" role="status">문서 목록을 불러오는 중...</section>
        ) : listStatus === 'error' ? (
          <section className="document-panel document-list-loading" role="alert">
            <p>문서 목록을 불러오지 못했습니다.</p>
            <button type="button" className="document-outline-button" disabled={activity !== null} onClick={() => void retryList()}>다시 시도</button>
          </section>
        ) : (
          <DocumentList documents={documents} selectedId={selectedId} disabled={activity !== null}
            onSelect={(id) => void openDocument(id)} />
        )}
        {activity === 'detail' && <p className="document-notice" role="status">문서 상세를 불러오는 중...</p>}

        {form && selectedId !== null && <section className="document-editor" aria-labelledby="document-editor-title">
          <div className="document-editor-heading">
            <div>
              <h2 id="document-editor-title">진정서 #{selectedId} 편집</h2>
              <p>AI가 작성한 내용과 빈 항목을 확인한 뒤 필요한 정보를 입력하세요.</p>
            </div>
            <span className={dirty ? 'document-save-badge is-dirty' : 'document-save-badge'}>
              {dirty ? '저장되지 않은 변경사항' : '저장된 내용'}
            </span>
          </div>
          {dirty && <p className="document-notice document-notice-warning">저장되지 않은 변경사항이 있습니다. PDF는 저장 후 다운로드할 수 있습니다.</p>}
          <DocumentForm value={form} disabled={activity !== null} saving={activity === 'save'} dirty={dirty}
            onChange={(next) => { setForm(next); setDirty(true); setMessage('') }} onSave={() => void handleSave()} />
          <div className="document-pdf-actions">
            <button type="button" className="document-outline-button" disabled={activity !== null || dirty} onClick={() => void handlePdf()}>
              {activity === 'pdf' ? 'PDF 다운로드 중...' : 'PDF 다운로드'}
            </button>
          </div>
        </section>}
      </div>
    )}
  </ProtectedPageLayout>
}
