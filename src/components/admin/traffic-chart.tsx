
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

const trafficData = [
  { name: 'قبل 6 أيام', visits: 1200, users: 800 },
  { name: 'قبل 5 أيام', visits: 1500, users: 950 },
  { name: 'قبل 4 أيام', visits: 1300, users: 900 },
  { name: 'قبل 3 أيام', visits: 1700, users: 1100 },
  { name: 'قبل 2 يوم', visits: 1600, users: 1050 },
  { name: 'الأمس', visits: 1900, users: 1250 },
  { name: 'اليوم', visits: 2400, users: 1500 },
];

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
