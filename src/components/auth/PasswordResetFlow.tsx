import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdEmail, MdLock, MdVerified, MdArrowBack } from 'react-icons/md';
import {
  generateVerificationCode,
  saveVerificationCode,
  verifyCode,
  sendPasswordResetEmail,
  resetPasswordWithCode,
} from '../../utils/emailVerification';

interface PasswordResetFlowProps {
  onBack: () => void;
  onSuccess: () => void;
}

type Step = 'email' | 'code' | 'password';

export const PasswordResetFlow: React.FC<PasswordResetFlowProps> = ({ onBack, onSuccess }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

      // パスワードリセット用のメールを送信
      await sendPasswordResetEmail(email, code);

      console.log('✅ パスワードリセット用の確認コードを送信しました:', email);

      // ステップ2へ
      setStep('code');
    } catch (err: any) {
      console.error('Email send error:', err);
      setError(err.message || t('auth.passwordResetFlow.step1.sendFailed'));
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
        setError(result.error || t('auth.passwordResetFlow.step2.invalidCode'));
        setLoading(false);
        return;
      }

      console.log('✅ 確認コードが正しいです');

      // ステップ3へ
      setStep('password');
    } catch (err: any) {
      setError(err.message || t('auth.passwordResetFlow.step2.verifyFailed'));
    } finally {
      setLoading(false);
    }
  };

  // ステップ3: 新しいパスワード入力 → パスワード更新
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError(t('auth.passwordResetFlow.step3.passwordMismatch'));
      return;
    }

    if (newPassword.length < 6) {
      setError(t('auth.passwordResetFlow.step3.passwordTooShort'));
      return;
    }

    setLoading(true);

    try {
      // Cloud Functionでパスワードをリセット
      const result = await resetPasswordWithCode(email, newPassword);

      if (!result.success) {
        setError(result.error || t('auth.passwordResetFlow.step3.updateFailed'));
        setLoading(false);
        return;
      }

      console.log('✅ パスワードのリセットが完了しました');
      alert(t('auth.passwordResetFlow.step3.updateSuccess'));

      // ログイン画面に戻る
      onSuccess();
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err.message || t('auth.passwordResetFlow.step3.updateFailed'));
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
      await sendPasswordResetEmail(email, code);
      alert(t('auth.passwordResetFlow.step2.resendSuccess'));
    } catch (err: any) {
      setError(t('auth.passwordResetFlow.step2.resendFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="password-reset-flow">
      <div className="progress-bar">
        <div className={`progress-step ${step === 'email' ? 'active' : ['code', 'password'].includes(step) ? 'completed' : ''}`}>1</div>
        <div className="progress-line" />
        <div className={`progress-step ${step === 'code' ? 'active' : step === 'password' ? 'completed' : ''}`}>2</div>
        <div className="progress-line" />
        <div className={`progress-step ${step === 'password' ? 'active' : ''}`}>3</div>
      </div>

      {/* ステップ1: メールアドレス入力 */}
      {step === 'email' && (
        <form onSubmit={handleEmailSubmit} className="step-form">
          <button type="button" onClick={onBack} className="back-button-small">
            <MdArrowBack /> {t('auth.passwordResetFlow.back')}
          </button>
          <h2>
            <MdEmail /> {t('auth.passwordResetFlow.step1.title')}
          </h2>
          <p className="step-description">{t('auth.passwordResetFlow.step1.description')}</p>

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
            {loading ? t('auth.passwordResetFlow.step1.sending') : t('auth.passwordResetFlow.step1.sendCode')}
          </button>
        </form>
      )}

      {/* ステップ2: 確認コード入力 */}
      {step === 'code' && (
        <form onSubmit={handleCodeSubmit} className="step-form">
          <h2>
            <MdVerified /> {t('auth.passwordResetFlow.step2.title')}
          </h2>
          <p className="step-description">
            {t('auth.passwordResetFlow.step2.description', { email })}
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
            {loading ? t('auth.passwordResetFlow.step2.verifying') : t('auth.passwordResetFlow.step2.verify')}
          </button>

          <button type="button" onClick={handleResendCode} className="link-button" disabled={loading}>
            {t('auth.passwordResetFlow.step2.resend')}
          </button>
        </form>
      )}

      {/* ステップ3: 新しいパスワード入力 */}
      {step === 'password' && (
        <form onSubmit={handlePasswordSubmit} className="step-form">
          <h2>
            <MdLock /> {t('auth.passwordResetFlow.step3.title')}
          </h2>
          <p className="step-description">{t('auth.passwordResetFlow.step3.description')}</p>

          <div className="form-group">
            <label>
              <MdLock /> {t('auth.passwordResetFlow.step3.newPassword')}
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={t('auth.passwordPlaceholder')}
              minLength={6}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>
              <MdLock /> {t('auth.passwordResetFlow.step3.confirmPassword')}
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('auth.passwordPlaceholder')}
              minLength={6}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? t('auth.passwordResetFlow.step3.updating') : t('auth.passwordResetFlow.step3.update')}
          </button>
        </form>
      )}

      <style>{`
        .password-reset-flow {
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
