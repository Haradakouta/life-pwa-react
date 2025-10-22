/**
 * 日付選択モーダルコンポーネント
 */
import React from 'react';
import { Calendar } from './Calendar';
import { MdClose, MdCheck } from 'react-icons/md';

interface DatePickerModalProps {
  isOpen: boolean;
  selectedDate: Date;
  onClose: () => void;
  onConfirm: (date: Date) => void;
}

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
  isOpen,
  selectedDate,
  onClose,
  onConfirm,
}) => {
  const [tempDate, setTempDate] = React.useState(selectedDate);

  React.useEffect(() => {
    setTempDate(selectedDate);
  }, [selectedDate, isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(tempDate);
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
          <h3 style={{ margin: 0 }}>日付を選択</h3>
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
          selectedYear={tempDate.getFullYear()}
          selectedMonth={tempDate.getMonth() + 1}
          selectedDate={tempDate}
          onSelectDate={setTempDate}
          mode="date"
        />

        {/* ボタン */}
        <div
          style={{
            display: 'flex',
            gap: '10px',
            marginTop: '20px',
          }}
        >
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '12px',
              background: 'var(--background)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            キャンセル
          </button>
          <button
            onClick={handleConfirm}
            className="submit"
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
            }}
          >
            <MdCheck size={20} />
            決定
          </button>
        </div>
      </div>
    </div>
  );
};
