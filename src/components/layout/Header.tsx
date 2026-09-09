import { Link } from 'react-router-dom'

function Header() {
  return (
    <header>
      <nav>
        <Link to="/">Work Helper</Link>
        <Link to="/cases">사건 관리</Link>
        <Link to="/consultation">AI 상담</Link>
        <Link to="/petition">진정서</Link>
        <Link to="/community">커뮤니티</Link>
        <Link to="/login">로그인</Link>
      </nav>
    </header>
  )
}

export default Header
