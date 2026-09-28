import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { getCase, updateCase } from '../api/casesApi'
import type { Case, CaseStatus } from '../types/case'

export default function CaseDetailPage() {
  const { caseId } = useParams()
  const navigate = useNavigate()

  const [caseData, setCaseData] = useState<Case | null>(null)
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadCase() {
      if (!caseId) return

      try {
        setLoading(true)
        setError(null)

        const response = await getCase(Number(caseId))

        setCaseData(response)
        setTitle(response.title)
        setSummary(response.summary ?? '')
      } catch (err) {
        console.error(err)
        setError('사건 정보를 불러오지 못했습니다.')
      } finally {
        setLoading(false)
      }
    }

    loadCase()
  }, [caseId])

  async function handleSave() {
    if (!caseId || !title.trim()) {
      setError('사건 제목을 입력해주세요.')
      return
    }

    try {
      setSaving(true)
      setError(null)

      const response = await updateCase(Number(caseId), {
        title: title.trim(),
        summary: summary.trim(),
      })

      setCaseData(response)
      setTitle(response.title)
      setSummary(response.summary ?? '')
    } catch (err) {
      console.error(err)
      setError('사건 정보를 수정하지 못했습니다.')
    } finally {
      setSaving(false)
    }
  }

  async function handleStatusChange(status: CaseStatus) {
    if (!caseId) return

    try {
      setSaving(true)
      setError(null)

      const response = await updateCase(Number(caseId), {
        status,
      })

      setCaseData(response)
      setTitle(response.title)
      setSummary(response.summary ?? '')
    } catch (err) {
      console.error(err)
      setError('사건 상태를 변경하지 못했습니다.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div>사건 정보를 불러오는 중...</div>
  }

  if (error && !caseData) {
    return <div>{error}</div>
  }

  if (!caseData) {
    return <div>사건을 찾을 수 없습니다.</div>
  }

  return (
    <div>
      <h2>사건 상세</h2>

      {error && <p>{error}</p>}

      <div>
        <p>사건 번호: {caseData.caseId}</p>
        <p>유형: {caseData.category}</p>
        <p>현재 상태: {caseData.status}</p>
      </div>

      <div>
        <label htmlFor="title">사건 제목</label>
        <input
          id="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          disabled={saving}
        />
      </div>

      <div>
        <label htmlFor="summary">사건 요약</label>
        <textarea
          id="summary"
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          disabled={saving}
        />
      </div>

      <div>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? '저장 중...' : '수정 저장'}
        </button>

        <button
          type="button"
          onClick={() => navigate(`/cases/${caseData.caseId}/consultation`)}
        >
          상담하기
        </button>
      </div>

      <div>
        <h3>사건 상태 변경</h3>

        <button
          type="button"
          onClick={() => handleStatusChange('CLOSED')}
          disabled={saving || caseData.status === 'CLOSED'}
        >
          CLOSED
        </button>

        <button
          type="button"
          onClick={() => handleStatusChange('ARCHIVED')}
          disabled={saving || caseData.status === 'ARCHIVED'}
        >
          ARCHIVED
        </button>
      </div>

      <button
        type="button"
        onClick={() => navigate('/cases')}
        disabled={saving}
      >
        사건 목록으로
      </button>
    </div>
  )
}