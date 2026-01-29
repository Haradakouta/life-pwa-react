import React, { useEffect, useState } from 'react';
import { MdClose, MdInstallMobile, MdShare, MdAddBox } from 'react-icons/md';

/**
 * PWAインストールを促すプロンプト
 * ブラウザで開いている場合のみ表示され、PWA(スタンドアロン)モードでは非表示になる
 */
export const PWAInstallPrompt: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // すでにPWAモード(スタンドアロン)で起動しているかチェック
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;

        if (isStandalone) {
            console.log('App is running in standalone mode. No install prompt needed.');
            return;
        }

        // iOSの判定
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(isIosDevice);

        // Chrome/Android用: beforeinstallpromptイベントを捕捉
        const handleBeforeInstallPrompt = (e: any) => {
            // Chrome 67以前で自動的にプロンプトが表示されるのを防ぐ
            e.preventDefault();
            // イベントを保持しておく
            setDeferredPrompt(e);
            // プロンプトを表示する
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // iOSの場合は、初回訪問時などに独自判定で出すことも可能だが、
        // ここではシンプルに「まだインストールしていない」場合に表示する
        if (isIosDevice) {
            // iOSはイベントが発火しないため、即時表示（あるいはlocalStorageで制御）
            // 毎回出るとウザいので、一度閉じたら一定期間出さない処理を入れるのが一般的
            const lastDismissed = localStorage.getItem('pwa_install_dismissed');
            if (!lastDismissed || Date.now() - parseInt(lastDismissed) > 7 * 24 * 60 * 60 * 1000) { // 1週間
                setShowPrompt(true);
            }
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            // Android/Chrome: インストールプロンプトを表示
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User response to the install prompt: ${outcome}`);
            setDeferredPrompt(null);
            setShowPrompt(false);
        }
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        // 閉じた時間を記録
        localStorage.setItem('pwa_install_dismissed', Date.now().toString());
    };

    if (!showPrompt) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '80px', // ナビゲーションバーの上
            left: '16px',
            right: '16px',
            background: 'var(--card-bg)',
            color: 'var(--text-primary)',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
            zIndex: 2000,
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            border: '1px solid var(--border)',
            animation: 'slideUp 0.3s ease-out'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        padding: '10px',
                        borderRadius: '12px',
                        color: 'white'
                    }}>
                        <MdInstallMobile size={24} />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>アプリをインストール</h3>
                        <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                            ホーム画面に追加して、より快適に利用しましょう
                        </p>
                    </div>
                </div>
                <button onClick={handleDismiss} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}>
                    <MdClose size={20} />
                </button>
            </div>

            {isIOS ? (
                <div style={{ fontSize: '13px', background: 'var(--background)', padding: '12px', borderRadius: '8px' }}>
                    <ol style={{ paddingLeft: '20px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <li>
                            ブラウザメニューの <span style={{ display: 'inline-flex', alignItems: 'center', verticalAlign: 'middle', color: '#007AFF' }}><MdShare /></span> (共有) をタップ
                        </li>
                        <li>
                            「<span style={{ fontWeight: 'bold' }}>ホーム画面に追加</span>」 <span style={{ display: 'inline-flex', alignItems: 'center', verticalAlign: 'middle' }}><MdAddBox /></span> を選択
                        </li>
                    </ol>
                </div>
            ) : (
                <button
                    onClick={handleInstallClick}
                    style={{
                        background: 'var(--primary)',
                        color: 'white',
                        border: 'none',
                        padding: '12px',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        width: '100%',
                        fontSize: '14px'
                    }}
                >
                    インストールする
                </button>
            )}

            <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
        </div>
    );
};
