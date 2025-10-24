import React, { useState } from 'react';
import { MdEmail, MdLock, MdPerson, MdVerified, MdSecurity, MdArrowBack } from 'react-icons/md';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { generateVerificationCode, saveVerificationCode, verifyCode, sendVerificationEmail } from '../../utils/emailVerification';

interface RegisterFlowProps {
  onComplete: () => void;
  onBack: () => void;
}

type Step = 'email' | 'code' | 'profile' | '2fa';

export const RegisterFlow: React.FC<RegisterFlowProps> = ({ onComplete, onBack }) => {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [enable2FA, setEnable2FA] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ステップ1: メールアドレス入力 → 確認コード送信
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 6桁のコードを生成
      const code = generateVerificationCode();

      // Firestoreに保存
      await saveVerificationCode(email, code);

      // メール送信（開発中はアラート表示）
      await sendVerificationEmail(email, code);

      // ステップ2へ
      setStep('code');
    } catch (err: any) {
      setError(err.message || '確認コードの送信に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // ステップ2: 確認コード検証
  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await verifyCode(email, inputCode);
      if (!result.valid) {
        setError(result.error || '確認コードが正しくありません');
        setLoading(false);
        return;
      }

      // ステップ3へ
      setStep('profile');
    } catch (err: any) {
      setError(err.message || '確認に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // ステップ3: ユーザー名・パスワード入力
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== passwordConfirm) {
      setError('パスワードが一致しません');
      return;
    }

    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください');
      return;
    }

    // ステップ4へ
    setStep('2fa');
  };

  // ステップ4: 二段階認証の設定 → アカウント作成
  const handleFinalSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // Firebase Authenticationでアカウント作成
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // ユーザー名を設定
      await updateProfile(user, {
        displayName: username,
      });

      // TODO: 二段階認証の設定（enable2FAがtrueの場合）
      if (enable2FA) {
        console.log('二段階認証を有効化（今後実装予定）');
      }

      // 登録完了
      onComplete();
    } catch (err: any) {
      setError(err.message || 'アカウント作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // コード再送信
  const handleResendCode = async () => {
    setLoading(true);
    setError('');

    try {
      const code = generateVerificationCode();
      await saveVerificationCode(email, code);
      await sendVerificationEmail(email, code);
      alert('確認コードを再送信しました！');
    } catch (err: any) {
      setError('再送信に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-flow">
      <div className="progress-bar">
        <div className={`progress-step ${step === 'email' ? 'active' : ['code', 'profile', '2fa'].includes(step) ? 'completed' : ''}`}>1</div>
        <div className="progress-line" />
        <div className={`progress-step ${step === 'code' ? 'active' : ['profile', '2fa'].includes(step) ? 'completed' : ''}`}>2</div>
        <div className="progress-line" />
        <div className={`progress-step ${step === 'profile' ? 'active' : step === '2fa' ? 'completed' : ''}`}>3</div>
        <div className="progress-line" />
        <div className={`progress-step ${step === '2fa' ? 'active' : ''}`}>4</div>
      </div>

      {/* ステップ1: メールアドレス入力 */}
      {step === 'email' && (
        <form onSubmit={handleEmailSubmit} className="step-form">
          <button type="button" onClick={onBack} className="back-button-small">
            <MdArrowBack /> 戻る
          </button>
          <h2>
            <MdEmail /> メールアドレスを入力
          </h2>
          <p className="step-description">確認コードを送信します</p>

          <div className="form-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
              autoFocus
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? '送信中...' : '確認コードを送信'}
          </button>
        </form>
      )}

      {/* ステップ2: 確認コード入力 */}
      {step === 'code' && (
        <form onSubmit={handleCodeSubmit} className="step-form">
          <h2>
            <MdVerified /> 確認コードを入力
          </h2>
          <p className="step-description">
            <strong>{email}</strong> 宛に送信された6桁のコードを入力してください
          </p>

          <div className="form-group">
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              className="code-input"
              required
              autoFocus
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="submit-button" disabled={loading || inputCode.length !== 6}>
            {loading ? '確認中...' : '確認'}
          </button>

          <button type="button" onClick={handleResendCode} className="link-button" disabled={loading}>
            コードを再送信
          </button>
        </form>
      )}

      {/* ステップ3: ユーザー名・パスワード入力 */}
      {step === 'profile' && (
        <form onSubmit={handleProfileSubmit} className="step-form">
          <h2>
            <MdPerson /> プロフィール設定
          </h2>
          <p className="step-description">ユーザー名とパスワードを設定してください</p>

          <div className="form-group">
            <label>
              <MdPerson /> ユーザー名
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="山田太郎"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>
              <MdLock /> パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6文字以上"
              minLength={6}
              required
            />
          </div>

          <div className="form-group">
            <label>
              <MdLock /> パスワード（確認）
            </label>
            <input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="もう一度入力"
              minLength={6}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="submit-button">
            次へ
          </button>
        </form>
      )}

      {/* ステップ4: 二段階認証の設定 */}
      {step === '2fa' && (
        <div className="step-form">
          <h2>
            <MdSecurity /> 二段階認証
          </h2>
          <p className="step-description">セキュリティを強化するため、二段階認証を設定できます</p>

          <div className="option-card">
            <div className="option-info">
              <h3>二段階認証とは？</h3>
              <p>
                ログイン時にパスワードに加えて、メールで送られる確認コードの入力が必要になります。
                不正アクセスを防ぎ、アカウントをより安全に保護できます。
              </p>
            </div>

            <label className="toggle-option">
              <input
                type="checkbox"
                checked={enable2FA}
                onChange={(e) => setEnable2FA(e.target.checked)}
              />
              <span className="toggle-slider"></span>
              <span className="toggle-label">
                {enable2FA ? '二段階認証を有効にする' : '二段階認証を無効にする'}
              </span>
            </label>

            <p className="small-text">※ 後から設定画面で変更できます</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button onClick={handleFinalSubmit} className="submit-button" disabled={loading}>
            {loading ? 'アカウント作成中...' : '登録完了'}
          </button>
        </div>
      )}

      <style>{`
        .register-flow {
          width: 100%;
        }

        .progress-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 40px;
        }

        .progress-step {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--border);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          transition: all 0.3s;
        }

        .progress-step.active {
          background: linear-gradient(135deg, var(--primary) 0%, #43a047 100%);
          color: white;
          transform: scale(1.1);
        }

        .progress-step.completed {
          background: var(--primary);
          color: white;
        }

        .progress-line {
          width: 60px;
          height: 2px;
          background: var(--border);
        }

        .step-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .back-button-small {
          align-self: flex-start;
          padding: 8px 16px;
          background: var(--background);
          border: none;
          border-radius: 6px;
          color: var(--text);
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.3s;
        }

        .back-button-small:hover {
          background: var(--border);
        }

        .step-form h2 {
          color: var(--text);
          font-size: 24px;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .step-form h2 svg {
          color: var(--primary);
        }

        .step-description {
          color: var(--text-secondary);
          margin: -8px 0 0 0;
          line-height: 1.5;
        }

        .step-description strong {
          color: var(--primary);
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          color: var(--text);
          font-size: 14px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .form-group label svg {
          color: var(--primary);
        }

        .form-group input {
          padding: 12px 16px;
          border: 2px solid var(--border);
          border-radius: 8px;
          font-size: 16px;
          background: var(--background);
          color: var(--text);
          transition: all 0.3s;
        }

        .form-group input:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
        }

        .code-input {
          font-size: 32px !important;
          text-align: center;
          letter-spacing: 8px;
          font-weight: 600;
        }

        .error-message {
          padding: 12px;
          background: #ffebee;
          color: #c62828;
          border-radius: 8px;
          font-size: 14px;
          text-align: center;
        }

        body.dark-mode .error-message {
          background: #b71c1c;
          color: #ffcdd2;
        }

        .submit-button {
          padding: 14px 24px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          background: linear-gradient(135deg, var(--primary) 0%, #43a047 100%);
          color: white;
          transition: all 0.3s;
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
        }

        .submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .link-button {
          background: none;
          border: none;
          color: var(--primary);
          font-size: 14px;
          cursor: pointer;
          padding: 8px;
          text-decoration: underline;
        }

        .link-button:hover:not(:disabled) {
          opacity: 0.8;
        }

        .link-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .option-card {
          background: var(--background);
          padding: 24px;
          border-radius: 12px;
          border: 2px solid var(--border);
        }

        .option-info h3 {
          color: var(--text);
          font-size: 18px;
          margin: 0 0 12px 0;
        }

        .option-info p {
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0 0 20px 0;
        }

        .toggle-option {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          padding: 12px 0;
        }

        .toggle-option input {
          display: none;
        }

        .toggle-slider {
          width: 50px;
          height: 26px;
          background: var(--border);
          border-radius: 13px;
          position: relative;
          transition: all 0.3s;
        }

        .toggle-slider::after {
          content: '';
          position: absolute;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          top: 3px;
          left: 3px;
          transition: all 0.3s;
        }

        .toggle-option input:checked + .toggle-slider {
          background: var(--primary);
        }

        .toggle-option input:checked + .toggle-slider::after {
          left: 27px;
        }

        .toggle-label {
          color: var(--text);
          font-weight: 500;
        }

        .small-text {
          color: var(--text-secondary);
          font-size: 12px;
          margin: 12px 0 0 0;
        }
      `}</style>
    </div>
  );
};
