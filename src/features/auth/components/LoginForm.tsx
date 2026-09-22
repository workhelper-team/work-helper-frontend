import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginApi } from '../api/authApi';
import { useAuthStore } from '../store/useAuthStore';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const data = await loginApi({ email, password });
      setAuth(data.accessToken, data.user);
      navigate('/');
    } catch {
      alert('로그인 정보가 일치하지 않습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-[480px] bg-white rounded-2xl shadow-lg p-9 relative">
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-slate-800 text-white rounded-md flex justify-center items-center font-bold text-sm">W</div>
          <span className="font-bold text-slate-800 text-base">WorkHelper</span>
        </div>
      </div>

      <h2 className="text-xl font-bold text-slate-900 text-center mb-2">로그인 / 회원가입</h2>
      <p className="text-xs text-slate-500 text-center mb-7">WorkHelper의 노동 법률 상담 및 사건 관리 서비스를 이용하세요.</p>

      <form onSubmit={handleLogin} className="mb-6">
        <label className="text-xs font-semibold text-slate-700 block mb-1.5">아이디 로그인</label>
        <div className="relative mb-3">
          <input 
            type="email" 
            placeholder="아이디 (이메일)" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full py-3 px-3 pl-9 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-slate-800"
            required
          />
          <span className="absolute left-3 top-3.5 text-slate-400 text-sm">✉</span>
        </div>
        <div className="relative mb-4">
          <input 
            type={showPassword ? "text" : "password"}
            placeholder="비밀번호" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full py-3 px-3 pl-9 pr-9 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-slate-800"
            required
          />
          <span className="absolute left-3 top-3.5 text-slate-400 text-sm">🔒</span>
          <button 
            type="button" 
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-slate-400 text-sm">
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>

        <button type="submit" disabled={isSubmitting} className="w-full py-3.5 bg-slate-900 text-white rounded-lg font-bold text-sm hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed">
          {isSubmitting ? '로그인 중...' : '로그인'}
        </button>
      </form>

      <div className="border-t border-slate-200 pt-5 flex flex-col gap-2.5">
        <p className="text-center text-xs text-slate-500 mb-1">아직 계정이 없으신가요?</p>
        
        <div 
          onClick={() => navigate('/signup?type=user')}
          className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 transition">
          <div className="flex items-center gap-3">
            <div className="bg-slate-200 p-2 rounded-md text-sm">👤</div>
            <div>
              <div className="font-bold text-xs text-slate-900">일반 근로자 회원가입</div>
              <div className="text-[11px] text-slate-500">AI 상담 및 진정서 작성</div>
            </div>
          </div>
          <span className="text-slate-400">&gt;</span>
        </div>

        <div 
          onClick={() => navigate('/signup?type=expert')}
          className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 transition">
          <div className="flex items-center gap-3">
            <div className="bg-slate-200 p-2 rounded-md text-sm">⚖️</div>
            <div>
              <div className="font-bold text-xs text-slate-900">공인노무사(전문가) 회원가입</div>
              <div className="text-[11px] text-rose-600">자격 심사 필요</div>
            </div>
          </div>
          <span className="text-slate-400">&gt;</span>
        </div>
      </div>
    </div>
  );
}