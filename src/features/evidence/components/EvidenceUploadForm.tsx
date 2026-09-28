import { useRef, useState } from 'react'

const MAX_FILE_SIZE = 10 * 1024 * 1024
const ACCEPTED_MIME_TYPES = ['image/jpeg', 'image/png', 'application/pdf']

interface EvidenceUploadFormProps {
  disabled: boolean
  onUpload: (file: File, description: string) => Promise<boolean>
}

export function EvidenceUploadForm({ disabled, onUpload }: EvidenceUploadFormProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [description, setDescription] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  function selectFile(file: File | null) {
    setError('')
    if (!file) { setSelectedFile(null); return }
    if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
      setSelectedFile(null)
      setError('JPEG, PNG 또는 PDF 파일을 선택해주세요.')
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setSelectedFile(null)
      setError('파일 크기는 10MB 이하만 선택할 수 있습니다.')
      return
    }
    setSelectedFile(file)
  }

  async function submit() {
    if (!selectedFile || disabled || uploading) return
    setUploading(true)
    try {
      if (await onUpload(selectedFile, description)) {
        setSelectedFile(null)
        setDescription('')
        if (fileRef.current) fileRef.current.value = ''
      }
    } finally { setUploading(false) }
  }

  return <>
    <div className="upload-note">
      <label className="outline-button upload-label"><input ref={fileRef} type="file" accept="image/jpeg,image/png,application/pdf" disabled={disabled || uploading} onChange={(event) => selectFile(event.target.files?.[0] ?? null)} />파일 선택</label>
      <span>{selectedFile ? `선택 파일: ${selectedFile.name}` : 'JPEG, PNG 또는 PDF 파일을 선택해주세요.'}</span>
      <input value={description} disabled={disabled || uploading} onChange={(event) => setDescription(event.target.value)} placeholder="자료 설명을 입력해주세요" />
      <button className="navy-button" disabled={disabled || uploading || !selectedFile} onClick={() => void submit()}>{uploading ? '업로드 중' : '업로드'}</button>
    </div>
    {error && <p className="notice" role="alert">{error}</p>}
  </>
}
