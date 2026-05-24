import { format, addDays, startOfWeek, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export const formatDate = (date: string | Date, formatStr: string = 'yyyy-MM-dd'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr, { locale: zhCN });
};

export const getWeekStart = (date: Date): Date => {
  return startOfWeek(date, { weekStartsOn: 1 });
};

export const getDaysOfWeek = (startDate: Date): Date[] => {
  return Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const getDayName = (day: number): string => {
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return days[day];
};

export const getDayShortName = (day: number): string => {
  const days = ['日', '一', '二', '三', '四', '五', '六'];
  return days[day];
};
