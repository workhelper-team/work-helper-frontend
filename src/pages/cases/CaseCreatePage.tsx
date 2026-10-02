import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { createCase } from '@/features/cases/api/casesApi'
import { ProtectedPageLayout } from '@/shared/components/layout/ProtectedPageLayout'

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
    <ProtectedPageLayout
      title="새 사건 등록"
      description="사건 제목과 상담 내용을 입력하면 사건별 서비스를 이용할 수 있습니다."
      backTo="/cases"
      backLabel="내 사건으로"
    >
      <form onSubmit={handleSubmit} className="max-w-3xl rounded-md border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-lg font-semibold text-slate-900">사건 정보</h2>
        <p className="mt-1 text-sm text-slate-500">현재는 임금 관련 사건을 등록할 수 있습니다.</p>

        {error && <p className="mt-5 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700" role="alert">{error}</p>}

        <div className="mt-7">
          <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="title">사건 제목 <span className="text-rose-600">*</span></label>
          <input
            id="title"
            className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="사건 제목을 입력해주세요."
            disabled={loading}
          />
        </div>

        <div className="mt-6">
          <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="initialDescription">상담 내용</label>
          <textarea
            id="initialDescription"
            className="min-h-40 w-full resize-y rounded-md border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-900 focus:border-blue-700 focus:outline-none"
            value={initialDescription}
            onChange={(event) => setInitialDescription(event.target.value)}
            placeholder="사건 내용을 입력해주세요."
            disabled={loading}
          />
          <p className="mt-2 text-xs text-slate-500">입력한 내용은 이 사건의 첫 상담 메시지로 저장됩니다.</p>
        </div>

        <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-6">
          <Link to="/cases" className="rounded-md border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">취소</Link>
          <button type="submit" disabled={loading} className="rounded-md bg-[#0b326b] px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-50">
            {loading ? '생성 중...' : '사건 생성'}
          </button>
        </div>
      </form>
    </ProtectedPageLayout>
  )
}
