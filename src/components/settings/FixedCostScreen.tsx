import React, { useState } from 'react';

import { MdArrowBack, MdAdd, MdDelete, MdEdit, MdCalendarToday, MdAutorenew } from 'react-icons/md';
import { useFixedCostStore } from '../../store/useFixedCostStore';
import type { FixedCost, FixedCostFormData } from '../../types/fixedCost';
import type { ExpenseCategory } from '../../types/expense';
import styled from '@emotion/styled';

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

const ListContainer = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FixedCostCard = styled.div`
  background: var(--card);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  border: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: ${props =>
        props.variant === 'primary' ? 'var(--primary)' :
            props.variant === 'danger' ? '#ef4444' :
                'var(--border)'
    };
  color: ${props => props.variant === 'secondary' ? 'var(--text)' : 'white'};
  width: 100%;
`;

interface FixedCostScreenProps {
    onBack: () => void;
}

const CATEGORIES: { id: ExpenseCategory; label: string }[] = [
    { id: 'utilities', label: '光熱費' },
    { id: 'entertainment', label: 'サブスク・娯楽' },
    { id: 'other', label: 'その他' },
    { id: 'food', label: '食費' },
    { id: 'transport', label: '交通費' },
    { id: 'health', label: '医療・保険' },
];

export const FixedCostScreen: React.FC<FixedCostScreenProps> = ({ onBack }) => {

    const { fixedCosts, addFixedCost, updateFixedCost, deleteFixedCost } = useFixedCostStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState<FixedCostFormData>({
        title: '',
        amount: 0,
        category: 'utilities',
        paymentDate: 1,
        cycle: 'monthly',
        autoCreate: true
    });

    const handleSubmit = () => {
        if (!formData.title || formData.amount <= 0) {
            alert('タイトルと金額を入力してください');
            return;
        }

        if (editingId) {
            updateFixedCost(editingId, formData);
        } else {
            addFixedCost(formData);
        }
        closeModal();
    };

    const openEdit = (cost: FixedCost) => {
        setEditingId(cost.id);
        setFormData({
            title: cost.title,
            amount: cost.amount,
            category: cost.category,
            paymentDate: cost.paymentDate,
            cycle: cost.cycle,
            autoCreate: cost.autoCreate
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData({
            title: '',
            amount: 0,
            category: 'utilities',
            paymentDate: 1,
            cycle: 'monthly',
            autoCreate: true
        });
    };

    const handleDelete = (id: string) => {
        if (window.confirm('本当に削除しますか？')) {
            deleteFixedCost(id);
        }
    };

    return (
        <Screen>
            <Header>
                <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text)' }}>
                    <MdArrowBack />
                </button>
                <h2 style={{ fontSize: '18px', margin: 0 }}>固定費・サブスク管理</h2>
                <button onClick={() => setIsModalOpen(true)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--primary)' }}>
                    <MdAdd />
                </button>
            </Header>

            <ListContainer>
                {fixedCosts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                        <MdAutorenew size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                        <p>固定費やサブスクリプションを登録すると<br />毎月の支払日に自動で家計簿に記録されます。</p>
                    </div>
                ) : (
                    fixedCosts.map(cost => (
                        <FixedCostCard key={cost.id}>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                    <span style={{ fontWeight: 600, fontSize: '16px' }}>{cost.title}</span>
                                    <span style={{ fontSize: '12px', background: 'rgba(0,0,0,0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                                        {CATEGORIES.find(c => c.id === cost.category)?.label}
                                    </span>
                                </div>
                                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <MdCalendarToday size={14} /> 毎月{cost.paymentDate}日
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: cost.autoCreate ? '#22c55e' : '#9ca3af' }}>
                                        <MdAutorenew size={14} /> {cost.autoCreate ? '自動計上ON' : 'OFF'}
                                    </span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>¥{cost.amount.toLocaleString()}</span>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={() => openEdit(cost)} style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                        <MdEdit size={20} />
                                    </button>
                                    <button onClick={() => handleDelete(cost.id)} style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444' }}>
                                        <MdDelete size={20} />
                                    </button>
                                </div>
                            </div>
                        </FixedCostCard>
                    ))
                )}
            </ListContainer>

            {isModalOpen && (
                <ModalOverlay onClick={closeModal}>
                    <ModalContent onClick={e => e.stopPropagation()}>
                        <h3 style={{ marginTop: 0, marginBottom: '20px' }}>{editingId ? '固定費を編集' : '固定費を追加'}</h3>

                        <FormGroup>
                            <Label>タイトル</Label>
                            <Input
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                placeholder="例: Netflix, 家賃"
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label>金額</Label>
                            <Input
                                type="number"
                                value={formData.amount}
                                onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
                            />
                        </FormGroup>

                        <FormGroup>
                            <Label>カテゴリ</Label>
                            <Select
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
                            >
                                {CATEGORIES.map(c => (
                                    <option key={c.id} value={c.id}>{c.label}</option>
                                ))}
                            </Select>
                        </FormGroup>

                        <FormGroup>
                            <Label>支払日 (毎月)</Label>
                            <input
                                type="range"
                                min="1"
                                max="28" // 29日以降は面倒なので28日までにするか、月末扱いにするか。一旦シンプルに
                                value={formData.paymentDate}
                                onChange={e => setFormData({ ...formData, paymentDate: Number(e.target.value) })}
                                style={{ width: '100%' }}
                            />
                            <div style={{ textAlign: 'center', fontWeight: 'bold' }}>{formData.paymentDate}日</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textAlign: 'center' }}>※29日以降は月末支払いの場合は28日等を設定してください</div>
                        </FormGroup>

                        <FormGroup>
                            <Label>自動計上</Label>
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <input
                                        type="checkbox"
                                        checked={formData.autoCreate}
                                        onChange={e => setFormData({ ...formData, autoCreate: e.target.checked })}
                                        style={{ transform: 'scale(1.2)' }}
                                    />
                                    <span>支払日に自動で家計簿に入力する</span>
                                </label>
                            </div>
                        </FormGroup>

                        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                            <Button variant="secondary" onClick={closeModal}>キャンセル</Button>
                            <Button variant="primary" onClick={handleSubmit}>保存</Button>
                        </div>
                    </ModalContent>
                </ModalOverlay>
            )}
        </Screen>
    );
};
