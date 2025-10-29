import { useState, useEffect } from 'react';
import { MdArrowBack, MdDelete, MdFavorite, MdFavoriteBorder, MdComment, MdSend } from 'react-icons/md';
import { useAuth } from '../../hooks/useAuth';
import { getPost, deletePost, getRelativeTime, addLike, removeLike, hasUserLiked, addComment, deleteComment, getPostComments } from '../../utils/post';
import { getUserProfile } from '../../utils/profile';
import type { Post, Comment } from '../../types/post';
import type { UserProfile } from '../../types/profile';

interface PostDetailScreenProps {
  postId: string;
  onBack: () => void;
  onPostDeleted: () => void;
  onUserClick: (userId: string) => void;
}

export const PostDetailScreen: React.FC<PostDetailScreenProps> = ({
  postId,
  onBack,
  onPostDeleted,
  onUserClick,
}) => {
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const fetchedPost = await getPost(postId);
        if (fetchedPost) {
          setPost(fetchedPost);
          setLocalLikes(fetchedPost.likes);

          // いいね状態をチェック
          if (user) {
            const isLiked = await hasUserLiked(postId, user.uid);
            setLiked(isLiked);

            // ユーザープロフィールを取得
            const profile = await getUserProfile(user.uid);
            setUserProfile(profile);
          }

          // コメント一覧を取得
          const fetchedComments = await getPostComments(postId);
          setComments(fetchedComments);
        } else {
          alert('投稿が見つかりません');
          onBack();
        }
      } catch (error) {
        console.error('投稿の取得に失敗しました:', error);
        alert('投稿の取得に失敗しました');
        onBack();
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId, onBack, user]);

  const handleLike = async () => {
    if (!user || !userProfile) return;

    try {
      if (liked) {
        await removeLike(postId, user.uid);
        setLiked(false);
        setLocalLikes(Math.max(0, localLikes - 1));
      } else {
        await addLike(
          postId,
          user.uid,
          userProfile.displayName,
          userProfile.avatarUrl
        );
        setLiked(true);
        setLocalLikes(localLikes + 1);
      }
    } catch (error) {
      console.error('いいね操作エラー:', error);
      alert('いいね操作に失敗しました');
    }
  };

  const handleAddComment = async () => {
    if (!user || !post || !commentText.trim() || !userProfile) return;

    try {
      setIsSubmittingComment(true);
      await addComment(
        postId,
        user.uid,
        userProfile.displayName,
        commentText.trim(),
        userProfile.avatarUrl
      );

      // コメント一覧を更新
      const updatedComments = await getPostComments(postId);
      setComments(updatedComments);
      setCommentText('');
    } catch (error) {
      console.error('コメント追加エラー:', error);
      alert('コメントの追加に失敗しました');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user || !confirm('このコメントを削除しますか？')) return;

    try {
      await deleteComment(postId, commentId, user.uid);

      // コメント一覧を更新
      const updatedComments = await getPostComments(postId);
      setComments(updatedComments);
    } catch (error) {
      console.error('コメント削除エラー:', error);
      alert('コメントの削除に失敗しました');
    }
  };

  const handleDelete = async () => {
    if (!user || !post) return;

    if (!confirm('この投稿を削除しますか？')) {
      return;
    }

    try {
      await deletePost(postId, user.uid);
      alert('投稿を削除しました');
      onPostDeleted();
    } catch (error) {
      console.error('投稿の削除に失敗しました:', error);
      alert('投稿の削除に失敗しました');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '4px solid var(--border)',
            borderTop: '4px solid var(--primary)',
            borderRadius: '50%',
            margin: '0 auto 16px',
            animation: 'spin 1s linear infinite',
          }}
        />
        <div>投稿を読み込んでいます...</div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  const isAuthor = user && post.authorId === user.uid;

  return (
    <div style={{ paddingBottom: '80px' }}>
      {/* ヘッダー */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          background: 'var(--card)',
          borderBottom: '1px solid var(--border)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <button
          onClick={onBack}
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
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--border)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'none';
          }}
        >
          <MdArrowBack size={24} />
        </button>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text)', margin: 0 }}>
          投稿
        </h2>
        {isAuthor && (
          <button
            onClick={handleDelete}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f44336',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#ffebee';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
            }}
          >
            <MdDelete size={24} />
          </button>
        )}
      </div>

      {/* 投稿本体 */}
      <div style={{ padding: '20px' }}>
        {/* プロフィール情報 */}
        <div
          onClick={() => onUserClick(post.authorId)}
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '16px',
            cursor: 'pointer',
            padding: '8px',
            marginLeft: '-8px',
            borderRadius: '8px',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--border)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'none';
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: post.authorAvatar
                ? `url(${post.authorAvatar}) center/cover`
                : 'linear-gradient(135deg, var(--primary), #81c784)',
              marginRight: '12px',
              flexShrink: 0,
            }}
          />
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '16px' }}>
              {post.authorName}
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              {getRelativeTime(post.createdAt)}
            </div>
          </div>
        </div>

        {/* 本文 */}
        <div
          style={{
            color: 'var(--text)',
            fontSize: '16px',
            lineHeight: '1.6',
            marginBottom: '20px',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {post.content}
        </div>

        {/* レシピデータ */}
        {post.recipeData && (
          <div
            style={{
              marginBottom: '20px',
              padding: '20px',
              background: 'linear-gradient(135deg, rgba(22, 163, 74, 0.05), rgba(129, 199, 132, 0.05))',
              borderRadius: '12px',
              border: '2px solid var(--primary)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{ fontSize: '24px' }}>👨‍🍳</div>
              <div style={{ fontWeight: 700, fontSize: '18px', color: 'var(--text)' }}>
                {post.recipeData.title}
              </div>
              <div
                style={{
                  marginLeft: 'auto',
                  padding: '6px 16px',
                  background: 'var(--primary)',
                  color: 'white',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                {post.recipeData.difficulty === 'easy' ? '簡単' : post.recipeData.difficulty === 'medium' ? '普通' : '難しい'}
              </div>
            </div>
            <div style={{ fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              {post.recipeData.description}
            </div>
            <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              <span>🍽️ {post.recipeData.servings}人分</span>
              <span>⏱️ {post.recipeData.preparationTime + post.recipeData.cookingTime}分</span>
            </div>

            {/* 材料 */}
            {post.recipeData.ingredients && post.recipeData.ingredients.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text)', marginBottom: '10px' }}>
                  📝 材料
                </div>
                <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: 'var(--text)', lineHeight: '2' }}>
                  {post.recipeData.ingredients.map((ingredient, index) => (
                    <li key={index}>{ingredient}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* 作り方 */}
            {post.recipeData.instructions && post.recipeData.instructions.length > 0 && (
              <div>
                <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text)', marginBottom: '10px' }}>
                  👨‍🍳 作り方
                </div>
                <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: 'var(--text)', lineHeight: '2' }}>
                  {post.recipeData.instructions.map((instruction, index) => (
                    <li key={index} style={{ marginBottom: '8px' }}>{instruction}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}

        {/* 引用リポスト */}
        {post.quotedPost && (
          <div
            style={{
              marginBottom: '20px',
              padding: '16px',
              background: 'var(--background)',
              borderRadius: '12px',
              border: '1px solid var(--border)',
            }}
          >
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              引用元の投稿:
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: post.quotedPost.authorAvatar
                    ? `url(${post.quotedPost.authorAvatar}) center/cover`
                    : 'linear-gradient(135deg, var(--primary), #81c784)',
                }}
              />
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text)' }}>
                  {post.quotedPost.authorName}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {getRelativeTime(post.quotedPost.createdAt)}
                </div>
              </div>
            </div>
            <div
              style={{
                fontSize: '15px',
                color: 'var(--text)',
                lineHeight: '1.5',
                marginBottom: post.quotedPost.recipeData || (post.quotedPost.images && post.quotedPost.images.length > 0) ? '12px' : '0',
              }}
            >
              {post.quotedPost.content}
            </div>
            {post.quotedPost.recipeData && (
              <div
                style={{
                  marginBottom: '12px',
                  padding: '12px',
                  background: 'rgba(22, 163, 74, 0.05)',
                  borderRadius: '8px',
                  border: '1px solid var(--primary)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '16px' }}>👨‍🍳</span>
                  <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text)' }}>
                    {post.quotedPost.recipeData.title}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {post.quotedPost.recipeData.description}
                </div>
              </div>
            )}
            {post.quotedPost.images && post.quotedPost.images.length > 0 && (
              <div
                style={{
                  width: '100%',
                  paddingBottom: '56.25%',
                  position: 'relative',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  background: 'var(--border)',
                }}
              >
                <img
                  src={post.quotedPost.images[0]}
                  alt="引用元画像"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* 画像 */}
        {post.images && post.images.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                post.images.length === 1
                  ? '1fr'
                  : post.images.length === 2
                  ? 'repeat(2, 1fr)'
                  : 'repeat(2, 1fr)',
              gap: '12px',
              marginBottom: '24px',
            }}
          >
            {post.images.map((image, index) => (
              <div
                key={index}
                style={{
                  width: '100%',
                  paddingBottom: post.images!.length === 1 ? '56.25%' : '100%',
                  position: 'relative',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  background: 'var(--border)',
                }}
              >
                <img
                  src={image}
                  alt={`投稿画像 ${index + 1}`}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* アクション */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '32px',
            padding: '16px 0',
            borderTop: '1px solid var(--border)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          {/* いいね */}
          <button
            onClick={handleLike}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              padding: '8px 12px',
              borderRadius: '12px',
              color: liked ? '#e91e63' : 'var(--text-secondary)',
              transition: 'background 0.2s',
              fontSize: '16px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(233, 30, 99, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
            }}
          >
            {liked ? <MdFavorite size={24} /> : <MdFavoriteBorder size={24} />}
            <span style={{ fontWeight: 600 }}>{localLikes}</span>
          </button>

          {/* コメント */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--text-secondary)',
              fontSize: '16px',
            }}
          >
            <MdComment size={24} />
            <span style={{ fontWeight: 600 }}>{post.commentCount}</span>
          </div>
        </div>

        {/* コメント欄 */}
        <div style={{ marginTop: '24px' }}>
          {/* コメント入力フォーム */}
          {user && (
            <div style={{ marginBottom: '24px' }}>
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-end',
                  padding: '12px',
                  background: 'var(--card)',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                }}
              >
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="コメントを入力..."
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    background: 'var(--background)',
                    color: 'var(--text)',
                    fontFamily: 'inherit',
                    fontSize: '14px',
                    resize: 'vertical',
                    minHeight: '44px',
                    maxHeight: '120px',
                    outline: 'none',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--primary)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                  }}
                />
                <button
                  onClick={handleAddComment}
                  disabled={isSubmittingComment || !commentText.trim()}
                  style={{
                    background: commentText.trim() ? 'var(--primary)' : 'var(--border)',
                    border: 'none',
                    color: commentText.trim() ? 'white' : 'var(--text-secondary)',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    cursor: commentText.trim() && !isSubmittingComment ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                >
                  <MdSend size={20} />
                </button>
              </div>
            </div>
          )}

          {/* コメント一覧 */}
          <div style={{ marginTop: '20px' }}>
            {comments.length > 0 ? (
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: 'var(--text)' }}>
                  コメント ({comments.length})
                </h3>
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    style={{
                      padding: '12px',
                      background: 'var(--background)',
                      borderRadius: '8px',
                      marginBottom: '12px',
                      borderLeft: '2px solid var(--primary)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '14px' }}>
                          {comment.userName}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                          {getRelativeTime(comment.createdAt)}
                        </div>
                      </div>
                      {user && user.uid === comment.userId && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#f44336',
                            cursor: 'pointer',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            transition: 'background 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#ffebee';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'none';
                          }}
                        >
                          削除
                        </button>
                      )}
                    </div>
                    <div style={{ color: 'var(--text)', fontSize: '14px', lineHeight: '1.5', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {comment.content}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  color: 'var(--text-secondary)',
                  background: 'var(--background)',
                  borderRadius: '12px',
                }}
              >
                <div style={{ fontSize: '14px' }}>コメントはまだありません</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
