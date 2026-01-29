import React, { useState, useMemo } from 'react';
import { MdArrowBack, MdAdd, MdDelete, MdEdit, MdShowChart, MdAccountBalanceWallet, MdBusinessCenter } from 'react-icons/md';
import { useAssetStore } from '../../store/useAssetStore';
import type { Asset, AssetFormData, AssetType } from '../../types/asset';
import styled from '@emotion/styled';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const Screen = styled.div`
  padding-bottom: 80px;
  background: var(--background);
  min-height: 100vh;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: var(--card);
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid var(--border);
`;

const TotalAssetCard = styled.div`
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  color: white;
  margin: 16px;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  text-align: center;
`;

const SectionTitle = styled.h3`
  margin: 16px 16px 8px;
  font-size: 16px;
  color: var(--text-secondary);
`;

const AssetList = styled.div`
  padding: 0 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const AssetCard = styled.div`
  background: var(--card);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  border: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const AssetIcon = styled.div<{ color?: string }>`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: ${props => props.color || 'var(--primary)'}20;
  color: ${props => props.color || 'var(--primary)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-right: 12px;
`;

// Modal Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background: var(--card);
  width: 90%;
  max-width: 400px;
  max-height: 85vh;
  overflow-y: auto;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.2);
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
`;

const Input = styled.input`
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--input-bg, #fff);
  color: var(--text);
  font-size: 16px;
`;

const Select = styled.select`
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--input-bg, #fff);
  color: var(--text);
  font-size: 16px;
`;

const Button = styled.button<{ variant?: 'primary' | 'danger' | 'secondary' }>`
  padding: 12px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  background: ${props =>
        props.variant === 'primary' ? 'var(--primary)' :
            props.variant === 'danger' ? '#ef4444' :
                'var(--border)'
    };
  color: ${props => props.variant === 'secondary' ? 'var(--text)' : 'white'};
  width: 100%;
