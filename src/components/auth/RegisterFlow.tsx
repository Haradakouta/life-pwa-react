import React, { useState } from 'react';
import { MdEmail, MdLock, MdPerson, MdVerified, MdArrowBack, MdHealthAndSafety, MdLocationOn } from 'react-icons/md';
import { prefectures } from '../../types/prefecture';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { generateVerificationCode, saveVerificationCode, verifyCode, sendVerificationEmail } from '../../utils/emailVerification';
import { createUserProfile } from '../../utils/profile';
import { useSettingsStore } from '../../store';

interface RegisterFlowProps {
  onBack: () => void;
}

type Step = 'email' | 'code' | 'profile' | 'health' | 'prefecture';

export const RegisterFlow: React.FC<RegisterFlowProps> = ({ onBack }) => {
  const { updateSettings, settings } = useSettingsStore();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [savings, setSavings] = useState(''); // 貯金額
  const [prefecture, setPrefecture] = useState('');
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
    } catch (err: unknown) {
      console.error('Email send error:', err);
      const errorMessage = err instanceof Error ? err.message : '確認コードの送信に失敗しました';
      setError(errorMessage);
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
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '確認に失敗しました';
      setError(errorMessage);
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

    if (!username.trim()) {
      setError('ユーザー名を入力してください');
      return;
    }

    // ステップ4へ
    setStep('health');
  };

  // ステップ4.5: 都道府県選択 → アカウント作成
  const handlePrefectureSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!prefecture) {
      setError('都道府県を選択してください');
      return;
    }

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

      // 認証トークンを強制的にリフレッシュして、Firestoreに伝播させる
      console.log('🔄 認証トークンをリフレッシュ中...');
      await user.getIdToken(true);

      // Firestoreの認証状態が完全に更新されるまで待機
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Firestoreにプロフィールを作成（リトライ機能付き）
      let profileCreated = false;
      let retryCount = 0;
      const maxRetries = 3;

      while (!profileCreated && retryCount < maxRetries) {
        try {
          await createUserProfile(user.uid, email, username);
          profileCreated = true;
          console.log('✅ プロフィールを作成しました');
        } catch (profileError: unknown) {
          retryCount++;
          console.error(`❌ プロフィール作成失敗 (試行 ${retryCount}/${maxRetries}):`, profileError);

          if (retryCount >= maxRetries) {
            const errorMessage = profileError instanceof Error ? profileError.message : '不明なエラー';
            throw new Error(`プロフィール作成に失敗しました: ${errorMessage}`);
          }

          // リトライ前に少し待機
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }

      // 都道府県を設定
      const { updateUserProfile } = await import('../../utils/profile');
      await updateUserProfile(user.uid, {
        prefecture,
        prefectureChangedAt: new Date().toISOString(),
      });

      // 健康情報・家計情報を設定に保存
      if (age || height || weight || savings) {
        try {
          const healthSettings: Partial<typeof settings> = {};
          if (age && age.trim() !== '') healthSettings.age = Number(age);
          if (height && height.trim() !== '') healthSettings.height = Number(height);
          if (weight && weight.trim() !== '') healthSettings.weight = Number(weight);
          if (savings && savings.trim() !== '') healthSettings.savings = Number(savings);

          await updateSettings(healthSettings);
          console.log('✅ 個人情報を保存しました');
        } catch (healthErr: unknown) {
          console.error('個人情報の保存に失敗しました:', healthErr);
          // エラーは無視して続行（必須ではない）
        }
      }

      console.log('✅ アカウント作成完了:', user.uid);

      // ログイン画面に戻る（自動的にログイン状態になる）
      onBack();
    } catch (err: unknown) {
      console.error('Account creation error:', err);
      const errorMessage = err instanceof Error ? err.message : 'アカウント作成に失敗しました';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ステップ4: 健康情報入力 → 都道府県選択へ
  const handleHealthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // ステップ5へ
    setStep('prefecture');
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
    } catch (err: unknown) {
      console.error('Code resend error:', err);
      setError('再送信に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-flow">
      <div className="progress-bar">
        <div className={`progress-step ${step === 'email' ? 'active' : ['code', 'profile', 'health', 'prefecture'].includes(step) ? 'completed' : ''}`}>1</div>
        <div className="progress-line" />
        <div className={`progress-step ${step === 'code' ? 'active' : ['profile', 'health', 'prefecture'].includes(step) ? 'completed' : ''}`}>2</div>
        <div className="progress-line" />
        <div className={`progress-step ${step === 'profile' ? 'active' : ['health', 'prefecture'].includes(step) ? 'completed' : ''}`}>3</div>
        <div className="progress-line" />
        <div className={`progress-step ${step === 'health' ? 'active' : step === 'prefecture' ? 'completed' : ''}`}>4</div>
        <div className="progress-line" />
        <div className={`progress-step ${step === 'prefecture' ? 'active' : ''}`}>5</div>
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
            {loading ? '次へ...' : '次へ'}
          </button>
        </form>
      )}

      {/* ステップ4: 健康情報入力（オプション） */}
      {step === 'health' && (
        <form onSubmit={handleHealthSubmit} className="step-form">
          <h2>
            <MdHealthAndSafety /> 健康情報を設定
          </h2>
          <p className="step-description">
            個人情報を入力してください（任意）
          </p>

          <div className="form-group">
            <label>
              <MdHealthAndSafety /> 年齢（歳）
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="例: 30"
              min="1"
              max="150"
            />
          </div>

          <div className="form-group">
            <label>
              <MdHealthAndSafety /> 身長（cm）
            </label>
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="例: 170"
              min="1"
              max="300"
            />
          </div>

          <div className="form-group">
            <label>
              <MdHealthAndSafety /> 体重（kg）
            </label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="例: 65"
              min="1"
              max="500"
              step="0.1"
            />
          </div>

          <div className="form-group">
            <label>
              <MdHealthAndSafety /> 貯金額（円）
            </label>
            <input
              type="number"
              value={savings}
              onChange={(e) => setSavings(e.target.value)}
              placeholder="例: 1000000"
              min="0"
              step="1000"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="submit-button" disabled={loading}>
            次へ
          </button>

          <button
            type="button"
            onClick={() => setStep('prefecture')}
            className="link-button"
            disabled={loading}
            style={{ textAlign: 'center' }}
          >
            スキップして次へ
          </button>
        </form>
      )}

      {/* ステップ5: 都道府県選択 */}
      {step === 'prefecture' && (
        <form onSubmit={handlePrefectureSubmit} className="step-form">
          <h2>
            <MdLocationOn /> 都道府県を選択
          </h2>
          <p className="step-description">
            都道府県を選択してください（30日に1回のみ変更可能）
          </p>

          <div className="form-group">
            <label>
              <MdLocationOn /> 都道府県
            </label>
            <select
              value={prefecture}
              onChange={(e) => setPrefecture(e.target.value)}
              required
              style={{
                padding: '12px 16px',
                border: '2px solid var(--border)',
                borderRadius: '8px',
                fontSize: '16px',
                background: 'var(--card)',
                color: 'var(--text)',
              }}
            >
              <option value="">選択してください</option>
              {prefectures.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>
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
