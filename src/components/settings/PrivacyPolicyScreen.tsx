import React from 'react';
import { MdArrowBack } from 'react-icons/md';

interface PrivacyPolicyScreenProps {
  onBack: () => void;
}

export const PrivacyPolicyScreen: React.FC<PrivacyPolicyScreenProps> = ({ onBack }) => {
  return (
    <div className="screen active policy-screen">
      <div className="policy-header">
        <button onClick={onBack} className="back-button">
          <MdArrowBack /> 戻る
        </button>
        <h2>プライバシーポリシー</h2>
        <div style={{ width: 40 }} /> {/* Spacer for centering */}
      </div>

      <div className="policy-content">
        <div className="card">
          <h3>1. 個人情報の収集について</h3>
          <p>
            当アプリケーションでは、ユーザーによりよいサービスを提供するために、必要な範囲で個人情報を収集することがあります。
            収集する情報は、利用目的を明示し、適法かつ公正な手段によって行います。
          </p>

          <h3>2. 情報の利用目的</h3>
          <p>収集した情報は、以下の目的で利用します。</p>
          <ul>
            <li>サービスの提供・運営のため</li>
            <li>ユーザーからのお問い合わせに回答するため</li>
            <li>機能改善や新機能の開発のため</li>
          </ul>

          <h3>3. 第三者への提供</h3>
          <p>
            法令に基づく場合を除き、あらかじめユーザーの同意を得ることなく、第三者に個人情報を提供することはありません。
          </p>

          <h3>4. セキュリティ対策</h3>
          <p>
            当アプリケーションは、個人情報の漏洩、滅失またはき損の防止その他の個人情報の安全管理のために必要かつ適切な措置を講じます。
          </p>

          <h3>5. お問い合わせ</h3>
          <p>
            プライバシーポリシーに関するお問い合わせは、設定画面の「お問い合わせ」よりお願いいたします。
          </p>
        </div>
      </div>

      <style>{`
        .screen.active {
          padding-bottom: 80px; /* Bottom navigation spacing */
        }
        
        .policy-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          background: var(--card); /* Fallback or ensure this variable exists */
          background-color: #fff; /* Explicit fallback for light mode */
          border-bottom: 1px solid var(--border);
          position: sticky;
          top: 0;
          z-index: 10;
        }

        @media (prefers-color-scheme: dark) {
          .policy-header {
            background-color: #1a1a1a;
          }
        }

        .policy-header h2 {
          color: var(--text);
          font-size: 18px;
          margin: 0;
          font-weight: 600;
        }

        .back-button {
          padding: 8px 12px;
          border: none;
          background: transparent;
          color: var(--text);
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: background 0.3s;
        }

        .back-button:hover {
          background: var(--border);
        }

        .policy-content {
          padding: 20px 16px;
          max-width: 800px;
          margin: 0 auto;
          width: 100%;
          box-sizing: border-box;
        }

        .card {
          background: var(--card);
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border: 1px solid var(--border);
        }

        .policy-content h3 {
          color: var(--primary);
          font-size: 18px;
          margin: 24px 0 12px;
          padding-bottom: 8px;
          border-bottom: 2px solid var(--border);
        }
        
        .policy-content h3:first-child {
          margin-top: 0;
        }

        .policy-content p {
          color: var(--text);
          line-height: 1.6;
          margin-bottom: 16px;
          font-size: 15px;
        }

        .policy-content ul {
          padding-left: 24px;
          margin-bottom: 16px;
        }

        .policy-content li {
          color: var(--text);
          line-height: 1.6;
          margin-bottom: 8px;
        }
      `}</style>
    </div>
  );
};
