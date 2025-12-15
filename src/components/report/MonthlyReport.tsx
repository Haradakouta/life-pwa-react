/**
 * 月次レポートコンポーネント
 */
import { useState, useEffect } from 'react';
import { MdAutoAwesome, MdTrendingUp, MdTrendingDown, MdArrowForward } from 'react-icons/md';
import { useIntakeStore, useExpenseStore } from '../../store';
import { generateMonthlyComparison, generateAIPrompt } from '../../utils/reportGenerator';
import type { MonthlyComparison } from '../../utils/reportGenerator';
import { generateText } from '../../api/gemini';
import { ProGate } from '../subscription/ProGate';

export function MonthlyReport() {
  const { intakes } = useIntakeStore();
  const { expenses } = useExpenseStore();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [comparison, setComparison] = useState<MonthlyComparison | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<string>('');
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    const comp = generateMonthlyComparison(year, month, intakes, expenses);
    setComparison(comp);
  }, [year, month, intakes, expenses]);

  const handleGenerateAISuggestions = async () => {
    if (!comparison) return;

    setLoadingAI(true);
    try {
      const prompt = generateAIPrompt(comparison);
      const result = await generateText(prompt);
      setAiSuggestions(result);
    } catch (error) {
      console.error('AI提案生成エラー:', error);
      alert('AI提案の生成に失敗しました');
    } finally {
      setLoadingAI(false);
    }
  };

  const handlePreviousMonth = () => {
    if (month === 1) {
      setYear(year - 1);
      setMonth(12);
    } else {
      setMonth(month - 1);
    }
    setAiSuggestions(''); // AIの提案をクリア
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setYear(year + 1);
      setMonth(1);
    } else {
      setMonth(month + 1);
    }
    setAiSuggestions(''); // AIの提案をクリア
  };

  const renderChange = (value: number) => {
    if (value === 0) return <span className="change-neutral">±0%</span>;
    const icon = value > 0 ? <MdTrendingUp /> : <MdTrendingDown />;
    const className = value > 0 ? 'change-up' : 'change-down';
    return (
      <span className={`change ${className}`}>
        {icon} {value > 0 ? '+' : ''}
        {value.toFixed(1)}%
      </span>
    );
  };

  if (!comparison) {
    return <div className="card">データを読み込み中...</div>;
  }

  const { current, previous, changes } = comparison;

  return (
    <div className="monthly-report">
      <div className="card">
        <div className="report-header">
          <h3>📊 月次レポート</h3>
          <div className="month-selector">
            <button className="month-nav-btn" onClick={handlePreviousMonth}>
              ◀
            </button>
            <span className="current-month">
              {year}年{month}月
            </span>
            <button className="month-nav-btn" onClick={handleNextMonth}>
              ▶
            </button>
          </div>
        </div>

        {/* 今月のサマリー */}
        <div className="report-section">
          <h4>今月の記録</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-label">食事記録</div>
              <div className="stat-value">{current.intakes.count}回</div>
              {renderChange(changes.intakesCount)}
            </div>
            <div className="stat-item">
              <div className="stat-label">平均カロリー</div>
              <div className="stat-value">
                {Math.round(current.intakes.avgCalories)}kcal
              </div>
              {renderChange(changes.avgCalories)}
            </div>
            <div className="stat-item">
              <div className="stat-label">総カロリー</div>
              <div className="stat-value">
                {current.intakes.totalCalories.toLocaleString()}kcal
              </div>
              {renderChange(changes.totalCalories)}
            </div>
            <div className="stat-item">
              <div className="stat-label">総支出</div>
              <div className="stat-value">
                ¥{current.expenses.total.toLocaleString()}
              </div>
              {renderChange(changes.totalExpenses)}
            </div>
          </div>
        </div>

        {/* 先月との比較 */}
        <div className="report-section">
          <h4>
            先月（{previous.year}年{previous.month}月）との比較
          </h4>
          <div className="comparison-grid">
            <div className="comparison-item">
              <div className="comparison-label">食事記録</div>
              <div className="comparison-values">
                <span className="prev-value">{previous.intakes.count}回</span>
                <MdArrowForward />
                <span className="curr-value">{current.intakes.count}回</span>
              </div>
            </div>
            <div className="comparison-item">
              <div className="comparison-label">平均カロリー</div>
              <div className="comparison-values">
                <span className="prev-value">
                  {Math.round(previous.intakes.avgCalories)}kcal
                </span>
                <MdArrowForward />
                <span className="curr-value">
                  {Math.round(current.intakes.avgCalories)}kcal
                </span>
              </div>
            </div>
            <div className="comparison-item">
              <div className="comparison-label">総支出</div>
              <div className="comparison-values">
                <span className="prev-value">
                  ¥{previous.expenses.total.toLocaleString()}
                </span>
                <MdArrowForward />
                <span className="curr-value">
                  ¥{current.expenses.total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* AI改善提案 */}
        <div className="report-section">
          <h4>
            <MdAutoAwesome size={20} style={{ marginRight: '8px' }} />
            AI改善提案
          </h4>

          {!aiSuggestions ? (
            <ProGate
              featureName="AI改善提案"
              description="月次データに基づいたAIアドバイス機能はプレミアムプラン限定です。"
              lockType="replace"
            >
              <button
                className="submit"
                onClick={handleGenerateAISuggestions}
                disabled={loadingAI || current.intakes.count === 0}
                style={{ width: '100%' }}
              >
                {loadingAI ? '提案を生成中...' : 'AI改善提案を生成'}
              </button>
            </ProGate>
          ) : (
            <div className="ai-suggestions">
              <div className="suggestions-content">{aiSuggestions}</div>
              <button
                className="submit"
                onClick={handleGenerateAISuggestions}
                disabled={loadingAI}
                style={{ marginTop: '12px' }}
              >
                再生成
              </button>
            </div>
          )}

          {current.intakes.count === 0 && (
            <p className="no-data-message">
              データがありません。食事記録を追加してください。
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
