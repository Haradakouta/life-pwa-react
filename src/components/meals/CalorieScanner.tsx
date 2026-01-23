/**
 * カロリー計測機能（Gemini API使用）
 */
import React, { useState, useRef, useEffect } from 'react';
import { MdCamera, MdRestaurant, MdCheckCircle } from 'react-icons/md';
import { scanCalorie } from '../../api/gemini';
import { ProGate } from '../subscription/ProGate';

interface CalorieResult {
    calories: number;
    reasoning: string;
    confidence?: number;
}

interface CalorieScannerProps {
    mealName: string;
    onCalorieScanned: (calories: number, reasoning: string) => void;
    onCancel: () => void;
    autoStart?: boolean; // 自動的にカメラを起動するか
}

export const CalorieScanner: React.FC<CalorieScannerProps> = ({
    mealName,
    onCalorieScanned,
    onCancel,
    autoStart = false,
}) => {
    const [isScanning, setIsScanning] = useState(false);
    const [result, setResult] = useState<CalorieResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 自動的にカメラを起動
    useEffect(() => {
        if (autoStart && fileInputRef.current && !isScanning && !result) {
            fileInputRef.current.click();
        }
    }, [autoStart, isScanning, result]);

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsScanning(true);
        setError(null);
        setResult(null);

        try {
            const result = await scanCalorie(mealName, file);
            setResult(result);
        } catch (err) {
            console.error('カロリー計測エラー:', err);
            setError(err instanceof Error ? err.message : 'カロリー計測に失敗しました');
        } finally {
            setIsScanning(false);
        }
    };

    const handleRecord = () => {
        if (result) {
            onCalorieScanned(result.calories, result.reasoning);
        }
    };

    return (
        <ProGate
            featureName="AIカロリー計測"
            description="写真からの自動カロリー計測機能はプレミアムプラン限定です。"
        >
            <div className="card" style={{ marginTop: '16px' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <MdRestaurant size={20} />
                    カロリー計測
                </h3>

                {!result && !isScanning && (
                    <>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.6' }}>
                            料理の写真を撮影または選択してください。
                            <br />
                            料理名: <strong>{mealName}</strong>
                        </p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleImageSelect}
                            style={{ display: 'none' }}
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                width: '100%',
                                padding: '16px',
                                background: 'var(--primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                fontSize: '16px',
                                fontWeight: 600,
                            }}
                        >
                            <MdCamera size={24} />
                            写真を撮影・選択
                        </button>
                        <button
                            onClick={onCancel}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: 'var(--card)',
                                color: 'var(--text)',
                                border: '1px solid var(--border)',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                marginTop: '8px',
                                fontSize: '14px',
                            }}
                        >
                            キャンセル
                        </button>
                    </>
                )}

                {isScanning && (
                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📸</div>
                        <div style={{ fontWeight: 600, marginBottom: '8px' }}>カロリーを計測中...</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            AIが料理を分析しています
                        </div>
                    </div>
                )}

                {error && (
                    <div style={{ padding: '16px', background: '#fee', border: '1px solid #fcc', borderRadius: '8px', color: '#c33' }}>
                        <strong>エラー:</strong> {error}
                        <button
                            onClick={() => {
                                setError(null);
                                fileInputRef.current?.click();
                            }}
                            style={{
                                marginTop: '12px',
                                padding: '8px 16px',
                                background: 'var(--primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                            }}
                        >
                            再試行
                        </button>
                    </div>
                )}

                {result && (
                    <div>
                        <div style={{ padding: '24px', background: '#e8f5e9', border: '2px solid #4caf50', borderRadius: '12px', marginBottom: '16px', textAlign: 'center' }}>
                            <MdCheckCircle size={32} color="#4caf50" style={{ marginBottom: '8px' }} />
                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#2e7d32' }}>
                                {result.calories} kcal
                            </div>
                        </div>
                        <button
                            onClick={handleRecord}
                            style={{
                                width: '100%',
                                padding: '16px',
                                background: 'var(--primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: 600,
                                marginBottom: '8px',
                            }}
                        >
                            食事記録に記録する
                        </button>
                        <button
                            onClick={() => {
                                setResult(null);
                                fileInputRef.current?.click();
                            }}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: 'var(--card)',
                                color: 'var(--text)',
                                border: '1px solid var(--border)',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '14px',
                            }}
                        >
                            別の写真を選択
                        </button>
                    </div>
                )}
            </div>
        </ProGate>
    );
};