`;

interface AssetScreenProps {
    onBack: () => void;
}

const ASSET_TYPES: { id: AssetType; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'cash', label: '現金', icon: <MdAccountBalanceWallet />, color: '#10b981' },
    { id: 'bank', label: '銀行口座', icon: <MdAccountBalanceWallet />, color: '#3b82f6' },
    { id: 'securities', label: '証券・投資信託', icon: <MdShowChart />, color: '#8b5cf6' },
    { id: 'crypto', label: '暗号資産', icon: <MdBusinessCenter />, color: '#f59e0b' },
    { id: 'points', label: 'ポイント', icon: <MdShowChart />, color: '#ec4899' },
    { id: 'real_estate', label: '不動産', icon: <MdBusinessCenter />, color: '#6366f1' },
    { id: 'other', label: 'その他', icon: <MdBusinessCenter />, color: '#64748b' },
];

export const AssetScreen: React.FC<AssetScreenProps> = ({ onBack }) => {
    const { assets, addAsset, updateAsset, deleteAsset } = useAssetStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState<{
        title: string;
        type: AssetType;
        amount: string;
        quantity: string;
        currentPrice: string;
        code: string;
    }>({
        title: '',
        type: 'bank',
        amount: '',
        quantity: '',
        currentPrice: '',
        code: '',
    });

    const totalAmount = useMemo(() => assets.reduce((sum, a) => sum + a.amount, 0), [assets]);

    const handleSubmit = () => {
        if (!formData.title) {
            alert('タイトルを入力してください');
            return;
        }

        const data: AssetFormData = {
            title: formData.title,
            type: formData.type,
            amount: parseFloat(formData.amount) || 0,
            quantity: parseFloat(formData.quantity) || 0,
            currentPrice: parseFloat(formData.currentPrice) || 0,
            code: formData.code,
        };

        if (editingId) {
            updateAsset(editingId, data);
        } else {
            addAsset(data);
        }
        closeModal();
    };

    const openEdit = (asset: Asset) => {
        setEditingId(asset.id);
        setFormData({
            title: asset.title,
            type: asset.type,
            amount: String(asset.amount),
            quantity: String(asset.quantity || 0),
            currentPrice: String(asset.currentPrice || 0),
            code: asset.code || '',
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({
            title: '',
            type: 'bank',
            amount: '',
            quantity: '',
            currentPrice: '',
            code: '',
        });
    };

    const handleDelete = (id: string) => {
        if (window.confirm('本当に削除しますか？')) {
            deleteAsset(id);
        }
    };

    const getTypeInfo = (type: AssetType) => ASSET_TYPES.find(t => t.id === type) || ASSET_TYPES[6];

    // Chart Data for Recharts
    const chartData = useMemo(() => {
        return ASSET_TYPES.map(t => {
            const value = assets.filter(a => a.type === t.id).reduce((sum, a) => sum + a.amount, 0);
            return {
                name: t.label,
                value,
                color: t.color
            };
        }).filter(d => d.value > 0);
    }, [assets]);

    return (
        <Screen>
            <Header>
                <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text)' }}>
                    <MdArrowBack />
                </button>
                <h2 style={{ fontSize: '18px', margin: 0 }}>資産管理</h2>
                <button onClick={() => setIsModalOpen(true)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--primary)' }}>
                    <MdAdd />
                </button>
            </Header>

            <TotalAssetCard>
                <div style={{ fontSize: '14px', opacity: 0.8 }}>総資産</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', margin: '8px 0' }}>¥{totalAmount.toLocaleString()}</div>
            </TotalAssetCard>

            {totalAmount > 0 && (
                <div style={{ height: '200px', margin: '0 16px 24px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            )}

            <SectionTitle>資産一覧</SectionTitle>
            <AssetList>
                {assets.map(asset => {
                    const typeInfo = getTypeInfo(asset.type);
                    return (
                        <AssetCard key={asset.id}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <AssetIcon color={typeInfo.color}>{typeInfo.icon}</AssetIcon>
                                <div>
                                    <div style={{ fontWeight: '600' }}>{asset.title}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{typeInfo.label}</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                <div style={{ fontWeight: 'bold' }}>¥{asset.amount.toLocaleString()}</div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={() => openEdit(asset)} style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                        <MdEdit size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(asset.id)} style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                                        <MdDelete size={18} />
                                    </button>
                                </div>
                            </div>
                        </AssetCard>
                    );
                })}
            </AssetList>

            {isModalOpen && (
                <ModalOverlay onClick={closeModal}>
                    <ModalContent onClick={e => e.stopPropagation()}>
                        <h3 style={{ marginTop: 0, marginBottom: '20px' }}>{editingId ? '資産を編集' : '資産を追加'}</h3>

                        <FormGroup>
                            <Label>種類</Label>
                            <Select
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value as AssetType })}
                            >
                                {ASSET_TYPES.map(t => (
                                    <option key={t.id} value={t.id}>{t.label}</option>
                                ))}
                            </Select>
                        </FormGroup>

                        <FormGroup>
                            <Label>名称</Label>
                            <Input
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                placeholder={formData.type === 'bank' ? "〇〇銀行" : "〇〇銘柄"}
                            />
                        </FormGroup>

                        {(formData.type === 'securities' || formData.type === 'crypto') ? (
                            <>
                                <FormGroup>
                                    <Label>コード / ティッカー (任意)</Label>
                                    <Input
                                        value={formData.code}
                                        onChange={e => setFormData({ ...formData, code: e.target.value })}
                                        placeholder="例: AAPL, BTC"
                                    />
                                </FormGroup>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <FormGroup style={{ flex: 1 }}>
                                        <Label>保有数量</Label>
                                        <Input
                                            type="text"
                                            inputMode="decimal"
                                            value={formData.quantity}
                                            onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                                            placeholder="0.00"
                                        />
                                    </FormGroup>
                                    <FormGroup style={{ flex: 1 }}>
                                        <Label>現在単価</Label>
                                        <Input
                                            type="text"
                                            inputMode="decimal"
                                            value={formData.currentPrice}
                                            onChange={e => setFormData({ ...formData, currentPrice: e.target.value })}
                                            placeholder="0"
                                        />
                                    </FormGroup>
                                </div>
                                <div style={{ textAlign: 'right', fontSize: '14px', marginBottom: '16px', fontWeight: 'bold' }}>
                                    評価額: ¥{((parseFloat(formData.quantity) || 0) * (parseFloat(formData.currentPrice) || 0)).toLocaleString()}
                                </div>
                            </>
                        ) : (
                            <FormGroup>
                                <Label>残高 / 金額</Label>
                                <Input
                                    type="text"
                                    inputMode="decimal"
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    placeholder="0"
                                />
                            </FormGroup>
                        )}

                        <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                            <Button variant="secondary" onClick={closeModal}>キャンセル</Button>
                            <Button variant="primary" onClick={handleSubmit}>保存</Button>
                        </div>
                    </ModalContent>
                </ModalOverlay>
            )}
        </Screen>
    );
};
