import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { createCase } from '../api/casesApi'

export default function CaseCreatePage() {
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [initialDescription, setInitialDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!title.trim()) {
      setError('사건 제목을 입력해주세요.')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const createdCase = await createCase({
        title: title.trim(),
        category: 'WAGE',
        initialDescription: initialDescription.trim() || undefined,
      })

      navigate(`/cases/${createdCase.caseId}`)
    } catch (err) {
      console.error(err)
      setError('사건을 생성하지 못했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>사건 생성</h2>

      {error && <p>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">사건 제목</label>
          <input
            id="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="사건 제목을 입력해주세요."
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="initialDescription">상담 내용</label>
          <textarea
            id="initialDescription"
            value={initialDescription}
            onChange={(event) =>
              setInitialDescription(event.target.value)
            }
            placeholder="사건 내용을 입력해주세요."
            disabled={loading}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? '생성 중...' : '사건 생성'}
        </button>
      </form>
    </div>
  )
}