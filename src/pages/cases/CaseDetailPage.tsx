import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { getCase, updateCase } from '@/features/cases/api/casesApi'
import { caseCategoryLabels, caseStatusLabels } from '@/features/cases/lib/caseLabels'
import type { Case, CaseStatus } from '@/features/cases/types/case'
import { getConsultationMessages } from '@/features/consultation/api/consultationApi'
import { ProtectedPageLayout } from '@/shared/components/layout/ProtectedPageLayout'

export default function CaseDetailPage() {
  const { caseId } = useParams()
  const validCaseId = caseId && /^[1-9]\d*$/.test(caseId) && Number.isSafeInteger(Number(caseId)) ? Number(caseId) : null
  const navigate = useNavigate()

  const [caseData, setCaseData] = useState<Case | null>(null)
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [initialMessage, setInitialMessage] = useState<string | null>(null)
  const [initialMessageLoading, setInitialMessageLoading] = useState(true)
  const [initialMessageError, setInitialMessageError] = useState(false)

  useEffect(() => {
    async function loadCase() {
      if (!validCaseId) return

      try {
        setLoading(true)
        setError(null)

        const response = await getCase(validCaseId)

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
  }, [validCaseId])

  useEffect(() => {
    if (!validCaseId) return

    let active = true
    setInitialMessage(null)
    setInitialMessageLoading(true)
    setInitialMessageError(false)

    getConsultationMessages(validCaseId)
      .then((messages) => {
        if (active) setInitialMessage(messages.find((message) => message.role === 'USER')?.content ?? null)
      })
      .catch((err: unknown) => {
        console.error(err)
        if (active) setInitialMessageError(true)
      })
      .finally(() => {
        if (active) setInitialMessageLoading(false)
      })

    return () => {
      active = false
    }
  }, [validCaseId])

  async function handleSave() {
    if (!validCaseId || !title.trim()) {
      setError('사건 제목을 입력해주세요.')
      return
    }

    try {
      setSaving(true)
      setError(null)

      const response = await updateCase(validCaseId, {
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
    if (!validCaseId) return

    try {
      setSaving(true)
      setError(null)

      const response = await updateCase(validCaseId, {
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

  return (
    <ProtectedPageLayout
      title="사건 상세"
      description="사건 정보를 관리하고 이 사건의 상담과 증거자료, 진정서를 확인하세요."
      backTo="/cases"
      backLabel="내 사건으로"
    >
      {!validCaseId ? (
        <div className="rounded-md border border-rose-200 bg-white p-6 text-sm text-rose-700" role="alert">잘못된 사건 경로입니다.</div>
      ) : loading ? (
        <div className="rounded-md border border-slate-200 bg-white p-10 text-center text-sm text-slate-600" role="status">사건 정보를 불러오는 중...</div>
      ) : error && !caseData ? (
        <div className="rounded-md border border-rose-200 bg-white p-6 text-sm text-rose-700" role="alert">{error}</div>
      ) : !caseData ? (
        <div className="rounded-md border border-slate-200 bg-white p-10 text-center text-sm text-slate-600">사건을 찾을 수 없습니다.</div>
      ) : (
        <div className="space-y-8">
          <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-slate-500">사건 #{caseData.caseId} · {caseCategoryLabels[caseData.category]}</p>
                <h2 className="mt-2 text-xl font-bold text-slate-900">{caseData.title}</h2>
                <p className="mt-2 text-xs text-slate-500">등록일 {new Date(caseData.createdAt).toLocaleDateString('ko-KR')}</p>
              </div>
              <span className="rounded bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">{caseStatusLabels[caseData.status]}</span>
            </div>
            {caseData.summary && <p className="mt-5 whitespace-pre-wrap border-t border-slate-100 pt-5 text-sm leading-6 text-slate-600">{caseData.summary}</p>}
          </section>

          {error && <p className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700" role="alert">{error}</p>}

          <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="initial-consultation-title">
            <h2 id="initial-consultation-title" className="text-lg font-bold text-slate-900">최초 상담 내용</h2>
            <div className="mt-4 rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-700">
              {initialMessageLoading ? (
                <p role="status">최초 상담 내용을 불러오는 중...</p>
              ) : initialMessageError ? (
                <p>최초 상담 내용을 불러오지 못했습니다.</p>
              ) : initialMessage === null ? (
                <p>등록된 최초 상담 내용이 없습니다.</p>
              ) : (
                <p className="whitespace-pre-wrap">{initialMessage}</p>
              )}
            </div>
          </section>

          <section aria-labelledby="case-services-title">
            <h2 id="case-services-title" className="mb-4 text-lg font-bold text-slate-900">사건별 서비스</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { title: 'AI 상담', description: '이 사건의 상담 내역을 확인하고 메시지를 보내세요.', path: 'consultation' },
                { title: '증거자료 분석', description: '증거자료를 등록하고 분석 결과를 확인하세요.', path: 'evidences' },
                { title: '진정서', description: '상담 내용을 바탕으로 진정서를 작성하고 관리하세요.', path: 'documents' },
                { title: '전문가 Q&A', description: '이 사건에 관해 전문가에게 질문하고 답변을 확인하세요.', path: 'expert-qna' },
              ].map((service) => (
                <button key={service.path} type="button" onClick={() => navigate(`/cases/${caseData.caseId}/${service.path}`)} className="rounded-md border border-slate-200 bg-white p-5 text-left shadow-sm hover:border-blue-300 hover:bg-blue-50/40">
                  <strong className="block text-base text-slate-900">{service.title}</strong>
                  <span className="mt-2 block text-sm leading-6 text-slate-600">{service.description}</span>
                  <span className="mt-4 block text-sm font-semibold text-blue-700">이동하기 →</span>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="case-edit-title">
            <h2 id="case-edit-title" className="text-lg font-bold text-slate-900">사건 정보 수정</h2>
            <div className="mt-6 grid gap-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="title">사건 제목</label>
                <input id="title" className="w-full rounded-md border border-slate-300 px-4 py-3 text-sm focus:border-blue-700 focus:outline-none" value={title} onChange={(event) => setTitle(event.target.value)} disabled={saving} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700" htmlFor="summary">사건 요약</label>
                <textarea id="summary" className="min-h-32 w-full resize-y rounded-md border border-slate-300 px-4 py-3 text-sm leading-6 focus:border-blue-700 focus:outline-none" value={summary} onChange={(event) => setSummary(event.target.value)} disabled={saving} />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button type="button" onClick={handleSave} disabled={saving} className="rounded-md bg-[#0b326b] px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-50">{saving ? '저장 중...' : '수정 저장'}</button>
            </div>
          </section>

          <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="case-status-title">
            <h2 id="case-status-title" className="text-lg font-bold text-slate-900">사건 상태 변경</h2>
            <p className="mt-1 text-sm text-slate-500">사건의 진행 상태를 변경할 수 있습니다.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={() => handleStatusChange('CLOSED')} disabled={saving || caseData.status === 'CLOSED'} className="rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">종료</button>
              <button type="button" onClick={() => handleStatusChange('ARCHIVED')} disabled={saving || caseData.status === 'ARCHIVED'} className="rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">보관</button>
            </div>
          </section>
        </div>
      )}
    </ProtectedPageLayout>
  )
}
