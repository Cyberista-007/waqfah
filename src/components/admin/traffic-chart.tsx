
"use client";

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
import { subDays, subMonths, format } from 'date-fns';
import { ar } from 'date-fns/locale';

// A more dynamic data generation function
const generateData = (numPoints: number, unit: 'day' | 'month') => {
    const data = [];
    const today = new Date();
    for (let i = numPoints - 1; i >= 0; i--) {
        const date = unit === 'day' ? subDays(today, i) : subMonths(today, i);
        const name = unit === 'day' ? format(date, 'd MMM', { locale: ar }) : format(date, 'MMM yy', { locale: ar });
        
        // Let's create a growth trend
        const growthFactor = (numPoints - i) / numPoints;
        
        const baseVisits = unit === 'month' ? 40000 : 1500;
        const baseUsers = unit === 'month' ? 25000 : 1000;
        
        // Add some noise and trend
        const visits = Math.floor(baseVisits * growthFactor * (0.85 + Math.random() * 0.3));
        const users = Math.floor(baseUsers * growthFactor * (0.8 + Math.random() * 0.4));

        data.push({ name, visits, users });
    }
    return data;
};


interface TrafficChartProps {
    timeRange: '7d' | '30d' | '12m';
}

export function TrafficChart({ timeRange = '7d' }: TrafficChartProps) {
    const trafficData = useMemo(() => {
        switch (timeRange) {
            case '30d':
                return generateData(30, 'day');
            case '12m':
                return generateData(12, 'month');
            case '7d':
            default:
                return generateData(7, 'day');
        }
    }, [timeRange]);

    return (
        <ResponsiveContainer>
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
                        borderRadius: 'var(--radius)',
                        color: 'hsl(var(--card-foreground))'
                    }}
                />
                <Legend />
                <Line type="monotone" dataKey="visits" name="الزيارات" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="users" name="المستخدمون" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />
            </LineChart>
        </ResponsiveContainer>
    );
}
