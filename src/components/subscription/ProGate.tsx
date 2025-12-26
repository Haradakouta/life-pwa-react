import React from 'react';
import { useSubscription } from '../../hooks/useSubscription';
import { MdLock } from 'react-icons/md';
import { UpgradeButton } from './UpgradeButton';

interface ProGateProps {
    children: React.ReactNode;
    featureName: string;
    description?: string;
    lockType?: 'overlay' | 'hide' | 'replace'; // UI style
}

export const ProGate: React.FC<ProGateProps> = ({
    children,
    featureName,
    description = 'この機能を使用するにはプレミアムプランへの登録が必要です。',
    lockType = 'overlay'
}) => {
    const { isPro, loading } = useSubscription();

    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>Loading status...</div>;
    }

    if (isPro) {
        return <>{children}</>;
    }

    if (lockType === 'hide') return null;

    if (lockType === 'replace') {
        return (
            <div style={{
                background: '#f8fafc',
                border: '1px dashed #cbd5e1',
                borderRadius: '12px',
                padding: '32px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px'
            }}>
                <div style={{
                    background: '#FEF3C7',
                    padding: '12px',
                    borderRadius: '50%',
                    color: '#D97706'
                }}>
                    <MdLock size={32} />
                </div>
                <div>
                    <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 'bold' }}>
                        {featureName} はPRO限定です
                    </h3>
                    <p style={{ margin: '0', color: '#64748b', fontSize: '14px' }}>
                        {description}
                    </p>
                </div>
                <div style={{ width: '100%', maxWidth: '300px' }}>
                    <UpgradeButton />
                </div>
            </div>
        );
    }

    // Default 'overlay'
    return (
        <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 'inherit' }}>
            <div style={{ filter: 'blur(4px)', pointerEvents: 'none', userSelect: 'none' }}>
                {children}
            </div>
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(2px)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 10,
                padding: '24px'
            }}>
                <div style={{
                    background: 'white',
                    padding: '24px',
                    borderRadius: '16px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    maxWidth: '90%',
                    width: '320px',
                    textAlign: 'center'
                }}>
                    <div style={{
                        display: 'inline-flex',
                        background: '#FEF3C7',
                        padding: '12px',
                        borderRadius: '50%',
                        color: '#D97706',
                        marginBottom: '16px'
                    }}>
                        <MdLock size={24} />
                    </div>
                    <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 'bold' }}>PRO限定機能</h3>
                    <p style={{ margin: '0 0 20px', color: '#64748b', fontSize: '14px' }}>
                        {featureName} を利用するにはアップグレードが必要です。<br />
                        {description}
                    </p>
                    <UpgradeButton />
                </div>
            </div>
        </div>
    );
};
