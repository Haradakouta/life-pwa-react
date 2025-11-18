import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MdEmail, MdLock, MdLogin } from 'react-icons/md';
import { FaGoogle } from 'react-icons/fa';
import { loginWithEmail, loginWithGoogle } from '../../utils/auth';
import { RegisterFlow } from './RegisterFlow';
import { PasswordResetFlow } from './PasswordResetFlow';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const { t } = useTranslation();
  const [showRegisterFlow, setShowRegisterFlow] = useState(false);
  const [showPasswordResetFlow, setShowPasswordResetFlow] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await loginWithEmail(email, password);
      if (result.error) {
        setError(result.error);
      } else {
        onLoginSuccess();
      }
    } catch (err: any) {
      setError(err.message || t('auth.authError'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await loginWithGoogle();
      if (result.error) {
        setError(result.error);
      } else {
        onLoginSuccess();
      }
    } catch (err: any) {
      setError(err.message || t('auth.authError'));
    } finally {
      setLoading(false);
    }
  };

  // 新規登録フロー表示
  if (showRegisterFlow) {
    return (
      <div className="login-screen">
        <div className="login-container">
          <div className="login-header">
            <h1>🥗💰 {t('auth.appName')}</h1>
            <p>{t('auth.register')}</p>
          </div>

          <RegisterFlow
            onBack={() => setShowRegisterFlow(false)}
          />
        </div>

        <style>{`
          .login-screen {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
            padding: 20px;
          }

          .login-container {
            background: var(--card);
            border-radius: 16px;
            padding: 40px;
            max-width: 500px;
            width: 100%;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          }

          .login-header {
            text-align: center;
            margin-bottom: 32px;
          }

          .login-header h1 {
            color: var(--text);
            font-size: 28px;
            margin: 0 0 8px 0;
          }

          .login-header p {
            color: var(--text-secondary);
            font-size: 14px;
            margin: 0;
          }
        `}</style>
      </div>
    );
  }

  // パスワードリセットフロー表示
  if (showPasswordResetFlow) {
    return (
      <div className="login-screen">
        <div className="login-container">
          <div className="login-header">
            <h1>🥗💰 {t('auth.appName')}</h1>
            <p>{t('auth.passwordReset')}</p>
          </div>

          <PasswordResetFlow
            onBack={() => setShowPasswordResetFlow(false)}
            onSuccess={() => setShowPasswordResetFlow(false)}
          />
        </div>

        <style>{`
          .login-screen {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
            padding: 20px;
          }

          .login-container {
            background: var(--card);
            border-radius: 16px;
            padding: 40px;
            max-width: 500px;
            width: 100%;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          }

          .login-header {
            text-align: center;
            margin-bottom: 32px;
          }

          .login-header h1 {
            color: var(--text);
            font-size: 28px;
            margin: 0 0 8px 0;
          }

          .login-header p {
            color: var(--text-secondary);
            font-size: 14px;
            margin: 0;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="login-screen">
      <div className="login-container">
        <div className="login-header">
          <h1>🥗💰 {t('auth.appName')}</h1>
          <p>{t('auth.appDescription')}</p>
        </div>

        <form onSubmit={handleEmailLogin} className="login-form">
          <div className="form-group">
            <label>
              <MdEmail /> {t('auth.email')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label>
              <MdLock /> {t('auth.password')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth.passwordPlaceholder')}
              minLength={6}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? t('auth.processing') : (
              <>
                <MdLogin /> {t('auth.login')}
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowPasswordResetFlow(true)}
            className="forgot-password-button"
          >
            {t('auth.forgotPassword')}
          </button>

          <button
            type="button"
            onClick={() => setShowRegisterFlow(true)}
            className="register-link-button"
          >
            {t('auth.noAccount')}
          </button>
        </form>

        <div className="divider">
          <span>{t('auth.or')}</span>
        </div>

        <button onClick={handleGoogleLogin} className="google-login-button" disabled={loading}>
          <FaGoogle /> {t('auth.googleLogin')}
        </button>

        <div className="login-footer">
          <p>
            {t('auth.securityNote')}
            <br />
            {t('auth.dataNote')}
          </p>
        </div>
      </div>

      <style>{`
        .login-screen {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
          padding: 20px;
        }

        .login-container {
          background: var(--card);
          border-radius: 16px;
          padding: 40px;
          max-width: 450px;
          width: 100%;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .login-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .login-header h1 {
          color: var(--text);
          font-size: 28px;
          margin: 0 0 8px 0;
        }

        .login-header p {
          color: var(--text-secondary);
          font-size: 14px;
          margin: 0;
        }

        .forgot-password-button,
        .register-link-button {
          background: none;
          border: none;
          color: var(--primary);
          font-size: 14px;
          cursor: pointer;
          padding: 12px;
          text-decoration: underline;
          transition: opacity 0.3s;
        }

        .forgot-password-button:hover,
        .register-link-button:hover {
          opacity: 0.8;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
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

        .info-message {
          padding: 12px;
          background: #e8f5e9;
          color: #2e7d32;
          border-radius: 8px;
          font-size: 14px;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        body.dark-mode .info-message {
          background: #1b5e20;
          color: #a5d6a7;
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

        .login-button,
        .google-login-button {
          padding: 14px 24px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .login-button {
          background: linear-gradient(135deg, var(--primary) 0%, #43a047 100%);
          color: white;
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
        }

        .login-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .google-login-button {
          background: white;
          color: #555;
          border: 2px solid #ddd;
        }

        .google-login-button:hover:not(:disabled) {
          background: #f5f5f5;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .google-login-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .divider {
          text-align: center;
          margin: 24px 0;
          position: relative;
        }

        .divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: var(--border);
        }

        .divider span {
          background: var(--card);
          padding: 0 16px;
          color: var(--text-secondary);
          font-size: 14px;
          position: relative;
          z-index: 1;
        }

        .login-footer {
          margin-top: 24px;
          text-align: center;
        }

        .login-footer p {
          color: var(--text-secondary);
          font-size: 12px;
          line-height: 1.6;
          margin: 0;
        }

        @media (max-width: 480px) {
          .login-container {
            padding: 24px;
          }

          .login-header h1 {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
};
