import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { MdAutoAwesome } from 'react-icons/md';

export const AiRecipeLoading: React.FC = () => {
  // マウント後にbody要素を取得してポータルを作成する
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // スクロールを禁止
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="ai-recipe-loading-overlay">
      <div className="content-container">
        <div className="chef-hat-container">
          <div className="chef-hat">
            <div className="hat-top"></div>
            <div className="hat-brim"></div>
          </div>
          <div className="stars">
            <MdAutoAwesome className="star star-1" />
            <MdAutoAwesome className="star star-2" />
            <MdAutoAwesome className="star star-3" />
          </div>
        </div>
        <h2 className="loading-title">AIシェフが考案中...</h2>
        <p className="loading-subtitle">冷蔵庫の中身から、最高のレシピを考えています</p>
        <div className="loading-bar">
          <div className="loading-bar-inner"></div>
        </div>
      </div>

      <style>{`
        .ai-recipe-loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(12px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          color: white;
        }

        .content-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          animation: fadeIn 0.3s ease-out;
        }

        .chef-hat-container {
          position: relative;
          width: 120px;
          height: 120px;
          margin-bottom: 32px;
        }

        .chef-hat {
          position: relative;
          transform-origin: bottom center;
          animation: bounce 2s infinite ease-in-out;
        }

        .hat-top {
          width: 60px;
          height: 50px;
          background: white;
          border-radius: 30px 30px 0 0;
          margin: 0 auto;
          position: relative;
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
        }

        .hat-top::before {
          content: '';
          position: absolute;
          left: -15px;
          top: 15px;
          width: 30px;
          height: 35px;
          background: white;
          border-radius: 50%;
        }

        .hat-top::after {
          content: '';
          position: absolute;
          right: -15px;
          top: 15px;
          width: 30px;
          height: 35px;
          background: white;
          border-radius: 50%;
        }

        .hat-brim {
          width: 90px;
          height: 18px;
          background: white;
          border-radius: 6px;
          margin: -2px auto 0;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        }

        .stars {
          position: absolute;
          top: -20px;
          left: -20px;
          width: 160px;
          height: 160px;
          pointer-events: none;
        }

        .star {
          position: absolute;
          color: #fbbf24;
          opacity: 0;
          animation: twinkle 1.5s infinite;
          filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.6));
        }

        .star-1 {
          top: 0;
          right: 20px;
          font-size: 32px;
          animation-delay: 0s;
        }

        .star-2 {
          top: 60px;
          left: 0;
          font-size: 24px;
          animation-delay: 0.5s;
        }

        .star-3 {
          top: 40px;
          right: 0;
          font-size: 18px;
          animation-delay: 1s;
        }

        .loading-title {
          font-size: 24px;
          font-weight: 700;
          margin: 0 0 8px 0;
          background: linear-gradient(135deg, #fff 0%, #e2e8f0 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .loading-subtitle {
          font-size: 14px;
          color: #94a3b8;
          margin: 0 0 32px 0;
        }

        .loading-bar {
          width: 200px;
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          overflow: hidden;
          position: relative;
        }

        .loading-bar-inner {
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;
          width: 50%;
          background: #fbbf24;
          border-radius: 2px;
          animation: slide 1.5s infinite ease-in-out;
          box-shadow: 0 0 10px rgba(251, 191, 36, 0.5);
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(3deg); }
        }

        @keyframes twinkle {
          0% { opacity: 0; transform: scale(0.5) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.2) rotate(180deg); }
          100% { opacity: 0; transform: scale(0.5) rotate(360deg); }
        }

        @keyframes slide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>,
    document.body
  );
};

