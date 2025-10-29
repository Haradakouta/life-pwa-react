/**
 * 投稿カードのスケルトンローディング表示
 */
export const PostCardSkeleton: React.FC = () => {
  return (
    <div
      style={{
        padding: '16px 20px',
        background: 'var(--card)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* ヘッダー部分 */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
        {/* アバター */}
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'var(--border)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
        <div style={{ flex: 1 }}>
          {/* 名前 */}
          <div
            style={{
              width: '120px',
              height: '16px',
              background: 'var(--border)',
              borderRadius: '4px',
              marginBottom: '8px',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
          {/* ユーザー名 */}
          <div
            style={{
              width: '80px',
              height: '12px',
              background: 'var(--border)',
              borderRadius: '4px',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
        </div>
      </div>

      {/* 本文 */}
      <div style={{ marginBottom: '12px' }}>
        <div
          style={{
            width: '100%',
            height: '12px',
            background: 'var(--border)',
            borderRadius: '4px',
            marginBottom: '8px',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
        <div
          style={{
            width: '80%',
            height: '12px',
            background: 'var(--border)',
            borderRadius: '4px',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
      </div>

      {/* アクションボタン */}
      <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              width: '60px',
              height: '16px',
              background: 'var(--border)',
              borderRadius: '4px',
              animation: 'pulse 1.5s ease-in-out infinite',
            }}
          />
        ))}
      </div>

      {/* アニメーション定義 */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};
