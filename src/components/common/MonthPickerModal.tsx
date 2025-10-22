/**
 * 月選択モーダルコンポーネント
 */
import React from 'react';
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
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '400px',
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
          <h3 style={{ margin: 0 }}>月を選択</h3>
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
          年月をタップして選択してください
        </div>
      </div>
    </div>
  );
};
