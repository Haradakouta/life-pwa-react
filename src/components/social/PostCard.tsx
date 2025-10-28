import { useState } from 'react';
import type { Post } from '../../types/post';
import { getRelativeTime } from '../../utils/post';
import { MdFavorite, MdFavoriteBorder, MdComment, MdRepeat, MdShare } from 'react-icons/md';

interface PostCardProps {
  post: Post;
  onPostClick: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onPostClick }) => {
  const [liked, setLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(post.likes);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation(); // 投稿クリックイベントを防ぐ
    setLiked(!liked);
    setLocalLikes(liked ? localLikes - 1 : localLikes + 1);
    // TODO: Phase 3でFirestoreに保存
  };

  const handleComment = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPostClick(post.id); // 投稿詳細画面へ
  };

  const handleRepost = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Phase 3でリポスト機能を実装
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Phase 3で共有機能を実装
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
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
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
            color: 'var(--text-secondary)',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(76, 175, 80, 0.1)';
            e.currentTarget.style.color = '#4caf50';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'none';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <MdRepeat size={20} />
          <span style={{ fontSize: '14px', fontWeight: 500 }}>{post.repostCount}</span>
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
