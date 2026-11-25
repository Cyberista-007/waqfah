'use client';

import { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
} from 'recharts';
import { subDays, subMonths, format, differenceInDays, addDays } from 'date-fns';
import { ar } from 'date-fns/locale';
import { type DateRange } from 'react-day-picker';

function deterministicFactor(index: number): number {
  const wave = Math.sin((index + 1) * 1.7) * 0.14;
  return 0.92 + wave;
}

const generatePresetData = (numPoints: number, unit: 'day' | 'month') => {
  const data = [];
  const today = new Date();
  for (let i = numPoints - 1; i >= 0; i--) {
    const date = unit === 'day' ? subDays(today, i) : subMonths(today, i);
    const name =
      unit === 'day'
        ? format(date, 'd MMM', { locale: ar })
        : format(date, 'MMM yy', { locale: ar });

    const growthFactor = (numPoints - i) / numPoints;
    const baseVisits = unit === 'month' ? 40000 : 1500;
    const baseUsers = unit === 'month' ? 25000 : 1000;
    const factor = deterministicFactor(i);

    const visits = Math.floor(baseVisits * growthFactor * factor);
    const users = Math.floor(baseUsers * growthFactor * factor);

    data.push({ name, visits, users });
  }
  return data;
};

const generateCustomData = (range: DateRange) => {
  if (!range.from || !range.to) return [];

  const data = [];
  const days = differenceInDays(range.to, range.from);
  if (days < 0) return [];

  for (let i = 0; i <= days; i++) {
    const date = addDays(range.from, i);
    const name = format(date, 'd MMM', { locale: ar });

    const growthFactor = (i + 1) / (days + 1);
    const factor = deterministicFactor(i);
    const visits = Math.floor(1500 * growthFactor * factor);
    const users = Math.floor(1000 * growthFactor * factor);

    data.push({ name, visits, users });
  }
  return data;
};

interface TrafficChartProps {
  timeRange?: '7d' | '30d' | '12m' | 'custom';
  customDateRange?: DateRange;
}

export function TrafficChart({ timeRange = '7d', customDateRange }: TrafficChartProps) {
  const trafficData = useMemo(() => {
    if (timeRange === 'custom' && customDateRange) {
      return generateCustomData(customDateRange);
    }

    switch (timeRange) {
      case '30d':
        return generatePresetData(30, 'day');
      case '12m':
        return generatePresetData(12, 'month');
      case '7d':
      default:
        return generatePresetData(7, 'day');
    }
  }, [timeRange, customDateRange]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={trafficData}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="name"
          stroke="hsl(var(--foreground))"
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
        />
        <YAxis stroke="hsl(var(--foreground))" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            borderColor: 'hsl(var(--border))',
            borderRadius: '12px',
            color: 'hsl(var(--card-foreground))',
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="visits"
          name="الزيارات"
          stroke="hsl(var(--primary))"
          strokeWidth={2.5}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="users"
          name="المستخدمون"
          stroke="hsl(var(--chart-2, 163 65% 52%))"
          strokeWidth={2.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
