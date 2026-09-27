import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { checkEmailAvailabilityApi, signupApi } from '../api/authApi';

const passwordPolicy = /^(?=.*[A-Za-z])(?=.*\d)\S{8,}$/;
const maxLicenseFileSize = 10 * 1024 * 1024;
const allowedLicenseFileTypes = ['application/pdf', 'image/jpeg', 'image/png'];

export default function SignupForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialType = searchParams.get('type') === 'expert' ? 'expert' : 'user';
  
  const [signupType, setSignupType] = useState<'user' | 'expert'>(initialType);
  const [email, setEmail] = useState('');
  const [emailCheckStatus, setEmailCheckStatus] = useState<'idle' | 'checking' | 'available' | 'duplicate'>('idle');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  
  // 노무사 전용 입력값
  const [office, setOffice] = useState('');
  const [licenseNo, setLicenseNo] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [ethicsAgreed, setEthicsAgreed] = useState(false);
  const passwordIsInvalid = password.length > 0 && !passwordPolicy.test(password);
  const passwordsDoNotMatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleCheckEmail = async () => {
    if (!email || !email.includes('@')) {
      alert('올바른 이메일을 입력해주세요.');
      return;
    }

    setEmailCheckStatus('checking');
    try {
      const isAvailable = await checkEmailAvailabilityApi(email);
      setEmailCheckStatus(isAvailable ? 'available' : 'duplicate');
    } catch {
      setEmailCheckStatus('idle');
      alert('이메일 중복확인 중 오류가 발생했습니다.');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordPolicy.test(password)) {
      alert('비밀번호는 영문과 숫자를 포함해 8자 이상이어야 합니다.');
      return;
    }
    if (password !== confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (emailCheckStatus !== 'available') {
      alert(emailCheckStatus === 'duplicate'
        ? '이미 가입된 이메일입니다.'
        : '이메일 중복확인을 진행해주세요.');
      return;
    }
    if (signupType === 'expert' && (!file || fileError)) {
      alert(fileError || '자격 증빙 서류를 첨부해주세요.');
      return;
    }
    if (!termsAgreed) {
      alert('WorkHelper 이용약관 및 개인정보처리방침에 동의해주세요.');
      return;
    }
    if (signupType === 'expert' && !ethicsAgreed) {
      alert('공인노무사 윤리강령 준수 및 허위 정보 등록 시 법적 책임에 동의해주세요.');
      return;
    }

    try {
      await signupApi({
        email,
        password,
        name,
        role: signupType === 'expert' ? 'EXPERT' : 'USER',
        office,
        licenseNo,
        certificateFile: file,
      });
      alert(signupType === 'expert' ? '가입 신청이 완료되었습니다. 관리자 승인을 기다려주세요.' : '회원가입이 완료되었습니다.');
      navigate('/login');
    } catch {
      alert('회원가입 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="w-[560px] bg-white rounded-2xl shadow-lg p-9">
      <h2 className="text-lg font-bold text-slate-900 text-center mb-5">통합 회원가입 폼</h2>
      
      <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
        <button 
          type="button"
          onClick={() => setSignupType('user')}
          className={`flex-1 py-2.5 rounded-md font-bold text-xs transition ${signupType === 'user' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
          일반 근로자 회원
        </button>
        <button 
          type="button"
          onClick={() => setSignupType('expert')}
          className={`flex-1 py-2.5 rounded-md font-bold text-xs transition ${signupType === 'expert' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}>
          공인노무사(전문가) 회원
        </button>
      </div>

      <form onSubmit={handleSignup} className="flex flex-col gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">이메일 (아이디) <span className="text-rose-500">*</span></label>
          <div className="flex gap-2">
            <input 
              type="email" 
              placeholder="example@email.com" 
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailCheckStatus('idle');
              }}
              className="flex-1 p-2.5 rounded-lg border border-slate-300 text-xs"
              required
            />
            <button
              type="button"
              onClick={() => void handleCheckEmail()}
              disabled={emailCheckStatus === 'checking'}
              className="px-4 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-100 disabled:opacity-50"
            >
              {emailCheckStatus === 'checking' ? '확인 중...' : '중복확인'}
            </button>
          </div>
          {emailCheckStatus === 'available' && <p className="mt-1 text-[11px] text-emerald-600">사용 가능한 이메일입니다.</p>}
          {emailCheckStatus === 'duplicate' && <p className="mt-1 text-[11px] text-rose-600">이미 가입된 이메일입니다.</p>}
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">비밀번호 <span className="text-rose-500">*</span></label>
          <input 
            type="password" 
            placeholder="영문, 숫자 포함 8자 이상" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              pattern="(?=.*[A-Za-z])(?=.*[0-9])\S{8,}"
              title="영문과 숫자를 포함해 8자 이상 입력하세요."
              className={`w-full p-2.5 rounded-lg border text-xs ${passwordIsInvalid ? 'border-rose-500' : 'border-slate-300'}`}
            required
          />
            {passwordIsInvalid && <p className="mt-1 text-[11px] text-rose-600">영문과 숫자를 포함해 8자 이상 입력하세요.</p>}
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">비밀번호 확인 <span className="text-rose-500">*</span></label>
          <input 
            type="password" 
            placeholder="비밀번호를 한 번 더 입력하세요" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full p-2.5 rounded-lg border text-xs ${passwordsDoNotMatch ? 'border-rose-500' : 'border-slate-300'}`}
            required
          />
            {passwordsDoNotMatch && <p className="mt-1 text-[11px] text-rose-600">비밀번호가 일치하지 않습니다.</p>}
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">성명 <span className="text-rose-500">*</span></label>
          <input 
            type="text" 
            placeholder="이름(실명)을 입력하세요" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-slate-300 text-xs"
            required
          />
        </div>

        {signupType === 'expert' && (
          <div className="bg-slate-50 border border-dashed border-slate-400 rounded-xl p-4 flex flex-col gap-3">
            <div className="text-xs font-bold text-slate-900">공인노무사 자격 정보</div>
            <div className="text-[11px] text-slate-500">전문가 자격 검증을 위한 필수 정보를 정확히 입력해주세요.</div>
            
            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">소속 법인 / 사무소 <span className="text-rose-500">*</span></label>
              <input 
                type="text" 
                placeholder="예: 노무법인 한결, 개인사무소 등" 
                value={office}
                onChange={(e) => setOffice(e.target.value)}
                className="w-full p-2 rounded-md border border-slate-300 text-xs bg-white"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">공인노무사 자격 등록번호 <span className="text-rose-500">*</span></label>
              <input 
                type="text" 
                placeholder="예: 제12345호" 
                value={licenseNo}
                onChange={(e) => setLicenseNo(e.target.value)}
                className="w-full p-2 rounded-md border border-slate-300 text-xs bg-white"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-700 block mb-1">자격 증빙 서류 첨부 <span className="text-rose-500">*</span></label>
              <div className="border border-slate-300 rounded-lg p-3 text-center bg-white">
                <input 
                  type="file" 
                  accept=".pdf,.jpg,.png"
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0];
                    if (!selectedFile) {
                      setFile(null);
                      setFileError('');
                      return;
                    }

                    if (selectedFile.size > maxLicenseFileSize) {
                      e.currentTarget.value = '';
                      setFile(null);
                      setFileError('파일 크기는 10MB 이하만 첨부할 수 있습니다.');
                      return;
                    }

                    if (!allowedLicenseFileTypes.includes(selectedFile.type)) {
                      e.currentTarget.value = '';
                      setFile(null);
                      setFileError('PDF, JPG, PNG 파일만 첨부할 수 있습니다.');
                      return;
                    }

                    setFile(selectedFile);
                    setFileError('');
                  }}
                  className="text-[11px] mb-1"
                  required
                />
                <div className="text-[10px] text-slate-500">자격증 또는 직무개시등록증 사본 (PDF, JPG, PNG / 최대 10MB)</div>
                {fileError && <div className="mt-1 text-[10px] text-rose-600">{fileError}</div>}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2 text-xs text-slate-700 mt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={termsAgreed} onChange={(e) => setTermsAgreed(e.target.checked)} />
            <span>[필수] WorkHelper 이용약관 및 개인정보처리방침 동의</span>
          </label>
          {signupType === 'expert' && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={ethicsAgreed} onChange={(e) => setEthicsAgreed(e.target.checked)} />
              <span>[필수] 공인노무사 윤리강령 준수 및 허위 정보 등록 시 법적 책임 동의</span>
            </label>
          )}
        </div>

        <button type="submit" className="w-full py-3 bg-slate-900 text-white rounded-lg font-bold text-xs mt-2 hover:bg-slate-800 transition">
          {signupType === 'expert' ? '가입 신청서 제출 (승인 대기)' : '회원가입 완료'}
        </button>
      </form>
    </div>
  );
}