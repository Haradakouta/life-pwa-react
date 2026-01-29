import React, { useState, useMemo } from 'react';
import { MdChevronLeft, MdChevronRight, MdClose } from 'react-icons/md';
import { useExpenseStore } from '../../store/useExpenseStore';

import styled from '@emotion/styled';

const CalendarContainer = styled.div`
  background: var(--card);
  border-radius: 16px;
  padding: 16px;
  margin: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--border);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const MonthTitle = styled.h3`
  font-size: 18px;
  font-weight: bold;
  margin: 0;
  color: var(--text);
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: var(--text);
  font-size: 24px;
  padding: 8px;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;

  &:hover {
    background: var(--border);
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
`;

const WeekDay = styled.div`
  text-align: center;
  font-size: 12px;
  color: var(--text-secondary);
  padding: 8px 0;
  font-weight: 600;
`;

const DayCell = styled.div<{ isToday?: boolean; isSelected?: boolean; hasExpense?: boolean; intensity?: number }>`
  aspect-ratio: 1;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding-top: 4px;
  cursor: pointer;
  position: relative;
  background: ${props => props.isSelected ? 'var(--primary)' : props.isToday ? 'rgba(59, 130, 246, 0.1)' : 'transparent'};
  color: ${props => props.isSelected ? '#fff' : 'var(--text)'};
  border: ${props => props.isToday && !props.isSelected ? '1px solid var(--primary)' : '1px solid transparent'};
  transition: all 0.2s;

  &:hover {
    background: ${props => props.isSelected ? 'var(--primary)' : 'rgba(0,0,0,0.05)'};
  }

  ${props => props.hasExpense && !props.isSelected && `
    &::after {
      content: '';
      position: absolute;
      bottom: 4px;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: ${props.intensity && props.intensity > 0.7 ? '#ef4444' : props.intensity && props.intensity > 0.3 ? '#f59e0b' : '#3b82f6'};
    }
  `}
`;

const DayNumber = styled.span<{ isOutsideMonth?: boolean }>`
  font-size: 14px;
  font-weight: 500;
  opacity: ${props => props.isOutsideMonth ? 0.3 : 1};
`;

const AmountLabel = styled.span`
  font-size: 9px;
  margin-top: 2px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 90%;
  text-align: center;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background: var(--card);
  width: 90%;
  max-width: 320px;
  max-height: 80vh;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
`;

const ExpenseList = styled.div`
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ExpenseItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
`;

export const CalendarView: React.FC = () => {

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const { getExpensesByMonth } = useExpenseStore();

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    const expenses = useMemo(() => getExpensesByMonth(year, month), [year, month, getExpensesByMonth]);

    // Daily totals map
    const dailyTotals = useMemo(() => {
        const totals: Record<number, number> = {};
        let maxTotal = 0;
        expenses.forEach(exp => {
            const day = new Date(exp.date).getDate();
            if (exp.type === 'expense') {
                totals[day] = (totals[day] || 0) + exp.amount;
                if (totals[day] > maxTotal) maxTotal = totals[day];
            }
        });
        return { totals, maxTotal };
    }, [expenses]);

    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDayOfMonth = new Date(year, month - 1, 1).getDay();

    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 2, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month, 1));
    };

    const handleDayClick = (day: number) => {
        const date = new Date(year, month - 1, day);
        setSelectedDate(date);
    };

    const renderCalendarDays = () => {
        const days = [];
        // Empty cells for previous month
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<DayCell key={`empty-${i}`} />);
        }

        const today = new Date();

        for (let d = 1; d <= daysInMonth; d++) {
            const isToday = today.getDate() === d && today.getMonth() === month - 1 && today.getFullYear() === year;
            const amount = dailyTotals.totals[d] || 0;
            const intensity = dailyTotals.maxTotal > 0 ? amount / dailyTotals.maxTotal : 0;

            days.push(
                <DayCell
                    key={d}
                    isToday={isToday}
                    hasExpense={amount > 0}
                    intensity={intensity}
                    onClick={() => handleDayClick(d)}
                >
                    <DayNumber>{d}</DayNumber>
                    {amount > 0 && <AmountLabel>¥{amount.toLocaleString()}</AmountLabel>}
                </DayCell>
            );
        }
        return days;
    };

    const selectedDayExpenses = useMemo(() => {
        if (!selectedDate) return [];
        return expenses.filter(e => {
            const d = new Date(e.date);
            return d.getDate() === selectedDate.getDate() &&
                d.getMonth() === selectedDate.getMonth() &&
                d.getFullYear() === selectedDate.getFullYear();
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [selectedDate, expenses]);

    return (
        <>
            <CalendarContainer>
                <Header>
                    <IconButton onClick={handlePrevMonth}><MdChevronLeft /></IconButton>
                    <MonthTitle>{year}年 {month}月</MonthTitle>
                    <IconButton onClick={handleNextMonth}><MdChevronRight /></IconButton>
                </Header>
                <Grid>
                    {['日', '月', '火', '水', '木', '金', '土'].map(day => (
                        <WeekDay key={day}>{day}</WeekDay>
                    ))}
                    {renderCalendarDays()}
                </Grid>
            </CalendarContainer>

            {selectedDate && (
                <ModalOverlay onClick={() => setSelectedDate(null)}>
                    <ModalContent onClick={e => e.stopPropagation()}>
                        <ModalHeader>
                            <h3 style={{ margin: 0 }}>
                                {selectedDate.getMonth() + 1}月{selectedDate.getDate()}日
                            </h3>
                            <IconButton onClick={() => setSelectedDate(null)}>
                                <MdClose />
                            </IconButton>
                        </ModalHeader>
                        <ExpenseList>
                            {selectedDayExpenses.length > 0 ? (
                                selectedDayExpenses.map(expense => (
                                    <ExpenseItem key={expense.id}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{expense.memo || expense.category}</span>
                                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                                {new Date(expense.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <span style={{
                                            fontWeight: 'bold',
                                            color: expense.type === 'income' ? '#22c55e' : '#ef4444'
                                        }}>
                                            {expense.type === 'income' ? '+' : '-'}¥{expense.amount.toLocaleString()}
                                        </span>
                                    </ExpenseItem>
                                ))
                            ) : (
                                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                                    データがありません
                                </div>
                            )}
                        </ExpenseList>
                    </ModalContent>
                </ModalOverlay>
            )}
        </>
    );
};
