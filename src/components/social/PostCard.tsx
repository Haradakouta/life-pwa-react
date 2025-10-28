import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import type { Post } from '../../types/post';
import { getRelativeTime, addLike, removeLike, hasUserLiked, addBookmark, removeBookmark, hasUserBookmarked, addRepost, removeRepost, hasUserReposted } from '../../utils/post';
import { MdFavorite, MdFavoriteBorder, MdComment, MdRepeat, MdShare, MdBookmark, MdBookmarkBorder } from 'react-icons/md';

interface PostCardProps {
  post: Post;
  onPostClick: (postId: string) => void;
  onUserClick?: (userId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onPostClick, onUserClick }) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [localLikes, setLocalLikes] = useState(post.likes);
  const [localRepostCount, setLocalRepostCount] = useState(post.repostCount);
  const [isLoading, setIsLoading] = useState(false);

  // いいね・ブックマーク・リポスト状態を初期化
  useEffect(() => {
    const checkStatus = async () => {
      if (!user) return;
      try {
        const isLiked = await hasUserLiked(post.id, user.uid);
        const isBookmarked = await hasUserBookmarked(post.id, user.uid);
        const isReposted = await hasUserReposted(post.id, user.uid);

        setLiked(isLiked);
        setBookmarked(isBookmarked);
        setReposted(isReposted);
      } catch (error) {
        console.error('ステータス確認エラー:', error);
      }
    };

    checkStatus();
  }, [post.id, user]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || isLoading) return;

    try {
      setIsLoading(true);
      if (liked) {
        await removeLike(post.id, user.uid);
        setLiked(false);
        setLocalLikes(Math.max(0, localLikes - 1));
      } else {
        await addLike(post.id, user.uid, user.email?.split('@')[0] || 'anonymous', undefined);
        setLiked(true);
        setLocalLikes(localLikes + 1);
      }
    } catch (error) {
      console.error('いいね操作エラー:', error);
      alert('いいね操作に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComment = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPostClick(post.id); // 投稿詳細画面へ
  };

  const handleRepost = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || isLoading) return;

    try {
      setIsLoading(true);
      if (reposted) {
        await removeRepost(post.id, user.uid);
        setReposted(false);
        setLocalRepostCount(Math.max(0, localRepostCount - 1));
      } else {
        await addRepost(post.id, user.uid, user.email?.split('@')[0] || 'anonymous', undefined);
        setReposted(true);
        setLocalRepostCount(localRepostCount + 1);
      }
    } catch (error) {
      console.error('リポスト操作エラー:', error);
      alert('リポスト操作に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || isLoading) return;

    try {
      setIsLoading(true);
      if (bookmarked) {
        await removeBookmark(post.id, user.uid);
        setBookmarked(false);
      } else {
        await addBookmark(post.id, user.uid);
        setBookmarked(true);
      }
    } catch (error) {
      console.error('ブックマーク操作エラー:', error);
      alert('ブックマーク操作に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Web Share APIを使用
    if (navigator.share) {
      navigator.share({
        title: '投稿を共有',
        text: post.content,
      }).catch(err => console.log('Share cancelled:', err));
    } else {
      alert('この投稿をシェアしました！');
    }
  };

  return (
    <div
      className="post-card"
      onClick={() => onPostClick(post.id)}
      style={{
        background: 'var(--card)',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '12px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
      }}
    >
      {/* ヘッダー（プロフィール情報） */}
      <div
        onClick={(e) => {
          if (onUserClick) {
            e.stopPropagation();
            onUserClick(post.authorId);
          }
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '12px',
          cursor: onUserClick ? 'pointer' : 'default',
          padding: '4px',
          marginLeft: '-4px',
          borderRadius: '8px',
          transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => {
          if (onUserClick) {
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'none';
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: post.authorAvatar
              ? `url(${post.authorAvatar}) center/cover`
              : 'linear-gradient(135deg, var(--primary), #81c784)',
            marginRight: '12px',
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontWeight: 600,
              color: 'var(--text)',
              fontSize: '15px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {post.authorName}
          </div>
          <div
            style={{
              color: 'var(--text-secondary)',
              fontSize: '13px',
            }}
          >
            {getRelativeTime(post.createdAt)}
          </div>
        </div>
      </div>

      {/* 本文 */}
      <div
        style={{
          color: 'var(--text)',
          fontSize: '15px',
          lineHeight: '1.5',
          marginBottom: post.images && post.images.length > 0 ? '12px' : '16px',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {post.content}
      </div>

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
            gap: '8px',
            marginBottom: '16px',
          }}
        >
          {post.images.map((image, index) => (
            <div
              key={index}
              style={{
                width: '100%',
                paddingBottom: post.images!.length === 1 ? '56.25%' : '100%', // 16:9 or 1:1
                position: 'relative',
                borderRadius: '8px',
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

      {/* アクションボタン */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          paddingTop: '12px',
          borderTop: '1px solid var(--border)',
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
            gap: '6px',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '8px',
            color: liked ? '#e91e63' : 'var(--text-secondary)',
            transition: 'background 0.2s, color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(233, 30, 99, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'none';
          }}
        >
          {liked ? <MdFavorite size={20} /> : <MdFavoriteBorder size={20} />}
          <span style={{ fontSize: '14px', fontWeight: 500 }}>{localLikes}</span>
        </button>

        {/* コメント */}
        <button
          onClick={handleComment}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '8px',
            color: 'var(--text-secondary)',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(33, 150, 243, 0.1)';
            e.currentTarget.style.color = '#2196f3';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'none';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <MdComment size={20} />
          <span style={{ fontSize: '14px', fontWeight: 500 }}>{post.commentCount}</span>
        </button>

        {/* リポスト */}
        <button
          onClick={handleRepost}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '8px',
            color: reposted ? '#4caf50' : 'var(--text-secondary)',
            transition: 'background 0.2s, color 0.2s',
            opacity: isLoading ? 0.6 : 1,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(76, 175, 80, 0.1)';
            if (!reposted) e.currentTarget.style.color = '#4caf50';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'none';
            if (!reposted) e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <MdRepeat size={20} />
          <span style={{ fontSize: '14px', fontWeight: 500 }}>{localRepostCount}</span>
        </button>

        {/* ブックマーク */}
        <button
          onClick={handleBookmark}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '8px',
            color: bookmarked ? '#ff9800' : 'var(--text-secondary)',
            transition: 'background 0.2s, color 0.2s',
            opacity: isLoading ? 0.6 : 1,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 152, 0, 0.1)';
            if (!bookmarked) e.currentTarget.style.color = '#ff9800';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'none';
            if (!bookmarked) e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          {bookmarked ? <MdBookmark size={20} /> : <MdBookmarkBorder size={20} />}
        </button>

        {/* 共有 */}
        <button
          onClick={handleShare}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '8px',
            color: 'var(--text-secondary)',
            transition: 'background 0.2s',
            marginLeft: 'auto',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(158, 158, 158, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'none';
          }}
        >
          <MdShare size={20} />
        </button>
      </div>
    </div>
  );
};
