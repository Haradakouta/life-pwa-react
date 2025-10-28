import React, { useState, useEffect, useRef } from 'react';
import { MdPerson, MdEmail, MdLink, MdPublic, MdLock, MdCamera, MdSave, MdArrowBack } from 'react-icons/md';
import { auth } from '../../config/firebase';
import { getUserProfile, updateUserProfile, validateUsername, isUsernameAvailable } from '../../utils/profile';
import { uploadAvatarImage, uploadCoverImage, validateImageFile } from '../../utils/imageUpload';
import type { UserProfile } from '../../types/profile';

interface ProfileEditScreenProps {
  onBack: () => void;
}

export const ProfileEditScreen: React.FC<ProfileEditScreenProps> = ({ onBack }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userProfile = await getUserProfile(user.uid);
      if (userProfile) {
        setProfile(userProfile);
        setDisplayName(userProfile.displayName);
        setUsername(userProfile.username);
        setBio(userProfile.bio || '');
        setWebsiteUrl(userProfile.websiteUrl || '');
        setIsPublic(userProfile.isPublic);
        setAvatarUrl(userProfile.avatarUrl || '');
        setCoverUrl(userProfile.coverUrl || '');
      }
    } catch (err: any) {
      console.error('Load profile error:', err);
      setError('プロフィールの読み込みに失敗しました');
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // バリデーション
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || '');
      return;
    }

    setUploadingAvatar(true);
    setError('');

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('ログインが必要です');

      const url = await uploadAvatarImage(user.uid, file);
      setAvatarUrl(url);
      setSuccess('アイコン画像をアップロードしました');
    } catch (err: any) {
      console.error('Avatar upload error:', err);
      setError(err.message || 'アイコン画像のアップロードに失敗しました');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // バリデーション
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || '');
      return;
    }

    setUploadingCover(true);
    setError('');

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('ログインが必要です');

      const url = await uploadCoverImage(user.uid, file);
      setCoverUrl(url);
      setSuccess('カバー画像をアップロードしました');
    } catch (err: any) {
      console.error('Cover upload error:', err);
      setError(err.message || 'カバー画像のアップロードに失敗しました');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error('ログインが必要です');

      // バリデーション
      if (!displayName.trim()) {
        setError('表示名を入力してください');
        setLoading(false);
        return;
      }

      const usernameValidation = validateUsername(username);
      if (!usernameValidation.valid) {
        setError(usernameValidation.error || '');
        setLoading(false);
        return;
      }

      // usernameの重複チェック
      if (username !== profile?.username) {
        const available = await isUsernameAvailable(username, user.uid);
        if (!available) {
          setError('このユーザー名は既に使用されています');
          setLoading(false);
          return;
        }
      }

      // プロフィールを更新
      await updateUserProfile(user.uid, {
        displayName: displayName.trim(),
        username,
        bio: bio.trim(),
        websiteUrl: websiteUrl.trim(),
        isPublic,
        avatarUrl,
        coverUrl,
      });

      setSuccess('プロフィールを更新しました！');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Save profile error:', err);
      setError(err.message || 'プロフィールの更新に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-edit-screen">
      <div className="profile-edit-header">
        <button onClick={onBack} className="back-button">
          <MdArrowBack /> 戻る
        </button>
        <h2>プロフィール編集</h2>
        <button onClick={handleSave} className="save-button" disabled={loading}>
          <MdSave /> {loading ? '保存中...' : '保存'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {/* カバー画像 */}
      <div className="cover-section">
        <div
          className="cover-image"
          style={{
            backgroundImage: coverUrl ? `url(${coverUrl})` : 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
          }}
        >
          <button
            onClick={() => coverInputRef.current?.click()}
            className="cover-upload-button"
            disabled={uploadingCover}
          >
            <MdCamera /> {uploadingCover ? 'アップロード中...' : 'カバー画像を変更'}
          </button>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            onChange={handleCoverChange}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {/* アバター画像 */}
      <div className="avatar-section">
        <div className="avatar-image">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" />
          ) : (
            <div className="avatar-placeholder">
              <MdPerson size={60} />
            </div>
          )}
          <button
            onClick={() => avatarInputRef.current?.click()}
            className="avatar-upload-button"
            disabled={uploadingAvatar}
          >
            <MdCamera />
          </button>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {/* フォーム */}
      <div className="profile-form">
        <div className="form-group">
          <label>
            <MdPerson /> 表示名
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="山田太郎"
            maxLength={50}
          />
          <span className="char-count">{displayName.length}/50</span>
        </div>

        <div className="form-group">
          <label>
            <MdEmail /> ユーザー名
          </label>
          <div className="username-input">
            <span className="username-prefix">@</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              placeholder="yamada_taro"
              maxLength={20}
            />
          </div>
          <span className="hint">英数字とアンダースコア（_）のみ使用可能</span>
        </div>

        <div className="form-group">
          <label>自己紹介</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="あなたについて教えてください..."
            maxLength={200}
            rows={4}
          />
          <span className="char-count">{bio.length}/200</span>
        </div>

        <div className="form-group">
          <label>
            <MdLink /> WebサイトURL
          </label>
          <input
            type="url"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://example.com"
          />
        </div>

        <div className="form-group">
          <label className="toggle-label">
            {isPublic ? <MdPublic /> : <MdLock />}
            プロフィールを公開する
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="toggle-switch"
            />
          </label>
          <span className="hint">
            {isPublic
              ? '誰でもあなたのプロフィールを閲覧できます'
              : 'フォロワーのみプロフィールを閲覧できます'}
          </span>
        </div>
      </div>

      <style>{`
        .profile-edit-screen {
          min-height: 100vh;
          background: var(--background);
          padding-bottom: 80px;
        }

        .profile-edit-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          background: var(--card);
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .profile-edit-header h2 {
          color: var(--text);
          font-size: 20px;
          margin: 0;
        }

        .back-button,
        .save-button {
          padding: 8px 16px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.3s;
        }

        .back-button {
          background: var(--background);
          color: var(--text);
        }

        .back-button:hover {
          background: var(--border);
        }

        .save-button {
          background: linear-gradient(135deg, var(--primary) 0%, #43a047 100%);
          color: white;
        }

        .save-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
        }

        .save-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error-message {
          margin: 16px;
          padding: 12px;
          background: #ffebee;
          color: #c62828;
          border-radius: 8px;
          font-size: 14px;
        }

        body.dark-mode .error-message {
          background: #b71c1c;
          color: #ffcdd2;
        }

        .success-message {
          margin: 16px;
          padding: 12px;
          background: #e8f5e9;
          color: #2e7d32;
          border-radius: 8px;
          font-size: 14px;
        }

        body.dark-mode .success-message {
          background: #1b5e20;
          color: #a5d6a7;
        }

        .cover-section {
          position: relative;
        }

        .cover-image {
          width: 100%;
          height: 200px;
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cover-upload-button {
          padding: 10px 20px;
          background: rgba(0, 0, 0, 0.6);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.3s;
        }

        .cover-upload-button:hover:not(:disabled) {
          background: rgba(0, 0, 0, 0.8);
        }

        .cover-upload-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .avatar-section {
          display: flex;
          justify-content: center;
          margin-top: -60px;
          padding: 0 16px;
        }

        .avatar-image {
          position: relative;
          width: 120px;
          height: 120px;
          border-radius: 50%;
          border: 4px solid var(--card);
          background: var(--background);
          overflow: hidden;
        }

        .avatar-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          background: var(--border);
        }

        .avatar-upload-button {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--primary);
          color: white;
          border: 2px solid var(--card);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
        }

        .avatar-upload-button:hover:not(:disabled) {
          transform: scale(1.1);
        }

        .avatar-upload-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .profile-form {
          padding: 32px 16px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          color: var(--text);
          font-size: 14px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .form-group label svg {
          color: var(--primary);
        }

        .form-group input,
        .form-group textarea {
          padding: 12px 16px;
          border: 2px solid var(--border);
          border-radius: 8px;
          font-size: 16px;
          background: var(--card);
          color: var(--text);
          transition: all 0.3s;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
        }

        .form-group textarea {
          resize: vertical;
          font-family: inherit;
        }

        .username-input {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .username-prefix {
          color: var(--text-secondary);
          font-size: 16px;
          font-weight: 500;
        }

        .username-input input {
          flex: 1;
        }

        .char-count,
        .hint {
          color: var(--text-secondary);
          font-size: 12px;
        }

        .toggle-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .toggle-switch {
          margin-left: auto;
          width: 50px;
          height: 26px;
          appearance: none;
          background: var(--border);
          border-radius: 13px;
          position: relative;
          cursor: pointer;
          transition: background 0.3s;
        }

        .toggle-switch:checked {
          background: var(--primary);
        }

        .toggle-switch::before {
          content: '';
          position: absolute;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: white;
          top: 2px;
          left: 2px;
          transition: transform 0.3s;
        }

        .toggle-switch:checked::before {
          transform: translateX(24px);
        }

        @media (max-width: 480px) {
          .cover-image {
            height: 150px;
          }

          .avatar-image {
            width: 100px;
            height: 100px;
          }

          .profile-form {
            padding: 24px 12px;
          }
        }
      `}</style>
    </div>
  );
};
