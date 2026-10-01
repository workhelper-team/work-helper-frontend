import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { getCases } from '../api/casesApi'
import { caseCategoryLabels, caseStatusLabels } from '../lib/caseLabels'
import type { Case } from '../types/case'

export function CaseList() {
  const [cases, setCases] = useState<Case[]>([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadCases() {
      try {
        setLoading(true)
        setError(null)
        const response = await getCases(undefined, page)
        setCases(response.content)
        setTotalPages(response.totalPages)
      } catch (err) {
        console.error(err)
        setError('사건 목록을 불러오지 못했습니다.')
      } finally {
        setLoading(false)
      }
    }

    void loadCases()
  }, [page])

  if (loading) {
    return <div className="rounded-md border border-slate-200 bg-white px-6 py-14 text-center text-sm text-slate-600" role="status">사건 목록을 불러오는 중...</div>
  }

  if (error) {
    return <div className="rounded-md border border-rose-200 bg-white px-6 py-10 text-center text-sm text-rose-700" role="alert">{error}</div>
  }

  if (cases.length === 0) {
    return (
      <div className="rounded-md border border-slate-200 bg-white px-6 py-14 text-center">
        <h2 className="text-lg font-semibold text-slate-900">등록된 사건이 없습니다.</h2>
        <p className="mt-2 text-sm text-slate-600">새 사건을 등록하고 상담을 시작해보세요.</p>
        <Link to="/cases/new" className="mt-6 inline-block rounded-md border border-[#0b326b] px-5 py-2.5 text-sm font-semibold text-[#0b326b] hover:bg-blue-50">새 사건 등록</Link>
      </div>
    )
  }

  return (
    <section aria-label="사건 목록">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">사건 목록</h2>
        <span className="text-sm text-slate-500">{page + 1} / {Math.max(totalPages, 1)} 페이지</span>
      </div>
      <div className="grid gap-4">
        {cases.map((item) => (
          <article key={item.caseId} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-slate-500">사건 #{item.caseId} · {caseCategoryLabels[item.category]}</p>
                <h3 className="mt-2 text-lg font-bold text-slate-900">{item.title}</h3>
              </div>
              <span className="rounded bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">{caseStatusLabels[item.status]}</span>
            </div>
            {item.summary && <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{item.summary}</p>}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <span className="text-xs text-slate-500">등록일 {new Date(item.createdAt).toLocaleDateString('ko-KR')}</span>
              <Link to={`/cases/${item.caseId}`} className="text-sm font-semibold text-blue-700 hover:underline">사건 상세 보기 →</Link>
            </div>
          </article>
        ))}
      </div>
      {totalPages > 1 && (
        <nav className="mt-7 flex items-center justify-center gap-4" aria-label="사건 목록 페이지">
          <button type="button" onClick={() => setPage((current) => current - 1)} disabled={page === 0} className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50">이전</button>
          <span className="text-sm text-slate-600">{page + 1} / {totalPages}</span>
          <button type="button" onClick={() => setPage((current) => current + 1)} disabled={page + 1 >= totalPages} className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50">다음</button>
        </nav>
      )}
    </section>
  )
}
