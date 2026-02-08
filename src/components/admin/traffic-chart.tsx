
"use client";

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
import { subDays, format } from 'date-fns';
import { ar } from 'date-fns/locale';

const generateLast7DaysData = () => {
    const data = [];
    const today = new Date();
    const baseVisits = [1200, 1500, 1300, 1700, 1600, 1900, 2400];
    const baseUsers = [800, 950, 900, 1100, 1050, 1250, 1500];

    for (let i = 6; i >= 0; i--) {
        const date = subDays(today, i);
        const formattedDate = format(date, 'd MMM', { locale: ar });
        data.push({
            name: formattedDate,
            visits: baseVisits[6 - i] || 0,
            users: baseUsers[6 - i] || 0,
        });
    }
    return data;
};

const trafficData = generateLast7DaysData();


export function TrafficChart() {
    return (
        <ResponsiveContainer>
            <LineChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--foreground))" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
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
                <Line type="monotone" dataKey="visits" name="الزيارات" stroke="hsl(var(--primary))" strokeWidth={2} />
                <Line type="monotone" dataKey="users" name="المستخدمون" stroke="hsl(var(--accent))" strokeWidth={2} />
            </LineChart>
        </ResponsiveContainer>
    );
}
