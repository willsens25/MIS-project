import React from 'react';
import { DivisionCalendarTodoView } from '../common/DivisionCalendarTodoView';
import { TaskCompletionTrendsSummaryCard } from '../charts/TaskCompletionTrendsSummaryCard';

export const DirektoratCalendarTodoTab: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Visual Task Completion Trends Across All Divisions (Recharts Line Chart) */}
      <TaskCompletionTrendsSummaryCard />

      {/* Main 12-Month Calendar & To-Do List View */}
      <DivisionCalendarTodoView divisionId={1} />
    </div>
  );
};
