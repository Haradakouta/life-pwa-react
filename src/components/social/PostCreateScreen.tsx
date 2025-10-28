import { useState } from 'react';
import { MdClose, MdImage, MdPublic, MdPeople, MdLock } from 'react-icons/md';
import { useAuth } from '../../hooks/useAuth';
import { createPost } from '../../utils/post';
import type { PostFormData } from '../../types/post';

interface PostCreateScreenProps {
  onClose: () => void;
  onPostCreated: () => void;
}

const MAX_CHARS = 280;
const MAX_IMAGES = 4;

export const PostCreateScreen: React.FC<PostCreateScreenProps> = ({
  onClose,
  onPostCreated,
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<'public' | 'followers' | 'private'>('public');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // 画像数の制限チェック
    if (images.length + files.length > MAX_IMAGES) {
      setError(`画像は最大${MAX_IMAGES}枚まで添付できます`);
      return;
    }

    // プレビューを作成
    const newPreviews: string[] = [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === files.length) {
          setImagePreviews([...imagePreviews, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    setImages([...images, ...files]);
    setError('');
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!user) {
      setError('ログインしてください');
      return;
    }

    if (!content.trim()) {
      setError('投稿内容を入力してください');
      return;
    }

    if (content.length > MAX_CHARS) {
      setError(`投稿は${MAX_CHARS}文字以内で入力してください`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const postData: PostFormData = {
        content: content.trim(),
        images,
        visibility,
      };

      await createPost(user.uid, postData);

      // 成功
      alert('投稿しました！');
      onPostCreated();
      onClose();
    } catch (err) {
      console.error('投稿の作成に失敗しました:', err);
      setError('投稿の作成に失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  const visibilityOptions = [
    { value: 'public' as const, label: '全体公開', icon: MdPublic, description: '誰でも見られます' },
    { value: 'followers' as const, label: 'フォロワー', icon: MdPeople, description: 'フォロワーのみ' },
    { value: 'private' as const, label: '非公開', icon: MdLock, description: '自分のみ' },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--card)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '600px',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text)', margin: 0 }}>
            投稿を作成
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--border)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
            }}
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* 本体 */}
        <div style={{ padding: '20px' }}>
          {/* テキスト入力 */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="今何してる？"
            style={{
              width: '100%',
              minHeight: '120px',
              padding: '12px',
              border: '2px solid var(--border)',
              borderRadius: '12px',
              fontSize: '16px',
              color: 'var(--text)',
              background: 'var(--bg)',
              resize: 'vertical',
              fontFamily: 'inherit',
              marginBottom: '12px',
            }}
          />

          {/* 文字数カウント */}
          <div
            style={{
              textAlign: 'right',
              fontSize: '14px',
              color: content.length > MAX_CHARS ? '#f44336' : 'var(--text-secondary)',
              marginBottom: '16px',
            }}
          >
            {content.length} / {MAX_CHARS}
          </div>

          {/* 画像プレビュー */}
          {imagePreviews.length > 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                gap: '12px',
                marginBottom: '16px',
              }}
            >
              {imagePreviews.map((preview, index) => (
                <div
                  key={index}
                  style={{
                    position: 'relative',
                    paddingBottom: '100%',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: 'var(--border)',
                  }}
                >
                  <img
                    src={preview}
                    alt={`プレビュー ${index + 1}`}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  <button
                    onClick={() => handleRemoveImage(index)}
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      background: 'rgba(0, 0, 0, 0.6)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '28px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: 'white',
                    }}
                  >
                    <MdClose size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 画像追加ボタン */}
          {images.length < MAX_IMAGES && (
            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: 'var(--bg)',
                border: '2px solid var(--border)',
                borderRadius: '12px',
                cursor: 'pointer',
                color: 'var(--primary)',
                fontSize: '14px',
                fontWeight: 500,
                marginBottom: '16px',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--border)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--bg)';
              }}
            >
              <MdImage size={20} />
              画像を追加 ({images.length}/{MAX_IMAGES})
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                style={{ display: 'none' }}
              />
            </label>
          )}

          {/* 公開範囲 */}
          <div style={{ marginBottom: '20px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '14px',
                color: 'var(--text-secondary)',
                marginBottom: '8px',
                fontWeight: 500,
              }}
            >
              公開範囲
            </label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as any)}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid var(--border)',
                borderRadius: '12px',
                fontSize: '15px',
                color: 'var(--text)',
                background: 'var(--bg)',
                cursor: 'pointer',
              }}
            >
              {visibilityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label} - {option.description}
                </option>
              ))}
            </select>
          </div>

          {/* エラー表示 */}
          {error && (
            <div
              style={{
                padding: '12px',
                background: '#ffebee',
                color: '#c62828',
                borderRadius: '8px',
                fontSize: '14px',
                marginBottom: '16px',
              }}
            >
              {error}
            </div>
          )}

          {/* 投稿ボタン */}
          <button
            onClick={handleSubmit}
            disabled={loading || !content.trim() || content.length > MAX_CHARS}
            style={{
              width: '100%',
              padding: '14px',
              background: loading || !content.trim() || content.length > MAX_CHARS
                ? 'var(--border)'
                : 'linear-gradient(135deg, var(--primary), #81c784)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: loading || !content.trim() || content.length > MAX_CHARS ? 'not-allowed' : 'pointer',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => {
              if (!loading && content.trim() && content.length <= MAX_CHARS) {
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {loading ? '投稿中...' : '投稿する'}
          </button>
        </div>
      </div>
    </div>
  );
};
