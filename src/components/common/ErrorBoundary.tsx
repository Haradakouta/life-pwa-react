/**
 * エラーバウンダリコンポーネント
 */
import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { MdErrorOutline } from 'react-icons/md';
import { withTranslation } from 'react-i18next';
import type { WithTranslation } from 'react-i18next';

interface Props extends WithTranslation {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundaryBase extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });

    // エラーログをFirestoreに送信（オプション）
    // エラーロガーが利用可能な場合のみ送信
    // 注意: エラーバウンダリ内では動的インポートを使用する
    if (typeof window !== 'undefined') {
      // エラーロガーは別途設定されている場合のみ動作
      // ここではコンソールに記録するだけ
      console.error('ErrorBoundary: エラーをキャッチしました', {
        message: error.message,
        stack: error.stack,
        url: window.location.href,
        timestamp: new Date().toISOString(),
      });
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    const { t } = this.props;

    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
          padding: '24px',
          textAlign: 'center',
          color: 'var(--text)',
        }}>
          <MdErrorOutline size={64} color="#ef4444" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>
            {t('common.errorBoundary.title')}
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            {t('common.errorBoundary.description')}
          </p>
          {this.state.error && (
            <details style={{
              width: '100%',
              maxWidth: '600px',
              marginBottom: '24px',
              padding: '12px',
              background: 'var(--background)',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              textAlign: 'left',
            }}>
              <summary style={{ cursor: 'pointer', marginBottom: '8px', fontSize: '13px' }}>
                {t('common.errorBoundary.details')}
              </summary>
              <pre style={{
                fontSize: '12px',
                color: 'var(--text-secondary)',
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
              }}>
                {this.state.error.message}
                {this.state.error.stack && `\n\n${this.state.error.stack}`}
              </pre>
            </details>
          )}
          <button
            onClick={this.handleReset}
            style={{
              padding: '12px 24px',
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'var(--primary-dark)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'var(--primary)';
            }}
          >
            {t('common.errorBoundary.retry')}
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export const ErrorBoundary = withTranslation()(ErrorBoundaryBase);


