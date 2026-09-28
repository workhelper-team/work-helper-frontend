import type { DocumentSummary } from '../types/document'

interface Props {
  documents: DocumentSummary[]
  selectedId: number | null
  disabled: boolean
  onSelect: (documentId: number) => void
}

export function DocumentList({ documents, selectedId, disabled, onSelect }: Props) {
  if (documents.length === 0) return <p>저장된 진정서가 없습니다.</p>

  return <section className="document-list" aria-label="저장된 진정서">
    <h2>저장된 진정서</h2>
    <ul>
      {documents.map((document) => <li key={document.documentId}>
        <button type="button" disabled={disabled} aria-current={selectedId === document.documentId ? 'true' : undefined}
          onClick={() => onSelect(document.documentId)}>
          {document.title || `진정서 #${document.documentId}`}
        </button>
      </li>)}
    </ul>
  </section>
}
