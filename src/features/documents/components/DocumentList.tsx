import type { DocumentSummary } from '../types/document'

interface Props {
  documents: DocumentSummary[]
  selectedId: number | null
  disabled: boolean
  onSelect: (documentId: number) => void
}

export function DocumentList({ documents, selectedId, disabled, onSelect }: Props) {
  return <section className="document-panel document-list" aria-labelledby="document-list-title">
    <div className="document-section-heading">
      <h2 id="document-list-title">저장된 진정서</h2>
      <p>문서를 선택하면 저장된 내용을 다시 확인하고 수정할 수 있습니다.</p>
    </div>
    {documents.length === 0 ? (
      <div className="document-empty-state">아직 생성된 진정서가 없습니다.</div>
    ) : (
      <ul>
        {documents.map((document) => <li key={document.documentId}>
          <button type="button" disabled={disabled} aria-current={selectedId === document.documentId ? 'true' : undefined}
            onClick={() => onSelect(document.documentId)}>
            <span className="document-list-item-main">
              <strong>{document.title || `진정서 #${document.documentId}`}</strong>
              <span className="document-type">{document.documentType === 'COMPLAINT' ? '노동청 진정서' : document.documentType}</span>
            </span>
            <span className="document-list-item-meta">
              <span>생성 {new Date(document.createdAt).toLocaleDateString('ko-KR')}</span>
              <span>수정 {new Date(document.updatedAt).toLocaleDateString('ko-KR')}</span>
              {selectedId === document.documentId && <span className="document-selected-label">편집 중</span>}
            </span>
          </button>
        </li>)}
      </ul>
    )}
  </section>
}
