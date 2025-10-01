import React from 'react';

/**
 * SimpleBarChart
 * - 레이블이 많을 때 자동으로 일부만 표시(step) + -35° 회전으로 겹침 방지
 * - 하단 레이블 영역을 확대하여 모달 내에서 글자가 차트와 겹치지 않도록 함
 */
export default function SimpleBarChart({
                                           data = [],
                                           labels = [],
                                           height = 220,
                                           rotateLabels = true,
                                       }) {
    const numeric = data.map((n) => Number(n) || 0);
    const max = Math.max(1, ...numeric);
    const n = Math.max(1, numeric.length);
    const gap = 1; // viewBox 단위 간격
    const barW = (100 - gap * (n + 1)) / n;

    // 레이블 표시 간격(step) 계산: 바 너비가 좁을수록 일부 레이블만 표시
    const rotate = rotateLabels;
    const minLabelUnits = rotate ? 8 : 12; // 레이블 하나에 필요한 최소 가로 공간(대략적)
    const step = Math.max(1, Math.ceil(minLabelUnits / (barW + gap)));

    // 레이블 영역 높이 (회전 시 더 큰 여백)
    const labelArea = rotate ? 28 : 16;
    const baselineY = height - labelArea;
    const labelY = height - 4;

    return (
        <svg viewBox={`0 0 100 ${height}`} className="w-full" role="img" aria-label="막대 차트">
            {/* baseline */}
            <line x1="0" y1={baselineY} x2="100" y2={baselineY} stroke="#e5e7eb" strokeWidth="1" />

            {numeric.map((val, i) => {
                const h = (val / max) * (height - (labelArea + 12)); // 상단 12, 하단 labelArea
                const x = gap + i * (barW + gap);
                const y = baselineY - h;

                const showLabel = i % step === 0;
                const label = String(labels[i] ?? '');
                const cx = x + barW / 2;

                return (
                    <g key={i}>
                        <rect x={x} y={y} width={barW} height={h} fill="#0ea5e9" rx="1.5" />
                        {/* x축 레이블 */}
                        {showLabel && label && (
                            rotate ? (
                                <text
                                    x={cx}
                                    y={labelY}
                                    fontSize="8"
                                    fill="#6b7280"
                                    textAnchor="end"
                                    transform={`rotate(-35 ${cx} ${labelY})`}
                                >
                                    {label}
                                </text>
                            ) : (
                                <text
                                    x={cx}
                                    y={labelY}
                                    fontSize="8"
                                    fill="#6b7280"
                                    textAnchor="middle"
                                >
                                    {label}
                                </text>
                            )
                        )}
                    </g>
                );
            })}
        </svg>
    );
}
