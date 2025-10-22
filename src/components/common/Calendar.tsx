/**
 * カレンダーコンポーネント
 */
import React, { useState } from 'react';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';

interface CalendarProps {
  selectedYear: number;
  selectedMonth: number;
  selectedDate?: Date;
  onSelectDate?: (date: Date) => void;
  onMonthChange?: (year: number, month: number) => void;
  mode?: 'date' | 'month'; // 日付選択モードか月選択モードか
}

export const Calendar: React.FC<CalendarProps> = ({
  selectedYear,
  selectedMonth,
  selectedDate,
  onSelectDate,
  onMonthChange,
  mode = 'month',
}) => {
  const [currentYear, setCurrentYear] = useState(selectedYear);
  const [currentMonth, setCurrentMonth] = useState(selectedMonth);

  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay();

  const handlePrevMonth = () => {
    let newMonth = currentMonth - 1;
    let newYear = currentYear;
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    if (onMonthChange) {
      onMonthChange(newYear, newMonth);
    }
  };

  const handleNextMonth = () => {
    let newMonth = currentMonth + 1;
    let newYear = currentYear;
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    if (onMonthChange) {
      onMonthChange(newYear, newMonth);
    }
  };

  const handleDateClick = (day: number) => {
    if (mode === 'date' && onSelectDate) {
      const date = new Date(currentYear, currentMonth - 1, day);
      onSelectDate(date);
    }
  };

  const handleMonthSelect = () => {
    if (mode === 'month' && onMonthChange) {
      onMonthChange(currentYear, currentMonth);
    }
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getFullYear() === currentYear &&
      today.getMonth() + 1 === currentMonth &&
      today.getDate() === day
    );
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getFullYear() === currentYear &&
      selectedDate.getMonth() + 1 === currentMonth &&
      selectedDate.getDate() === day
    );
  };

  // カレンダーの日付配列を生成
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

  return (
    <div
      style={{
        background: 'var(--card)',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* ヘッダー */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}
      >
        <button
          onClick={handlePrevMonth}
          style={{
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <MdChevronLeft size={24} />
        </button>
        <div
          onClick={handleMonthSelect}
          style={{
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: mode === 'month' ? 'pointer' : 'default',
            padding: mode === 'month' ? '8px 16px' : '0',
            borderRadius: '8px',
            transition: 'background 0.2s',
            background:
              mode === 'month' &&
              currentYear === selectedYear &&
              currentMonth === selectedMonth
                ? 'var(--primary)'
                : 'transparent',
            color:
              mode === 'month' &&
              currentYear === selectedYear &&
              currentMonth === selectedMonth
                ? 'white'
                : 'var(--text)',
          }}
        >
          {currentYear}年 {currentMonth}月
        </div>
        <button
          onClick={handleNextMonth}
          style={{
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <MdChevronRight size={24} />
        </button>
      </div>

      {/* 曜日ヘッダー */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '8px',
          marginBottom: '10px',
        }}
      >
        {weekDays.map((day, index) => (
          <div
            key={index}
            style={{
              textAlign: 'center',
              fontSize: '12px',
              fontWeight: 'bold',
              color:
                index === 0
                  ? '#ef4444'
                  : index === 6
                  ? '#3b82f6'
                  : 'var(--text-secondary)',
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* カレンダーグリッド */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '8px',
        }}
      >
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} />;
          }

          const today = isToday(day);
          const selected = isSelected(day);
          const dayOfWeek = index % 7;

          return (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              disabled={mode === 'month'}
              style={{
                aspectRatio: '1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: today ? '2px solid var(--primary)' : 'none',
                borderRadius: '8px',
                background: selected
                  ? 'var(--primary)'
                  : today
                  ? 'var(--background)'
                  : 'transparent',
                color: selected
                  ? 'white'
                  : dayOfWeek === 0
                  ? '#ef4444'
                  : dayOfWeek === 6
                  ? '#3b82f6'
                  : 'var(--text)',
                fontSize: '14px',
                fontWeight: selected || today ? 'bold' : 'normal',
                cursor: mode === 'date' ? 'pointer' : 'default',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (mode === 'date' && !selected) {
                  e.currentTarget.style.background = 'var(--background)';
                }
              }}
              onMouseLeave={(e) => {
                if (mode === 'date' && !selected) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              {day}
            </button>
          );
        })}
      </div>

      {mode === 'date' && (
        <div
          style={{
            marginTop: '15px',
            fontSize: '12px',
            color: 'var(--text-secondary)',
            textAlign: 'center',
          }}
        >
          {selectedDate
            ? `選択: ${selectedDate.getFullYear()}/${selectedDate.getMonth() + 1}/${selectedDate.getDate()}`
            : '日付を選択してください'}
        </div>
      )}
    </div>
  );
};
