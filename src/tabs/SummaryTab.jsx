import React, { useMemo, useState } from 'react';
import SummaryFilters from '../components/SummaryFilters';
import SummaryTable from '../components/SummaryTable';
import { filterSummaryRows } from '../utils/summaryFilter';

function todayISO() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

export default function SummaryTab() {
    // 설비구분: 전체, 가공, 지중
    const equipmentOptions = ['전체', '가공', '지중'];

    // 샘플 데이터 (지사=PK)
    // trCount: 변압기수, avgUtil: 평균이용률, bXX: 해당 구간의 변압기 최대 이용률 분포 카운트
    const DATA = useMemo(
        () => [
            {
                branch: '부산지사',
                date: '2025-09-29',
                equipGroup: '가공',
                trCount: 150,
                avgUtil: 20.32,
                b50: 40, b60: 30, b70: 20, b80: 15, b90: 12, b100: 10, b110: 8, b120: 6, b130: 4, b140: 3, b150: 1, b150p: 1,
            },
            {
                branch: '울산지사',
                date: '2025-09-29',
                equipGroup: '지중',
                trCount: 120,
                avgUtil: 13.2,
                b50: 35, b60: 22, b70: 16, b80: 12, b90: 10, b100: 8, b110: 6, b120: 4, b130: 3, b140: 2, b150: 1, b150p: 1,
            },
        ],
        []
    );

    const defaultDate = todayISO();

    // 폼 입력(draft)과 적용(applied)을 분리 -> 조회 버튼 눌러야만 테이블 갱신
    const [draft, setDraft] = useState({ mode: 'day', date: defaultDate, equipment: '전체' });
    const [applied, setApplied] = useState({ mode: 'day', date: '', equipment: '전체' });

    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const rows = useMemo(() => filterSummaryRows(DATA, applied), [DATA, applied]);

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSubmitted(true);
        setApplied(draft); // 여기에서만 테이블 변경
        await new Promise((r) => setTimeout(r, 300));
        setLoading(false);
    };

    const onReset = () => {
        setDraft({ mode: 'day', date: defaultDate, equipment: '전체' });
    };

    const periodLabel = applied.date ? (applied.mode === 'month' ? `${applied.date.slice(0, 7)} (월간)` : `${applied.date} (일간)`) : '';

    return (
        <section className="w-full">
            <SummaryFilters state={draft} setState={setDraft} selects={{ equipmentOptions }} onSubmit={onSubmit} onReset={onReset} loading={loading} />
            <SummaryTable rows={rows} submitted={submitted} loading={loading} periodLabel={periodLabel} />
        </section>
    );
}