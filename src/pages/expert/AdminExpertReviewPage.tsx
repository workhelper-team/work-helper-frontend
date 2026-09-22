import React, { useEffect, useState } from 'react';
import { ExpertApplication } from '@/features/auth/types/auth.types';
import { getExpertApplicationsApi, getExpertLicenseFileApi, updateExpertStatusApi } from '@/features/auth/api/authApi';

export default function AdminExpertReviewPage() {
  const [applications, setApplications] = useState<ExpertApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const visibleApplications = applications
    .filter((application) => {
      const query = searchQuery.trim().toLocaleLowerCase();
      if (!query) return true;

      return [application.name, application.office, application.license]
        .some((value) => value.toLocaleLowerCase().includes(query));
    })
    .sort((left, right) => {
      const statusOrder = { 심사대기: 0, 승인완료: 1, 반려: 2 };
      const statusOrderDifference = statusOrder[left.status] - statusOrder[right.status];
      if (statusOrderDifference !== 0) return statusOrderDifference;

      return right.date.localeCompare(left.date);
    });

  useEffect(() => {
    const loadApplications = async () => {
      try {
        setApplications(await getExpertApplicationsApi());
      } catch {
        setError('전문가 가입 신청 목록을 불러오지 못했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadApplications();
  }, []);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    const visibleIds = new Set(visibleApplications.map(application => application.id));
    setApplications(current => current.map(app => (
      visibleIds.has(app.id) ? { ...app, selected: checked } : app
    )));
  };

  const handleSelectOne = (id: number) => {
    setApplications(current => current.map(app => app.id === id ? { ...app, selected: !app.selected } : app));
  };

  const handleBatchStatus = async (newStatus: '승인완료' | '반려') => {
    const selectedIds = applications.filter(app => app.selected).map(app => app.id);
    if (selectedIds.length === 0) return;

    try {
      await updateExpertStatusApi(selectedIds, newStatus);
      setApplications(current => current.map(app => app.selected ? { ...app, status: newStatus, selected: false } : app));
    } catch {
      setError('전문가 심사 상태를 변경하지 못했습니다.');
    }
  };

  const handleViewFile = async (expertId: number) => {
    try {
      const file = await getExpertLicenseFileApi(expertId);
      const fileUrl = URL.createObjectURL(file);
      window.open(fileUrl, '_blank', 'noopener,noreferrer');
      window.setTimeout(() => URL.revokeObjectURL(fileUrl), 60_000);
    } catch {
      setError('자격 증빙 서류를 불러오지 못했습니다.');
    }
  };

  return (
    <main className="max-w-[1100px] mx-auto bg-white rounded-2xl shadow-lg p-9 my-10">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 mb-1">공인노무사 회원가입 심사 및 승인</h2>
        <p className="text-xs text-slate-500">가입 신청한 공인노무사의 자격 정보를 검토하고 플랫폼 활동 권한을 일괄 또는 개별 승인합니다.</p>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <button 
            onClick={() => handleBatchStatus('승인완료')}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg font-bold text-xs hover:bg-slate-800">
            선택 승인
          </button>
          <button 
            onClick={() => handleBatchStatus('반려')}
            className="px-4 py-2 bg-white text-rose-500 border border-slate-300 rounded-lg font-bold text-xs hover:bg-slate-50">
            선택 반려
          </button>
        </div>
        <div>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="노무사 이름, 소속, 자격번호 검색"
            className="px-3 py-2 rounded-lg border border-slate-300 text-xs w-[260px]"
          />
        </div>
      </div>

      {error && <p className="mb-4 text-xs text-rose-600">{error}</p>}

      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <th className="p-3 w-10"><input type="checkbox" onChange={handleSelectAll} /></th>
              <th className="p-3">신청일시</th>
              <th className="p-3">이름</th>
              <th className="p-3">소속</th>
              <th className="p-3">자격 등록번호</th>
              <th className="p-3">자격증 사본</th>
              <th className="p-3">아이디(이메일)</th>
              <th className="p-3">심사 상태</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={8} className="p-8 text-center text-slate-500">불러오는 중...</td></tr>
            ) : visibleApplications.length === 0 ? (
              <tr><td colSpan={8} className="p-8 text-center text-slate-500">검색 결과가 없습니다.</td></tr>
            ) : visibleApplications.map((app) => (
              <tr key={app.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-3">
                  <input type="checkbox" checked={app.selected} onChange={() => handleSelectOne(app.id)} />
                </td>
                <td className="p-3 text-slate-500">{app.date}</td>
                <td className="p-3 font-bold text-slate-900">{app.name}</td>
                <td className="p-3 text-slate-700">{app.office}</td>
                <td className="p-3 text-slate-700">{app.license}</td>
                <td className="p-3">
                  <a href="#view" onClick={(e) => { e.preventDefault(); void handleViewFile(app.id); }} className="text-blue-600 hover:underline flex items-center gap-1">
                    <span>📄</span> {app.file} ↗
                  </a>
                </td>
                <td className="p-3 text-slate-500">{app.email}</td>
                <td className="p-3">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    app.status === '승인완료' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {app.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}