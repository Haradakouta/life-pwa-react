import React, { useState } from 'react';
import { MdEmail, MdLock, MdPerson, MdVerified, MdArrowBack } from 'react-icons/md';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { generateVerificationCode, saveVerificationCode, verifyCode, sendVerificationEmail } from '../../utils/emailVerification';
import { createUserProfile } from '../../utils/profile';

interface RegisterFlowProps {
  onBack: () => void;
}

type Step = 'email' | 'code' | 'profile';

export const RegisterFlow: React.FC<RegisterFlowProps> = ({ onBack }) => {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
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

      // Cloud Functionでメール送信
      await sendVerificationEmail(email, code);

      console.log('✅ 確認コードを送信しました:', email);

      // ステップ2へ
      setStep('code');
    } catch (err: any) {
      console.error('Email send error:', err);
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

      console.log('✅ 確認コードが正しいです');

      // ステップ3へ
      setStep('profile');
    } catch (err: any) {
      setError(err.message || '確認に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // ステップ3: ユーザー名・パスワード入力 → アカウント作成
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

    if (!username.trim()) {
      setError('ユーザー名を入力してください');
      return;
    }

    setLoading(true);

    try {
      // Firebase Authenticationでアカウント作成
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // ユーザー名を設定
      await updateProfile(user, {
        displayName: username,
      });

      // Firestoreにプロフィールを作成
      await createUserProfile(user.uid, email, username);

      console.log('✅ アカウント作成完了:', user.uid);

      // ログイン画面に戻る（自動的にログイン状態になる）
      onBack();
    } catch (err: any) {
      console.error('Registration error:', err);

      // エラーメッセージを日本語化
      let errorMessage = 'アカウント作成に失敗しました';
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'このメールアドレスは既に使用されています';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'メールアドレスの形式が正しくありません';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'パスワードが弱すぎます（6文字以上推奨）';
      }

      setError(errorMessage);
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
        <div className={`progress-step ${step === 'email' ? 'active' : ['code', 'profile'].includes(step) ? 'completed' : ''}`}>1</div>
        <div className="progress-line" />
        <div className={`progress-step ${step === 'code' ? 'active' : step === 'profile' ? 'completed' : ''}`}>2</div>
        <div className="progress-line" />
        <div className={`progress-step ${step === 'profile' ? 'active' : ''}`}>3</div>
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
            <MdPerson /> アカウント情報を設定
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

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'アカウント作成中...' : '登録完了'}
          </button>
        </form>
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
          border: 1px solid var(--border);
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
          background: var(--card);
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
      `}</style>
    </div>
  );
};
