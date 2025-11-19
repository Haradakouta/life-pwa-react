/**
 * 食事入力フォームコンポーネント
 */
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useIntakeStore, useMealTemplateStore } from '../../store';
import { CalorieScanner } from './CalorieScanner';
import { MdAdd, MdDelete, MdRestaurant } from 'react-icons/md';

export const MealForm: React.FC = () => {
  const { t } = useTranslation();
  const { addIntake } = useIntakeStore();
  const { 
    templates, 
    addTemplate, 
    deleteTemplate, 
    subscribeToFirestore, 
    unsubscribeFromFirestore,
    initialized,
    syncWithFirestore
  } = useMealTemplateStore();
  
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [price, setPrice] = useState('');
  const [showCalorieScanner, setShowCalorieScanner] = useState(false);
  const [activeTab, setActiveTab] = useState<'manual' | 'template'>('manual');

  // テンプレートの初期化と監視
  useEffect(() => {
    if (!initialized) {
      syncWithFirestore();
    }
    subscribeToFirestore();
    return () => {
      unsubscribeFromFirestore();
    };
  }, [initialized]);

  // 料理名が入力されたら、カロリー計測画面を表示（手動タブのみ）
  useEffect(() => {
    if (activeTab === 'manual' && name.trim() && !showCalorieScanner && !calories) {
      // 少し遅延させて、ユーザーが入力し終わってから表示
      const timer = setTimeout(() => {
        // カロリーが未入力の場合のみスキャナーを表示
        if (!calories) {
          setShowCalorieScanner(true);
        }
      }, 1500); // 1.5秒に延長
      return () => clearTimeout(timer);
    }
  }, [name, showCalorieScanner, calories, activeTab]);

  const handleCalorieScanned = async (scannedCalories: number, reasoning: string) => {
    setCalories(scannedCalories.toString());
    setShowCalorieScanner(false);
    // 自動保存はせず、フォームに入力するだけにする
  };

  const handleCancelScanner = () => {
    setShowCalorieScanner(false);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      alert(t('meals.form.dishNameRequired'));
      return;
    }

    try {
      await addIntake({
        name: name.trim(),
        calories: Number(calories) || 0,
        price: Number(price) || 0,
        source: 'manual',
      });

      // フォームをリセット
      setName('');
      setCalories('');
      setPrice('');
      alert(t('meals.form.recorded'));
    } catch (error) {
      console.error('食事記録エラー:', error);
      alert(t('meals.form.recordFailed'));
    }
  };

  const handleAddToTemplate = async () => {
    if (!name.trim()) return;
    
    try {
      await addTemplate({
        name: name.trim(),
        calories: Number(calories) || 0,
        price: Number(price) || 0,
      });
      alert(t('meals.form.template.addSuccess'));
    } catch (error) {
      console.error('テンプレート登録エラー:', error);
    }
  };

  const handleUseTemplate = async (template: { name: string; calories: number; price: number }) => {
    try {
      await addIntake({
        name: template.name,
        calories: template.calories,
        price: template.price,
        source: 'manual',
      });
      alert(t('meals.form.recorded'));
    } catch (error) {
      console.error('食事記録エラー:', error);
      alert(t('meals.form.recordFailed'));
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (confirm(t('meals.form.template.deleteConfirm'))) {
      await deleteTemplate(id);
    }
  };

  return (
    <>
      <div className="card">
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '16px' }}>
          <button
            onClick={() => setActiveTab('manual')}
            style={{
              flex: 1,
              padding: '12px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'manual' ? '2px solid var(--primary)' : 'none',
              color: activeTab === 'manual' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'manual' ? 'bold' : 'normal',
              cursor: 'pointer',
            }}
          >
            {t('meals.form.template.manualTab')}
          </button>
          <button
            onClick={() => setActiveTab('template')}
            style={{
              flex: 1,
              padding: '12px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'template' ? '2px solid var(--primary)' : 'none',
              color: activeTab === 'template' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'template' ? 'bold' : 'normal',
              cursor: 'pointer',
            }}
          >
            {t('meals.form.template.tab')}
          </button>
        </div>

        {activeTab === 'manual' ? (
          <>
            <label>{t('meals.form.dishName')}</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('meals.form.dishNamePlaceholder')}
            />
            
            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <div style={{ flex: 1 }}>
                <label>{t('meals.form.template.calories')} (kcal)</label>
                <input
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  placeholder="0"
                />
              </div>
              <div style={{ flex: 1 }}>
                <label>{t('meals.form.template.price')} (円)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button 
                className="submit" 
                onClick={handleSubmit}
                style={{ flex: 2 }}
              >
                {t('meals.form.submit')}
              </button>
              <button
                onClick={handleAddToTemplate}
                style={{
                  flex: 1,
                  background: 'var(--background)',
                  border: '1px solid var(--primary)',
                  color: 'var(--primary)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}
              >
                <MdAdd /> {t('meals.form.template.add')}
              </button>
            </div>
          </>
        ) : (
          <div>
            {templates.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '20px' }}>
                {t('meals.form.template.empty')}
              </p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {templates.map((template) => (
                  <li
                    key={template.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 'bold' }}>{template.name}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {template.calories} kcal / ¥{template.price}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleUseTemplate(template)}
                        style={{
                          background: 'var(--primary)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '6px 12px',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                        }}
                      >
                        {t('meals.form.template.use')}
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        style={{
                          background: 'transparent',
                          color: '#ef4444',
                          border: '1px solid #ef4444',
                          borderRadius: '4px',
                          padding: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        <MdDelete />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {showCalorieScanner && (
        <CalorieScanner
          mealName={name}
          onCalorieScanned={handleCalorieScanned}
          onCancel={handleCancelScanner}
        />
      )}
    </>
  );
};

