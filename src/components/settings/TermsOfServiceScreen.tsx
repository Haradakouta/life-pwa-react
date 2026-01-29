import React from 'react';
import { MdArrowBack } from 'react-icons/md';

interface TermsOfServiceScreenProps {
  onBack: () => void;
}

export const TermsOfServiceScreen: React.FC<TermsOfServiceScreenProps> = ({ onBack }) => {
  return (
    <div className="screen active policy-screen">
      <div className="policy-header">
        <button onClick={onBack} className="back-button">
          <MdArrowBack /> 戻る
        </button>
        <h2>利用規約</h2>
        <div style={{ width: 40 }} /> {/* Spacer for centering */}
      </div>

      <div className="policy-content">
        <div className="card">
          <h3>1. はじめに</h3>
          <p>
            この利用規約（以下「本規約」）は、当アプリケーションの利用条件を定めるものです。
            ユーザーの皆様には、本規約に従って本サービスをご利用いただきます。
          </p>

          <h3>2. 禁止事項</h3>
          <p>ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。</p>
          <ul>
            <li>法令または公序良俗に違反する行為</li>
            <li>犯罪行為に関連する行為</li>
            <li>当サービスの内容等、本サービスに含まれる著作権、商標権ほか知的財産権を侵害する行為</li>
            <li>不正な目的を持って本サービスを利用する行為</li>
          </ul>

          <h3>3. 免責事項</h3>
          <p>
            当サービスの提供する情報の正確性には万全を期していますが、その内容を保証するものではありません。
            当サービスの利用によって生じた損害について、運営者は一切の責任を負いません。
          </p>

          <h3>4. 規約の変更</h3>
          <p>
            運営者は、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。
          </p>

          <h3>5. 準拠法・裁判管轄</h3>
          <p>
            本規約の解釈にあたっては、日本法を準拠法とします。
          </p>

          <h3>6. AI技術の利用とセキュリティ</h3>
          <p>
            本サービスは、最先端の生成AI技術を活用した「バイブコーディング」手法により開発されています。
            AIによるコード生成においては、厳格なセキュリティ基準を適用し、人間のエンジニアによる多重のコードレビューとセキュリティ監査を実施しています。
            これにより、AIの創造性と人間の監視を組み合わせ、革新的かつ安全なサービスを提供することを保証します。
            ユーザーの皆様は、セキュリティ上の懸念なく安心して本サービスをご利用いただけます。
          </p>
        </div>
      </div>

      <style>{`
        .screen.active {
          padding-bottom: 80px;
        }

        .policy-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          background: var(--card);
          background-color: #fff;
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
