import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getLegalDocumentDetail, searchLegalDocuments } from '@/features/legal/api/legalApi'
import type { LegalDocumentDetail, LegalDocumentSummary } from '@/features/legal/types/legalDocument'

function SiteHeader() {
  return <><div className="utility-bar"><span>대한민국 근로자를 위한 고용·노동 법률 서비스 플랫폼</span><span>로그인　|　회원가입　|　고객센터</span></div><header className="site-header"><Link className="site-brand" to="/"><b>W</b><strong>WorkHelper</strong></Link><nav><Link to="/legal-documents">AI 법률상담</Link><Link to="/cases/1/evidences">서류 분석/OCR</Link><span>진정서 작성</span><span>내 사건 관리</span><Link to="/expert-qna">전문가 Q&amp;A</Link></nav><button className="all-menu">▣　전체메뉴</button></header></>
}

function SiteFooter() {
  return <footer className="site-footer"><div className="footer-inner"><div><div className="footer-links"><strong>이용약관</strong><a href="#privacy">개인정보처리방침</a><a href="#email">이메일무단수집거부</a><a href="#sitemap">찾아오시는 길</a></div><p>(우) 04520 서울특별시 중구 청계천로 8 고용노동복지센터　/ 대표번호: 1544-0000<br />상담가능시간: 평일 09시 ~ 오후 6시 (토/일요일, 공휴일 휴무)<br />워크헬퍼는 법률 전문가의 공식적인 의견을 대신하지 않습니다.</p><small>Copyright © WorkHelper. All Rights Reserved.</small></div><span className="policy-mark">●　공공 정보 보안 규격 준수</span></div></footer>
}

export function LegalPage() {
  const [query, setQuery] = useState('')
  const [sourceType, setSourceType] = useState('')
  const [sort, setSort] = useState('relevance')
  const [items, setItems] = useState<LegalDocumentSummary[]>([])
  const [detail, setDetail] = useState<LegalDocumentDetail | null>(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function search() {
    if (!query.trim()) { setMessage('검색어를 입력해주세요.'); return }
    setLoading(true)
    try { const result = await searchLegalDocuments(query, sourceType, page); setItems(result.content ?? []); setTotalPages(result.totalPages ?? 0); setMessage('') }
    catch { setMessage('법률자료를 불러오지 못했습니다. 백엔드 연결을 확인해주세요.') }
    finally { setLoading(false) }
  }

  useEffect(() => { if (query) void search() }, [page])
  useEffect(() => {
    const relevanceOption = document.querySelector<HTMLSelectElement>('.legal-toolbar select option[value="relevance"]')
    if (relevanceOption) relevanceOption.textContent = '정확도순'
  })

  const sortedItems = [...items].sort((left, right) => {
    if (sort === 'title') return left.title.localeCompare(right.title, 'ko')
    if (sort === 'latest') {
      const leftDate = String(left.metadata?.publishedAt || left.metadata?.createdAt || left.metadata?.syncedAt || '')
      const rightDate = String(right.metadata?.publishedAt || right.metadata?.createdAt || right.metadata?.syncedAt || '')
      return rightDate.localeCompare(leftDate)
    }
    return 0
  })

  return <div className="site-page"><SiteHeader /><section className="page-banner"><div className="container"><p className="breadcrumb">홈　&gt;　노동 상담 가이드　&gt;　법률자료 검색</p><h1>노동법 판례 및 고용노동부 행정해석 검색</h1><p>근로기준법 주요 법령과 판례를 검색하고 필요한 근거를 확인해보세요.</p></div></section><main className="container legal-main"><div className="wide-search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { setPage(0); void search() } }} placeholder="사건번호, 판례 키워드, 또는 질의 내용을 입력하세요" /><button onClick={() => { setPage(0); void search() }}>→</button></div><div className="legal-toolbar"><div className="filter-tabs"><button className={sourceType === '' ? 'active' : ''} onClick={() => setSourceType('')}>전체</button><button className={sourceType === 'LAW' ? 'active' : ''} onClick={() => setSourceType('LAW')}>법령 판례</button><button className={sourceType === 'INTERPRETATION' ? 'active' : ''} onClick={() => setSourceType('INTERPRETATION')}>고용노동부 행정해석</button><button className={sourceType === 'LABOR_COMMISSION' ? 'active' : ''} onClick={() => setSourceType('LABOR_COMMISSION')}>노동위원회 판정례</button></div><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="relevance">정확도순⌄</option><option value="latest">최신순</option><option value="title">제목순</option></select></div>{message && <p className="notice">{message}</p>}<p className="result-count">▣　{items.length ? `${items.length}건의 판례 및 행정해석이 검색되었습니다.` : '검색어를 입력하면 검색 결과가 표시됩니다.'}</p><section className="legal-list search-results">{loading ? <div className="empty-state">검색 중입니다.</div> : sortedItems.length === 0 ? <div className="empty-state"><strong>검색 결과가 없습니다.</strong><span>사건과 관련된 키워드로 검색해보세요.</span></div> : sortedItems.map((item) => <article className="legal-card" key={item.legalDocumentId} onClick={() => void getLegalDocumentDetail(item.legalDocumentId).then(setDetail).catch(() => setMessage('상세 자료를 불러오지 못했습니다.'))}><div><span className="source-tag">{item.sourceType || '고용노동부 행정해석'}</span><h3>{item.title}</h3><p>{item.snippet || item.sourceUrl || '근로기준법 관련 주요 판례 및 행정해석 자료입니다.'}</p><div className="tag-row"><span>#근로기준법</span><span>#퇴직금</span><span>#사건자료</span></div></div><time>{String(item.metadata?.publishedAt || item.metadata?.createdAt || item.metadata?.syncedAt || '').slice(0, 10) || '-'}</time><a href="#detail">원문 보기　›</a></article>)}</section>{totalPages > 1 && <div className="pagination"><button disabled={page === 0} onClick={() => setPage(page - 1)}>‹</button><b>{page + 1}</b><span>2</span><span>3</span><span>4</span><button disabled={page + 1 >= totalPages} onClick={() => setPage(page + 1)}>다음 ›</button></div>}</main><SiteFooter />{detail && <div className="modal-backdrop" onClick={() => setDetail(null)}><section className="detail-modal legal-detail" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setDetail(null)}>×</button><span className="source-tag">{detail.sourceType}</span><h2>{detail.title}</h2><p className="full-text">{detail.fullText}</p>{detail.sourceUrl && <a href={detail.sourceUrl} target="_blank" rel="noreferrer">원문 열기 ↗</a>}</section></div>}</div>
}
