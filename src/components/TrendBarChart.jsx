import React from 'react';
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip
} from 'recharts';

/**
 * TrendBarChart
 * - 모달 가로폭을 꽉 채움(ResponsiveContainer)
 * - X축 레이블 자동 간격(minTickGap) + -30° 회전으로 겹침 방지
 * - 여백 최소화(margin.bottom = 28) → 차트/텍스트 사이 불필요한 공백 줄임
 */
export default function TrendBarChart({ labels = [], values = [], height = 220 }) {
    const data = labels.map((label, i) => ({ label, value: Number(values[i]) || 0 }));

    return (
        <div style={{ width: '100%', height }}>
            <ResponsiveContainer>
                <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 28 }}>
                    <CartesianGrid vertical={false} stroke="#eee" />
                    <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11, angle: -30 }}
                        height={30}
                        tickLine={false}
                        axisLine={{ stroke: '#e5e7eb' }}
                        interval="preserveStartEnd"
                        minTickGap={8}
                    />
                    <YAxis
                        tick={{ fontSize: 11 }}
                        width={36}
                        axisLine={{ stroke: '#e5e7eb' }}
                        tickLine={false}
                        allowDecimals={false}
                    />
                    <Tooltip
                        formatter={(v) => [v, '값']}
                        labelStyle={{ fontSize: 12 }}
                        contentStyle={{ fontSize: 12, borderRadius: 8 }}
                    />
                    {/* 색상 지정 안 하면 기본 색상 사용 */}
                    <Bar dataKey="value" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
