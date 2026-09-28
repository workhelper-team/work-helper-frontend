import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

export default function WorkHelperDashboard() {
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState<string>('');
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const currentUser = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const isLoggedIn = Boolean(currentUser);
  const navigate = useNavigate();

  const popularKeywords = ['#임금체불', '#주휴수당', '#부당해고', '#퇴직금미지급', '#직장내괴롭힘'];

  const handleSearch = (keyword: string) => {
    if (!keyword || keyword.trim().length < 2) {
      alert('검색어는 2글자 이상 입력해주세요.');
      return;
    }
    console.log(`[API 호출] 법률자료 검색: /api/legal-documents?keyword=${keyword}`);
    setActiveModal('legal-search');
  };

  const startAIConsultation = async () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    try {
      console.log('[API 호출] POST /api/cases - 새 상담 사건 생성');
      const mockCaseId = 'case-' + Date.now();
      setActiveCaseId(mockCaseId);
      setChatMessages([{ sender: 'ai', text: '안녕하세요! 공인노무사 AI 도우미 WorkHelper입니다. 어떤 노동 법률 문제로 도움이 필요하신가요?' }]);
      setActiveModal('ai-chat');
    } catch (error) {
      console.error(error);
    }
  };

  const sendAIMessage = async () => {
    if (!chatInput.trim() || !activeCaseId) return;
    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');

    console.log(`[API 호출] POST /api/cases/${activeCaseId}/messages`);
    setTimeout(() => {
      setChatMessages(prev => [...prev, { 
        sender: 'ai', 
        text: `입력하신 "${userMsg}" 내용에 대해 검토한 결과, 근로기준법 제반 조항에 의거하여 구제 신청이 가능할 수 있습니다. 증빙 자료를 업로드하시면 더 정확한 분석이 가능합니다.` 
      }]);
    }, 1000);
  };

  const handleMyCasesClick = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    console.log('[API 호출] GET /api/cases - 내 사건 목록 조회');
    setActiveModal('cases');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* GNB (상단 내비게이션 바) */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 text-white font-bold p-2 rounded-lg flex items-center justify-center">W</div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900">WorkHelper</span>
              <span className="hidden md:inline-block ml-2 text-xs text-slate-500 border-l pl-2 border-slate-300">대한민국 근로자를 위한 공공 노동 법 서비스 포털</span>
            </div>
          </div>
          <nav className="hidden lg:flex items-center space-x-6 text-sm font-medium text-slate-600">
            <button onClick={() => setActiveModal('ai-chat')} className="hover:text-blue-600 transition">AI 법률상담</button>
            <button onClick={() => setActiveModal('ocr')} className="hover:text-blue-600 transition">서류 분석/OCR</button>
            <button onClick={() => setActiveModal('ai-chat')} className="hover:text-blue-600 transition">진정서 작성</button>
            <button onClick={handleMyCasesClick} className="hover:text-blue-600 transition">내 사건 관리</button>
            <button onClick={() => setActiveModal('expert-guide')} className="hover:text-blue-600 transition">노무사 1:1 상담</button>
          </nav>
          <div className="flex items-center space-x-3">
            {isLoggedIn ? (
              <div className="flex items-center space-x-2 text-sm">
                {currentUser?.role === 'ADMIN' && (
                  <button
                    onClick={() => navigate('/admin/experts')}
                    className="text-xs bg-slate-900 text-white hover:bg-slate-700 px-3 py-1.5 rounded transition"
                  >
                    관리자 페이지
                  </button>
                )}
                <span className="font-semibold text-slate-700">{currentUser?.name || '홍길동'}님</span>
                <button onClick={clearAuth} className="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded text-slate-600">로그아웃</button>
              </div>
            ) : (
              <>
                <button onClick={() => navigate('/login')} className="flex items-center space-x-1 text-sm text-slate-600 hover:text-blue-600 px-3 py-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>
                  <span>로그인</span>
                </button>
                <button onClick={() => navigate('/signup')} className="flex items-center space-x-1 text-sm bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg shadow-sm transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                  <span>회원가입</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 메인 히어로 섹션 */}
      <section className="bg-gradient-to-b from-blue-50/60 to-white py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-100">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full mb-4">
            정부 지원 표준 가이드 준수
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            근로자를 위한 쉽고 빠른 법률 도우미, WorkHelper
          </h1>
          <p className="text-base sm:text-lg text-slate-600 mb-8">
            어려운 노동법과 복잡한 진정서 작성, 이제 인공지능과 노무 전문가의 지원으로 바로 해결하세요.
          </p>

          <div className="relative max-w-2xl mx-auto mb-4">
            <div className="flex items-center bg-white rounded-full shadow-lg border border-slate-200 px-4 py-2">
              <svg className="w-5 h-5 text-slate-400 mr-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input 
                type="text" 
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchKeyword)}
                placeholder="도움이 필요한 노동 분쟁 또는 법률 키워드를 검색해보세요 (예: 주휴수당, 부당해고)"
                className="w-full focus:outline-none text-slate-700 placeholder-slate-400 text-sm sm:text-base"
              />
              <button 
                onClick={() => handleSearch(searchKeyword)}
                className="bg-slate-900 hover:bg-blue-600 text-white p-2.5 rounded-full transition ml-2 flex-shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
            <span className="text-slate-500 mr-2 font-medium">자주 찾는 키워드</span>
            {popularKeywords.map((tag, idx) => (
              <button 
                key={idx} 
                onClick={() => { setSearchKeyword(tag.replace('#', '')); handleSearch(tag.replace('#', '')); }}
                className="bg-white border border-slate-200 hover:border-blue-500 text-slate-700 hover:text-blue-600 px-3 py-1 rounded-full shadow-xs transition text-xs sm:text-sm font-medium"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 5종 핵심 바로가기 아이콘 메뉴 */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 mb-16">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 bg-white p-6 rounded-2xl shadow-md border border-slate-100">
          {[
            { title: 'AI 상담 시작', action: startAIConsultation, svg: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg> },
            { title: '서류 OCR 분석', action: () => setActiveModal('ocr'), svg: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg> },
            { title: '진정서 자동작성', action: startAIConsultation, svg: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg> },
            { title: '내 사건 조회', action: handleMyCasesClick, svg: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg> },
            { title: '노무 상담 가이드', action: () => setActiveModal('expert-guide'), svg: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z"/></svg> },
          ].map((item, idx) => (
            <button 
              key={idx}
              onClick={item.action}
              className="flex flex-col items-center justify-center p-4 rounded-xl hover:bg-blue-50/50 transition group text-center"
            >
              <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 group-hover:border-blue-500 group-hover:bg-blue-50 flex items-center justify-center text-slate-600 group-hover:text-blue-600 mb-3 transition shadow-xs">
                {item.svg}
              </div>
              <span className="text-xs sm:text-sm font-semibold text-slate-700 group-hover:text-blue-700">{item.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 하단 스마트 솔루션 섹션 */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">스마트 맞춤형 노동 법률 솔루션</h2>
          <p className="text-sm text-slate-500">어려운 공문서 작성과 복잡한 해석도 똑똑한 비서처럼 즉시 도와드립니다.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 rounded-2xl shadow-md flex flex-col justify-between relative overflow-hidden">
            <div>
              <span className="inline-block bg-blue-500/30 text-blue-300 text-xs font-semibold px-2.5 py-1 rounded mb-3">V1 · AI 자동응답</span>
              <h3 className="text-xl font-bold mb-2">복잡한 노동법, AI와 대화하며 해결하세요</h3>
              <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                임금체불, 해고예고 등 헷갈리는 노동 기준법 정보를 카카오톡처럼 친근한 AI 상담 챗봇을 통해 실시간으로 24시간 언제든 가이드 받으실 수 있습니다.
              </p>
            </div>
            <button 
              onClick={startAIConsultation}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition w-fit shadow-sm"
            >
              상담 시작하기 &rarr;
            </button>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-200 flex flex-col justify-between">
            <div>
              <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-1 rounded mb-3">공식 서식 에디터</span>
              <h3 className="text-xl font-bold text-slate-900 mb-2">증빙 서류만 올리면 공문서 규격 진정서 완성</h3>
              <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                근로계약서, 임금내역서 등 캡처본이나 사진만 업로드하세요. 지능형 문장 분석을 통해 공식 양식에 맞춘 고용노동부 진정서가 완성됩니다.
              </p>
            </div>
            <button 
              onClick={startAIConsultation}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium px-5 py-2.5 rounded-lg text-sm transition w-fit border border-slate-300"
            >
              진정서 작성하기 &rarr;
            </button>
          </div>
        </div>
      </section>

      {/* 주요 노동 권익 안내 */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">주요 노동 권익 안내</h2>
          <p className="text-sm text-slate-500">근로자 권익 보호를 위해 고용노동부 주요 법령에 기초한 핵심 가이드를 제공합니다.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: '임금/퇴직금', desc: '체불임금 해결을 위한 구제 절차와 퇴직금 계산법을 한눈에 알아보세요.' },
            { title: '근로시간/휴일', desc: '주휴수당 지급 대상 요건 및 연차휴가 대체에 대한 올바른 행정 가이드' },
            { title: '해고/징계', desc: '부당해고 시 지방노동위원회 구제신청 정당성 인정요건 및 준비 프로세스' },
            { title: '직장 내 괴롭힘', desc: '괴롭힘 유형별 입증 방법 및 사실관계 조사를 위한 구체적 서류 기록 팁' },
          ].map((card, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 hover:shadow-md transition flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base mb-2">{card.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">{card.desc}</p>
              </div>
              <button 
                onClick={() => handleSearch(card.title)} 
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center"
              >
                자세히 보기 <svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* AI 상담 모달 */}
      {activeModal === 'ai-chat' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl flex flex-col h-[600px] overflow-hidden">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                <span className="font-bold text-sm">WorkHelper AI 법률 상담 (대상: AI)</span>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
              {chatMessages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-xl text-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-xs' : 'bg-white text-slate-800 border border-slate-200 shadow-xs rounded-bl-xs'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2">
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendAIMessage()}
                placeholder="궁금한 내용을 입력하세요..."
                className="flex-1 border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
              <button onClick={sendAIMessage} className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-lg transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 로그인 모달 */}
      {activeModal === 'login' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
            <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
            <h3 className="text-xl font-bold text-slate-900 mb-6">로그인 / 회원가입</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">이메일 계정</label>
                <input type="email" placeholder="user@workhelper.kr" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">비밀번호</label>
                <input type="password" placeholder="••••••••" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <button 
                onClick={() => navigate('/login')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium text-sm transition shadow-sm"
              >
                로그인 (API: /api/auth/login)
              </button>
              <div className="text-center text-xs text-slate-500 mt-4">
                아직 계정이 없으신가요? <button onClick={() => alert('POST /api/auth/signup 연결')} className="text-blue-600 font-medium">일반 회원가입</button> 또는 <button onClick={() => alert('POST /api/auth/expert-signup 연결')} className="text-blue-600 font-medium">노무사 신청</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}