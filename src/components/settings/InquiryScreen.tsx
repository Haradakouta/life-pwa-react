/**
 * お問い合わせ画面
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getUserInquiries, submitInquiry, markInquiryAsRead } from '../../utils/inquiry';
import type { Inquiry } from '../../types/inquiry';
import { MdSend, MdArrowBack, MdMail } from 'react-icons/md';

interface InquiryScreenProps {
    onBack: () => void;
}

export const InquiryScreen: React.FC<InquiryScreenProps> = ({ onBack }) => {
    const { user } = useAuth();
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<'new' | 'history'>('history');

    useEffect(() => {
        if (user) {
            loadInquiries();
        }
    }, [user]);

    const loadInquiries = async () => {
        if (!user) return;
        try {
            const data = await getUserInquiries(user.uid);
            setInquiries(data);
        } catch (error) {
            console.error('Failed to load inquiries:', error);
            alert('お問い合わせの取得に失敗しました');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !subject.trim() || !body.trim()) return;

        setIsSubmitting(true);
        try {
            await submitInquiry(user.uid, user.email || 'unknown', subject, body);
            setSubject('');
            setBody('');
            alert('お問い合わせを送信しました。\n返信をお待ちください。');
            setActiveTab('history');
            loadInquiries();
        } catch (error) {
            console.error('Failed to submit inquiry:', error);
            alert('送信に失敗しました。後でもう一度お試しください。');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 未読の返信がある場合、既読にする処理（詳細を開いたときにするのがベストだが、ここでは簡易的に）
    // 実際にはInquiryListの中でクリックしたときに既読にするのが良い

    return (
        <div className="screen active">
            <div className="policy-header" style={{
                display: 'flex',
                alignItems: 'center',
                padding: '16px',
                background: 'var(--card)',
                borderBottom: '1px solid var(--border)',
                position: 'sticky',
                top: 0,
                zIndex: 10
            }}>
                <button
                    onClick={onBack}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text)',
                        cursor: 'pointer',
                        padding: '8px',
                        marginRight: '8px',
                        display: 'flex',
                        alignItems: 'center'
                    }}
                >
                    <MdArrowBack size={24} />
                </button>
                <h2 style={{ margin: 0, fontSize: '18px' }}>お問い合わせ</h2>
            </div>

            <div style={{ padding: '16px' }}>
                <div style={{ display: 'flex', marginBottom: '16px', gap: '8px' }}>
                    <button
                        onClick={() => setActiveTab('history')}
                        style={{
                            flex: 1,
                            padding: '12px',
                            borderRadius: '8px',
                            background: activeTab === 'history' ? 'var(--primary)' : 'var(--card)',
                            color: activeTab === 'history' ? 'white' : 'var(--text)',
                            border: activeTab === 'history' ? 'none' : '1px solid var(--border)',
                            cursor: 'pointer',
                            fontWeight: '500'
                        }}
                    >
                        履歴・返信
                    </button>
                    <button
                        onClick={() => setActiveTab('new')}
                        style={{
                            flex: 1,
                            padding: '12px',
                            borderRadius: '8px',
                            background: activeTab === 'new' ? 'var(--primary)' : 'var(--card)',
                            color: activeTab === 'new' ? 'white' : 'var(--text)',
                            border: activeTab === 'new' ? 'none' : '1px solid var(--border)',
                            cursor: 'pointer',
                            fontWeight: '500'
                        }}
                    >
                        新規作成
                    </button>
                </div>

                {activeTab === 'new' ? (
                    <div className="card">
                        <h3 style={{ marginTop: 0, marginBottom: '16px' }}>お問い合わせ内容</h3>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>件名</label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="件名を入力してください"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border)',
                                        background: 'var(--background)',
                                        color: 'var(--text)',
                                        boxSizing: 'border-box'
                                    }}
                                    required
                                />
                            </div>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>本文</label>
                                <textarea
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    placeholder="お問い合わせ内容を入力してください"
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border)',
                                        background: 'var(--background)',
                                        color: 'var(--text)',
                                        minHeight: '150px',
                                        boxSizing: 'border-box',
                                        resize: 'vertical'
                                    }}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="submit"
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                {isSubmitting ? '送信中...' : (
                                    <>
                                        <MdSend /> 送信する
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="inquiry-list">
                        {inquiries.length === 0 ? (
                            <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
                                <MdMail size={48} color="var(--text-secondary)" />
                                <p>お問い合わせ履歴はありません</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {inquiries.map((inquiry) => (
                                    <InquiryItem key={inquiry.id} inquiry={inquiry} />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const InquiryItem: React.FC<{ inquiry: Inquiry }> = ({ inquiry }) => {
    const [isOpen, setIsOpen] = useState(false);
    const isUnread = inquiry.status === 'replied' && !inquiry.isRead;

    const handleToggle = async () => {
        setIsOpen(!isOpen);
        if (!isOpen && isUnread) {
            // 開いたときに既読にする
            try {
                await markInquiryAsRead(inquiry.id);
                // 状態更新は親でやるべきだが、ここでは見た目だけ
                inquiry.isRead = true;
            } catch (e) {
                console.error(e);
            }
        }
    };

    return (
        <div className="card" style={{ padding: '0', overflow: 'hidden', border: isUnread ? '2px solid var(--primary)' : '1px solid var(--border)' }}>
            <div
                onClick={handleToggle}
                style={{
                    padding: '16px',
                    cursor: 'pointer',
                    background: isUnread ? 'rgba(var(--primary-rgb), 0.05)' : 'transparent'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                        background: 'var(--background)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        border: '1px solid var(--border)'
                    }}>
                        {new Date(inquiry.createdAt).toLocaleDateString()}
                    </span>
                    <span style={{
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        color: inquiry.status === 'replied' ? '#10b981' : (inquiry.status === 'closed' ? '#6b7280' : '#f59e0b'),
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}>
                        {isUnread && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'red', display: 'inline-block' }}></span>}
                        {inquiry.status === 'replied' ? '返信あり' : (inquiry.status === 'closed' ? '完了' : '受付中')}
                    </span>
                </div>
                <h4 style={{ margin: '0 0 4px', fontSize: '1rem' }}>{inquiry.subject}</h4>
                <p style={{
                    margin: 0,
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                }}>
                    {inquiry.body}
                </p>
            </div>

            {isOpen && (
                <div style={{ padding: '16px', borderTop: '1px solid var(--border)', background: 'var(--background)' }}>
                    <div style={{ marginBottom: '16px' }}>
                        <p style={{ whiteSpace: 'pre-wrap', margin: 0, lineHeight: 1.6 }}>{inquiry.body}</p>
                    </div>

                    {inquiry.reply && (
                        <div style={{
                            background: 'var(--card)',
                            padding: '16px',
                            borderRadius: '8px',
                            border: '1px solid var(--border)',
                            marginTop: '16px'
                        }}>
                            <h5 style={{ margin: '0 0 8px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                管理者からの返信
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>
                                    {inquiry.replyAt && new Date(inquiry.replyAt).toLocaleString()}
                                </span>
                            </h5>
                            <p style={{ whiteSpace: 'pre-wrap', margin: 0, lineHeight: 1.6 }}>{inquiry.reply}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
