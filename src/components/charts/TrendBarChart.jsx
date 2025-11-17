import React from 'react';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from 'recharts';

export default function TrendBarChart({ data = [], height = 220 }) {
    return (
        <div style={{ width: '100%', height }}>
            <ResponsiveContainer>
                <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 28 }}>
                    <CartesianGrid vertical={false} stroke="#eee" />
                    <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11, angle: -30 }}
                        height={34}
                        tickLine={false}
                        axisLine={{ stroke: '#e5e7eb' }}
                        interval="preserveStartEnd"
                        minTickGap={8}
                    />
                    <YAxis
                        tick={{ fontSize: 11 }}
                        width={40}
                        axisLine={{ stroke: '#e5e7eb' }}
                        tickLine={false}
                        allowDecimals={false}
                    />
                    <Tooltip
                        formatter={(value, name, props) => [`${value}`, name]}
                        labelFormatter={(label, payload) => {
                            const total = payload?.[0]?.payload?.usageRate;
                            return total != null ? `${label} · 합계 ${total}` : label;
                        }}
                        labelStyle={{ fontSize: 12 }}
                        contentStyle={{ fontSize: 12, borderRadius: 8 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Bar dataKey="usageA" stackId="usage" fill="#38bdf8" name="A상" />
                    <Bar dataKey="usageB" stackId="usage" fill="#60a5fa" name="B상" />
                    <Bar dataKey="usageC" stackId="usage" fill="#2563eb" name="C상" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}