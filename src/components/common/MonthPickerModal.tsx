/**
 * 月選択モーダルコンポーネント
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar } from './Calendar';
import { MdClose } from 'react-icons/md';

interface MonthPickerModalProps {
  isOpen: boolean;
  selectedYear: number;
  selectedMonth: number;
  onClose: () => void;
  onConfirm: (year: number, month: number) => void;
}

export const MonthPickerModal: React.FC<MonthPickerModalProps> = ({
  isOpen,
  selectedYear,
  selectedMonth,
  onClose,
  onConfirm,
}) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  const handleMonthChange = (year: number, month: number) => {
    onConfirm(year, month);
    onClose();
  };

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.5)',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '400px',
          width: '100%',
          animation: 'slideUp 0.3s ease',
        }}
      >
        {/* ヘッダー */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            paddingBottom: '15px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <h3 style={{ margin: 0 }}>{t('common.selectMonth')}</h3>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              padding: '5px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* カレンダー */}
        <Calendar
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          onMonthChange={handleMonthChange}
          mode="month"
        />

        <div
          style={{
            marginTop: '15px',
            fontSize: '12px',
            color: 'var(--text-secondary)',
            textAlign: 'center',
          }}
        >
          {t('common.selectMonthYear')}
        </div>
      </div>
    </div>
  );
};
