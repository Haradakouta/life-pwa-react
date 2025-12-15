import React, { useState, useEffect, useTransition, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import type { Post } from '../../types/post';
import type { UserProfile } from '../../types/profile';
import { getRelativeTime, addLike, removeLike, hasUserLiked, addBookmark, removeBookmark, hasUserBookmarked, addRepost, removeRepost, hasUserReposted, pinPost, unpinPost } from '../../utils/post';
import { getUserProfile, getUserIdByUsername } from '../../utils/profile';
import { formatCount } from '../../utils/formatNumber';
import { getEquippedTitle } from '../../utils/title';
import type { Title } from '../../types/title';
import { TitleBadge } from '../common/TitleBadge';
import { MdFavorite, MdFavoriteBorder, MdComment, MdRepeat, MdShare, MdBookmark, MdBookmarkBorder, MdFormatQuote, MdPushPin, MdMoreVert } from 'react-icons/md';
import { AvatarWithFrame } from '../common/AvatarWithFrame';
import { NameWithColor } from '../common/NameWithColor';
import { ImageModal } from '../common/ImageModal';

interface PostCardProps {
  post: Post;
  onPostClick: (postId: string) => void;
  onUserClick?: (userId: string) => void;
  onQuoteRepost?: (postId: string) => void;
  showPinButton?: boolean; // 自分のプロフィール画面でのみtrue
  onPinToggle?: () => void; // ピン留め後にプロフィールをリフレッシュ
}

const PostCardComponent: React.FC<PostCardProps> = React.memo(({ post, onPostClick, onUserClick, onQuoteRepost, showPinButton = false, onPinToggle }) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [localLikes, setLocalLikes] = useState(post.likes);
  const [localRepostCount, setLocalRepostCount] = useState(post.repostCount);
  const [isLoading, setIsLoading] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageModalIndex, setImageModalIndex] = useState(0);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showPinMenu, setShowPinMenu] = useState(false);
  const [authorTitle, setAuthorTitle] = useState<Title | null>(null);
  const [, startTransition] = useTransition();

  // いいね・ブックマーク・リポスト状態と称号を取得（最適化）
  useEffect(() => {
    const loadPostData = async () => {
      if (!user) return;

      try {
        // 投稿に既にユーザー状態が含まれている場合はそれを使用（バッチ取得済み）
        const postAny = post as any;
        if (postAny.userLiked !== undefined && postAny.userBookmarked !== undefined && postAny.userReposted !== undefined) {
          setLiked(postAny.userLiked);
          setBookmarked(postAny.userBookmarked);
          setReposted(postAny.userReposted);
        } else {
          // フォールバック: 個別に取得（タイムライン以外の画面など）
          const [isLiked, isBookmarked, isReposted] = await Promise.all([
            hasUserLiked(post.id, user.uid),
            hasUserBookmarked(post.id, user.uid),
            hasUserReposted(post.id, user.uid),
          ]);

          setLiked(isLiked);
          setBookmarked(isBookmarked);
          setReposted(isReposted);
        }

        // プロフィールと称号は初回のみ取得（再取得を防ぐ）
        if (!userProfile) {
          const [profile, title] = await Promise.all([
            getUserProfile(user.uid),
            getEquippedTitle(post.authorId),
          ]);

          setUserProfile(profile);
          setAuthorTitle(title);
        } else {
          // プロフィールは既に取得済みなので、称号のみ更新（投稿者の称号は変わらない可能性が高いが、念のため）
          if (!authorTitle) {
            const title = await getEquippedTitle(post.authorId);
            setAuthorTitle(title);
          }
        }
      } catch (error) {
        console.error('投稿データ読み込みエラー:', error);
      }
    };

    loadPostData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.id, post.authorId, user?.uid]); // userオブジェクト全体ではなく、user.uidのみを依存配列に

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || isLoading || !userProfile) return;

    try {
      setIsLoading(true);
      if (liked) {
        await removeLike(post.id, user.uid);
        setLiked(false);
        setLocalLikes(Math.max(0, localLikes - 1));
      } else {
        await addLike(
          post.id,
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
    if (!user || isLoading || !userProfile) return;

    try {
      setIsLoading(true);
      if (reposted) {
        await removeRepost(post.id, user.uid);
        setReposted(false);
        setLocalRepostCount(Math.max(0, localRepostCount - 1));
      } else {
        await addRepost(
          post.id,
          user.uid,
          userProfile.displayName,
          userProfile.avatarUrl
        );
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

  const handleQuoteRepost = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQuoteRepost) {
      onQuoteRepost(post.id);
    }
  };

  const handlePinToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;

    try {
      setIsLoading(true);
      if (post.isPinned) {
        await unpinPost(user.uid, post.id);
        alert('ピン留めを解除しました');
      } else {
        await pinPost(user.uid, post.id);
        alert('投稿をピン留めしました');
      }
      setShowPinMenu(false);
      if (onPinToggle) {
        onPinToggle();
      }
    } catch (error) {
      console.error('ピン留め操作エラー:', error);
      alert('ピン留め操作に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostClick = useCallback(() => {
    startTransition(() => {
      onPostClick(post.id);
    });
  }, [post.id, onPostClick]);

  const handleUserClickWrapper = useCallback((e: React.MouseEvent) => {
    if (onUserClick) {
      e.stopPropagation();
      startTransition(() => {
        onUserClick(post.authorId);
      });
    }
  }, [post.authorId, onUserClick]);

  return (
    <div
      className="post-card-modern"
      onClick={handlePostClick}
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)',
        backdropFilter: 'blur(10px)',
        padding: '16px 20px',
        borderBottom: '1px solid rgba(59, 130, 246, 0.1)',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.03)';
        e.currentTarget.style.transform = 'translateX(4px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.9) 100%)';
        e.currentTarget.style.transform = 'translateX(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* ピン留めインジケーター */}
      {post.isPinned && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--primary)',
            fontSize: '13px',
            fontWeight: 600,
            marginBottom: '12px',
          }}
        >
          <MdPushPin size={16} />
          <span>ピン留めされた投稿</span>
        </div>
      )}

      {/* ヘッダー（プロフィール情報） */}
      <div
        onClick={handleUserClickWrapper}
        className="post-header-modern"
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '12px',
          cursor: onUserClick ? 'pointer' : 'default',
          padding: '8px',
          marginLeft: '-8px',
          borderRadius: '12px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onMouseEnter={(e) => {
          if (onUserClick) {
            e.currentTarget.style.background = 'rgba(59, 130, 246, 0.08)';
            e.currentTarget.style.transform = 'translateX(2px)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.transform = 'translateX(0)';
        }}
      >
        <AvatarWithFrame userId={post.authorId} avatarUrl={post.authorAvatar} size="small" style={{ marginRight: '12px', flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap', marginBottom: '2px' }}>
            <NameWithColor
              userId={post.authorId}
              name={post.authorName}
              style={{
                fontWeight: 700,
                fontSize: '15px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            />
            <div
              style={{
                color: 'var(--text-secondary)',
                fontSize: '15px',
              }}
            >
              · {getRelativeTime(post.createdAt)}
            </div>
            {authorTitle && (
              <TitleBadge title={authorTitle} size="small" showName={true} />
            )}
          </div>
        </div>

        {/* ピン留めボタン（自分のプロフィール画面でのみ表示） */}
        {showPinButton && (
          <div style={{ marginLeft: 'auto', position: 'relative' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowPinMenu(!showPinMenu);
              }}
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
              <MdMoreVert size={20} />
            </button>

            {/* ピン留めメニュー */}
            {showPinMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '4px',
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  minWidth: '180px',
                  zIndex: 10,
                }}
              >
                <button
                  onClick={handlePinToggle}
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'none',
                    border: 'none',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'var(--text)',
                    fontSize: '14px',
                    fontWeight: 500,
                    transition: 'background 0.2s',
                    opacity: isLoading ? 0.6 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) {
                      e.currentTarget.style.background = 'var(--border)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'none';
                  }}
                >
                  <MdPushPin size={18} />
                  <span>{post.isPinned ? 'ピン留めを解除' : 'プロフィールにピン留め'}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 返信先の表示 */}
      {post.replyToUserName && (
        <div
          style={{
            color: 'var(--text-secondary)',
            fontSize: '13px',
            marginBottom: '8px',
            marginLeft: '52px', // アバターの幅 + マージンに合わせる
          }}
        >
          <span style={{ marginRight: '4px' }}>💬</span>
          <span>
            {post.replyToUserName}さんへの返信
          </span>
        </div>
      )}

      {/* 本文（メンション対応） */}
      <div
        style={{
          color: 'var(--text)',
          fontSize: '15px',
          lineHeight: '1.5',
          marginBottom: '12px',
          marginLeft: '52px', // アバターの幅 + マージンに合わせる
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {post.content.split(/(@[a-zA-Z0-9_]+)/g).map((part, index) => {
          // @usernameの場合
          if (part.match(/^@[a-zA-Z0-9_]+$/)) {
            return (
              <span
                key={index}
                onClick={async (e) => {
                  e.stopPropagation();
                  const username = part.substring(1);
                  console.log('Mention clicked:', username);

                  // usernameからuserIdを取得
                  const userId = await getUserIdByUsername(username);
                  if (userId && onUserClick) {
                    onUserClick(userId);
                  } else {
                    console.warn('User not found:', username);
                  }
                }}
                style={{
                  color: 'var(--primary)',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                {part}
              </span>
            );
          }
          return part;
        })}
      </div>

      {/* レシピデータ */}
      {post.recipeData && (
        <div
          style={{
            marginBottom: '12px',
            marginLeft: '52px', // アバターの幅 + マージンに合わせる
            padding: '16px',
            background: 'linear-gradient(135deg, rgba(22, 163, 74, 0.05), rgba(129, 199, 132, 0.05))',
            borderRadius: '16px',
            border: '2px solid var(--primary)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <div
              style={{
                fontSize: '20px',
              }}
            >
              👨‍🍳
            </div>
            <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text)' }}>
              {post.recipeData.title}
            </div>
            <div
              style={{
                marginLeft: 'auto',
                padding: '4px 12px',
                background: 'var(--primary)',
                color: 'white',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              {post.recipeData.difficulty === 'easy' ? '簡単' : post.recipeData.difficulty === 'medium' ? '普通' : '難しい'}
            </div>
          </div>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            {post.recipeData.description}
          </div>
          <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            <span>🍽️ {post.recipeData.servings}人分</span>
            <span>⏱️ {post.recipeData.preparationTime + post.recipeData.cookingTime}分</span>
          </div>

          {/* 材料 */}
          {post.recipeData.ingredients && post.recipeData.ingredients.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text)', marginBottom: '8px' }}>
                📝 材料
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: 'var(--text)', lineHeight: '1.8' }}>
                {post.recipeData.ingredients.map((ingredient, index) => (
                  <li key={index}>{ingredient}</li>
                ))}
              </ul>
            </div>
          )}

          {/* 作り方 */}
          {post.recipeData.instructions && post.recipeData.instructions.length > 0 && (
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text)', marginBottom: '8px' }}>
                👨‍🍳 作り方
              </div>
              <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: 'var(--text)', lineHeight: '1.8' }}>
                {post.recipeData.instructions.map((instruction, index) => (
                  <li key={index} style={{ marginBottom: '4px' }}>{instruction}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}

      {/* 引用リポスト */}
      {post.quotedPost && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            onPostClick(post.quotedPost!.id);
          }}
          style={{
            marginBottom: '12px',
            marginLeft: '52px', // アバターの幅 + マージンに合わせる
            padding: '12px',
            background: 'var(--background)',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            cursor: 'pointer',
            transition: 'background-color 0.15s ease-out, border-color 0.15s ease-out',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--border)';
            e.currentTarget.style.borderColor = 'var(--text-secondary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--background)';
            e.currentTarget.style.borderColor = 'var(--border)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: post.quotedPost.authorAvatar
                  ? `url(${post.quotedPost.authorAvatar}) center/cover`
                  : 'linear-gradient(135deg, var(--primary), #81c784)',
              }}
            />
            <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text)' }}>
              {post.quotedPost.authorName}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {getRelativeTime(post.quotedPost.createdAt)}
            </div>
          </div>
          <div
            style={{
              fontSize: '14px',
              color: 'var(--text)',
              lineHeight: '1.4',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              marginBottom: post.quotedPost.recipeData ? '8px' : '0',
            }}
          >
            {post.quotedPost.content}
          </div>
          {post.quotedPost.recipeData && (
            <div
              style={{
                marginBottom: '8px',
                padding: '8px',
                background: 'rgba(22, 163, 74, 0.05)',
                borderRadius: '8px',
                border: '1px solid var(--primary)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span style={{ fontSize: '14px' }}>👨‍🍳</span>
                <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text)' }}>
                  {post.quotedPost.recipeData.title}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {post.quotedPost.recipeData.description}
              </div>
            </div>
          )}
          {post.quotedPost.images && post.quotedPost.images.length > 0 && (
            <div
              style={{
                marginTop: '8px',
                width: '100%',
                paddingBottom: '40%',
                position: 'relative',
                borderRadius: '8px',
                overflow: 'hidden',
                background: 'var(--border)',
              }}
            >
              <img
                src={post.quotedPost.images[0]}
                alt="引用元画像"
                loading="lazy"
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
            gap: '2px',
            marginBottom: '12px',
            marginLeft: '52px', // アバターの幅 + マージンに合わせる
            borderRadius: '16px',
            overflow: 'hidden',
          }}
        >
          {post.images.map((image, index) => (
            <div
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setImageModalIndex(index);
                setImageModalOpen(true);
              }}
              style={{
                width: '100%',
                paddingBottom: post.images!.length === 1 ? '56.25%' : '100%', // 16:9 or 1:1
                position: 'relative',
                borderRadius: '0',
                overflow: 'hidden',
                background: 'var(--border)',
                cursor: 'pointer',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              <img
                src={image}
                alt={`投稿画像 ${index + 1}`}
                loading="lazy"
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
        className="post-actions-modern"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginLeft: '52px',
          marginTop: '16px',
          maxWidth: '425px',
        }}
      >
        {/* いいね */}
        <button
          onClick={handleLike}
          className={`action-button-modern ${liked ? 'liked' : ''}`}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            padding: '10px',
            borderRadius: '12px',
            color: liked ? '#f4212e' : 'var(--text-secondary)',
            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            position: 'relative',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = liked ? 'rgba(244, 33, 46, 0.1)' : 'rgba(244, 33, 46, 0.08)';
            e.currentTarget.style.transform = 'scale(1.1)';
            if (!liked) {
              e.currentTarget.style.color = '#f4212e';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.transform = 'scale(1)';
            if (!liked) {
              e.currentTarget.style.color = 'var(--text-secondary)';
            }
          }}
        >
          {liked ? <MdFavorite size={20} /> : <MdFavoriteBorder size={20} />}
          {localLikes > 0 && (
            <span style={{ fontSize: '14px', fontWeight: 500, marginLeft: '2px' }}>{formatCount(localLikes)}</span>
          )}
        </button>

        {/* コメント */}
        <button
          onClick={handleComment}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%',
            color: 'var(--text-secondary)',
            transition: 'background-color 0.2s ease-out, color 0.2s ease-out',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(29, 155, 240, 0.1)';
            e.currentTarget.style.color = '#1d9bf0';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <MdComment size={18.75} />
          {post.commentCount > 0 && (
            <span style={{ fontSize: '13px', fontWeight: 400, marginLeft: '4px' }}>{formatCount(post.commentCount)}</span>
          )}
        </button>

        {/* リポスト */}
        <button
          onClick={handleRepost}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%',
            color: reposted ? '#00ba7c' : 'var(--text-secondary)',
            transition: 'background-color 0.2s ease-out, color 0.2s ease-out',
            opacity: isLoading ? 0.6 : 1,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 186, 124, 0.1)';
            if (!reposted) e.currentTarget.style.color = '#00ba7c';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            if (!reposted) e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <MdRepeat size={18.75} />
          {localRepostCount > 0 && (
            <span style={{ fontSize: '13px', fontWeight: 400, marginLeft: '4px' }}>{formatCount(localRepostCount)}</span>
          )}
        </button>

        {/* 引用リポスト */}
        {onQuoteRepost && (
          <button
            onClick={handleQuoteRepost}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              color: 'var(--text-secondary)',
              transition: 'background-color 0.2s ease-out, color 0.2s ease-out',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 186, 124, 0.1)';
              e.currentTarget.style.color = '#00ba7c';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
          >
            <MdFormatQuote size={18.75} />
          </button>
        )}

        {/* ブックマーク */}
        <button
          onClick={handleBookmark}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%',
            color: bookmarked ? '#1d9bf0' : 'var(--text-secondary)',
            transition: 'background-color 0.2s ease-out, color 0.2s ease-out',
            opacity: isLoading ? 0.6 : 1,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(29, 155, 240, 0.1)';
            if (!bookmarked) e.currentTarget.style.color = '#1d9bf0';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            if (!bookmarked) e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          {bookmarked ? <MdBookmark size={18.75} /> : <MdBookmarkBorder size={18.75} />}
        </button>

        {/* 共有 */}
        <button
          onClick={handleShare}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%',
            color: 'var(--text-secondary)',
            transition: 'background-color 0.2s ease-out',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(29, 155, 240, 0.1)';
            e.currentTarget.style.color = '#1d9bf0';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <MdShare size={18.75} />
        </button>
      </div>

      {/* 画像モーダル */}
      {imageModalOpen && post.images && post.images.length > 0 && (
        <ImageModal
          images={post.images}
          initialIndex={imageModalIndex}
          onClose={() => setImageModalOpen(false)}
        />
      )}
    </div>
  );
});

// React.memoでメモ化してパフォーマンスを最適化
export const PostCard = PostCardComponent;

