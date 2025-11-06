import { useState, useEffect } from 'react';
import { MdClose, MdImage, MdPublic, MdPeople, MdLock } from 'react-icons/md';
import { useAuth } from '../../hooks/useAuth';
import { createPost, getPost } from '../../utils/post';
import { getUserProfile, createUserProfile } from '../../utils/profile';
import type { PostFormData, Post, RecipeData } from '../../types/post';

interface PostCreateScreenProps {
  onClose: () => void;
  onPostCreated: () => void;
  quotedPostId?: string; // 引用元の投稿ID
  recipeData?: RecipeData; // 添付するレシピデータ
}

const MAX_CHARS = 280;
const MAX_IMAGES = 4;

export const PostCreateScreen: React.FC<PostCreateScreenProps> = ({
  onClose,
  onPostCreated,
  quotedPostId,
  recipeData,
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<'public' | 'followers' | 'private'>('public');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quotedPost, setQuotedPost] = useState<Post | null>(null);

  // 引用元の投稿を取得
  useEffect(() => {
    const fetchQuotedPost = async () => {
      if (quotedPostId) {
        const post = await getPost(quotedPostId);
        setQuotedPost(post);
      }
    };
    fetchQuotedPost();
  }, [quotedPostId]);

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
      // プロフィールが存在するかチェック（投稿にはプロフィールが必要）
      console.log('📝 Checking user profile before posting...');
      let profile = await getUserProfile(user.uid);

      if (!profile) {
        console.log('⚠️ プロフィールが存在しません。自動作成します...');
        try {
          await createUserProfile(
            user.uid,
            user.email || '',
            user.displayName || `User${user.uid.slice(0, 8)}`
          );
          console.log('✅ プロフィールを作成しました');

          // 作成したプロフィールを取得
          profile = await getUserProfile(user.uid);
        } catch (profileError: any) {
          console.error('❌ プロフィール作成に失敗しました:', profileError);
          setError('プロフィール作成に失敗しました。設定画面からプロフィールを作成してください。');
          setLoading(false);
          return;
        }
      }

      const postData: PostFormData = {
        content: content.trim(),
        images,
        visibility,
        quotedPostId, // 引用元の投稿ID
        recipeData, // レシピデータ
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
        background: 'var(--card)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ヘッダー */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--card)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
        }}
      >
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
            color: 'var(--text)',
            transition: 'background-color 0.2s ease-out',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(15, 20, 25, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <MdClose size={20} />
        </button>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', margin: 0 }}>
          投稿を作成
        </h2>
        <div style={{ width: '36px' }} /> {/* 中央揃えのためのスペーサー */}
      </div>

        {/* 本体 */}
        <div style={{ padding: '16px', flex: 1, overflowY: 'auto' }}>
          {/* テキスト入力 */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="今何してる？"
            style={{
              width: '100%',
              minHeight: '200px',
              padding: '12px',
              border: 'none',
              fontSize: '20px',
              color: 'var(--text)',
              background: 'transparent',
              resize: 'none',
              fontFamily: 'inherit',
              marginBottom: '12px',
              outline: 'none',
            }}
          />

          {/* 引用元の投稿を表示 */}
          {quotedPost && (
            <div style={{ padding: '12px', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '12px', marginBottom: '12px' }}>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>引用元:</div>
              <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text)' }}>{quotedPost.authorName}</div>
              <div style={{ fontSize: '14px', color: 'var(--text)', marginTop: '4px' }}>{quotedPost.content.substring(0, 100)}{quotedPost.content.length > 100 ? '...' : ''}</div>
            </div>
          )}

          {/* レシピデータを表示 */}
          {recipeData && (
            <div style={{ padding: '12px', background: 'linear-gradient(135deg, rgba(22, 163, 74, 0.05), rgba(129, 199, 132, 0.05))', border: '2px solid var(--primary)', borderRadius: '12px', marginBottom: '12px' }}>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>添付レシピ:</div>
              <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text)' }}>👨‍🍳 {recipeData.title}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>{recipeData.description}</div>
            </div>
          )}

          {/* 文字数カウント */}
          <div
            style={{
              textAlign: 'right',
              fontSize: '13px',
              color: content.length > MAX_CHARS ? '#f4212e' : 'var(--text-secondary)',
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
                gap: '2px',
                marginBottom: '16px',
                borderRadius: '16px',
                overflow: 'hidden',
              }}
            >
              {imagePreviews.map((preview, index) => (
                <div
                  key={index}
                  style={{
                    position: 'relative',
                    paddingBottom: '100%',
                    borderRadius: '0',
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
                background: 'var(--background)',
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
                e.currentTarget.style.background = 'var(--background)';
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
                background: 'var(--background)',
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
          <div
            style={{
              position: 'sticky',
              bottom: 0,
              padding: '16px',
              background: 'var(--card)',
              borderTop: '1px solid var(--border)',
            }}
          >
            <button
              onClick={handleSubmit}
              disabled={loading || !content.trim() || content.length > MAX_CHARS}
              style={{
                width: '100%',
                padding: '14px',
                background: loading || !content.trim() || content.length > MAX_CHARS
                  ? 'var(--border)'
                  : 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: '24px',
                fontSize: '15px',
                fontWeight: 700,
                cursor: loading || !content.trim() || content.length > MAX_CHARS ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s ease-out',
              }}
              onMouseEnter={(e) => {
                if (!loading && content.trim() && content.length <= MAX_CHARS) {
                  e.currentTarget.style.backgroundColor = 'var(--primary-dark)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && content.trim() && content.length <= MAX_CHARS) {
                  e.currentTarget.style.backgroundColor = 'var(--primary)';
                }
              }}
            >
              {loading ? '投稿中...' : '投稿する'}
            </button>
          </div>
        </div>
    </div>
  );
};
