import { useState, useEffect } from 'react';
import { getUserCosmetics, getCosmeticById } from '../../utils/cosmetic';

interface AvatarWithFrameProps {
  userId: string;
  avatarUrl?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  style?: React.CSSProperties;
}

/**
 * フレーム付きアバターコンポーネント
 * ユーザーの装飾フレームを表示し、その中にアバター画像を配置します
 */
export const AvatarWithFrame: React.FC<AvatarWithFrameProps> = ({
  userId,
  avatarUrl,
  size = 'medium',
  className,
  style,
}) => {
  const [frameUrl, setFrameUrl] = useState<string | undefined>(undefined);
  const [inlineStyle, setInlineStyle] = useState<React.CSSProperties | undefined>(undefined);

  // サイズの設定
  const sizeConfig = {
    small: { iconSize: 40, frameExtra: 17, baseSize: 48 },
    medium: { iconSize: 68, frameExtra: 21, baseSize: 80 },
    large: { iconSize: 100, frameExtra: 30, baseSize: 120 },
  };

  const config = sizeConfig[size];
  const containerSize = config.baseSize + config.frameExtra * 2;
  const iconOffset = (containerSize - config.iconSize) / 2;

  useEffect(() => {
    let mounted = true;

    const loadFrame = async () => {
      try {
        const data = await getUserCosmetics(userId);
        if (!mounted || !data?.equippedFrame) {
          setFrameUrl(undefined);
          setInlineStyle(undefined);
          return;
        }

        const cosmetic = getCosmeticById(data.equippedFrame);
        let url = cosmetic?.data.frameUrl as string | undefined;
        const style = cosmetic?.data.frameStyle as React.CSSProperties | undefined;

        // BASE_URLを正しく取得
        const base = import.meta.env.BASE_URL || '/';

        // 画像ファイル名の自動解決（拡張子/命名ゆらぎに対応）
        if (!url) {
          const candidates: string[] = [];
          const names = [
            data.equippedFrame,
            cosmetic?.name || '',
            cosmetic?.id || '',
          ].filter(Boolean);

          const exts = ['png', 'webp', 'jpg', 'jpeg'];
          for (const name of names) {
            const safe = name
              .toString()
              .toLowerCase()
              .replace(/\s+/g, '_')
              .replace(/[\u3000]/g, '_');

            for (const ext of exts) {
              candidates.push(`${base}frames/${safe}.${ext}`);
              candidates.push(`${base}frames/frame_${safe}.${ext}`);
            }
          }

          url = await findFirstExistingImage(candidates);
        } else {
          // frameUrlが定義されている場合、BASE_URLを考慮して正しいパスに変換
          if (!url.startsWith('http://') && !url.startsWith('https://')) {
            if (!url.startsWith(base)) {
              url = `${base}${url.replace(/^\//, '')}`;
            }
          }
        }

        if (mounted) {
          setFrameUrl(url || undefined);
          setInlineStyle(style);
        }
      } catch (error) {
        console.error('[AvatarWithFrame] フレーム取得エラー:', error);
        if (mounted) {
          setFrameUrl(undefined);
          setInlineStyle(undefined);
        }
      }
    };

    loadFrame();

    return () => {
      mounted = false;
    };
  }, [userId]);

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: `${containerSize}px`,
        height: `${containerSize}px`,
        ...style,
      }}
    >
      {/* フレーム（背景/下層） */}
      {frameUrl ? (
        <img
          src={frameUrl}
          alt="frame"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      ) : inlineStyle ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 1,
            ...inlineStyle,
          }}
        />
      ) : null}

      {/* アイコン（上層、少し小さく） */}
      <div
        style={{
          position: 'absolute',
          left: `${iconOffset}px`,
          top: `${iconOffset}px`,
          width: `${config.iconSize}px`,
          height: `${config.iconSize}px`,
          borderRadius: '0px',
          background: avatarUrl
            ? `url(${avatarUrl}) center/cover`
            : 'linear-gradient(135deg, var(--primary), #81c784)',
          zIndex: 2,
        }}
      />
    </div>
  );
};

/**
 * 画像が存在するかチェック
 * @param src - チェックする画像のURL
 * @returns 画像が存在する場合はtrue、存在しない場合はfalse
 */
async function imageExists(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
}

/**
 * 候補画像リストから最初に存在する画像を返す
 * @param candidates - チェックする画像URLの配列
 * @returns 最初に見つかった画像のURL、見つからない場合はundefined
 */
async function findFirstExistingImage(candidates: string[]): Promise<string | undefined> {
  for (const src of candidates) {
    const exists = await imageExists(src);
    if (exists) return src;
  }
  return undefined;
}

