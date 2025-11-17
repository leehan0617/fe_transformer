import React, { useMemo, useState } from 'react';
import axios from 'axios';
import SummaryFilters from '../components/summary/SummaryFilters';
import SummaryTable from '../components/summary/SummaryTable';
import { getSummarySampleRows } from '../mocks/summarySample';

// Dev server에서는 목 데이터 사용, 빌드/프리뷰(프로덕션)에서는 실제 서버 호출
const USE_SUMMARY_MOCK = import.meta.env.DEV === true;
const DIST_KEYS = ['b50', 'b60', 'b70', 'b80', 'b90', 'b100', 'b110', 'b120', 'b130', 'b140', 'b150', 'b150p'];

function todayISO() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

export default function SummaryTab() {
    // 설비구분 옵션 (value는 API에 전달)
    const equipmentOptions = [
        { label: '전체', value: 'all' },
        { label: '가공', value: 'upper' },
        { label: '지중', value: 'under' },
    ];

    const API_ENDPOINT = '/api/summary';

    const defaultDate = todayISO();

    // 폼 입력(draft)과 적용(applied)을 분리 -> 조회 버튼 눌러야만 테이블 갱신
    const [draft, setDraft] = useState({ mode: 'day', date: defaultDate, equipment: 'all' });
    const [applied, setApplied] = useState({ mode: 'day', date: defaultDate, equipment: 'all' });

    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState([]);

    function formatYmd(dateObj) {
        const y = dateObj.getFullYear();
        const m = String(dateObj.getMonth() + 1).padStart(2, '0');
        const d = String(dateObj.getDate()).padStart(2, '0');
        return `${y}${m}${d}`;
    }

    function lastDayOfMonth(dateObj) {
        const y = dateObj.getFullYear();
        const m = dateObj.getMonth();
        return new Date(y, m + 1, 0);
    }

    function computeParams({ mode, date, equipment }) {
        // date comes as 'YYYY-MM-DD' for day or 'YYYY-MM' for month input
        if (!date) return null;
        if (mode === 'month') {
            const ym = String(date).slice(0, 7); // YYYY-MM
            const start = new Date(ym + '-01T00:00:00');
            const end = lastDayOfMonth(start);
            const params = {
                start_date: `${String(start.getFullYear())}${String(start.getMonth() + 1).padStart(2, '0')}01`,
                end_date: formatYmd(end),
            };
            if (equipment && equipment !== 'all') params.line_type = equipment;
            return params;
        }
        // day mode
        const dstr = String(date).length === 7 ? String(date) + '-01' : String(date);
        const d = new Date(dstr + 'T00:00:00');
        const ymd = formatYmd(d);
        const params = { start_date: ymd, end_date: ymd };
        if (equipment && equipment !== 'all') params.line_type = equipment;
        return params;
    }

    async function fetchSummary(params) {
        if (!params && !USE_SUMMARY_MOCK) return;
        setLoading(true);
        try {
            const raw = USE_SUMMARY_MOCK ? await getSummarySampleRows({ params }) : (await axios.get(API_ENDPOINT, { params })).data;
            // Map API response to SummaryTable expected schema
            const apiRows = Array.isArray(raw) ? raw : [];
            const mapped = apiRows.map((r) => {
                const out = {
                    branch: r.department ?? '',
                    transformerCount: Number(r.transformer_count) || 0,
                    avgUtil: Number(r.transformer_avg) || 0,
                };
                const dist = Array.isArray(r.data) ? r.data : [];
                for (let i = 0; i < DIST_KEYS.length; i++) {
                    out[DIST_KEYS[i]] = Number(dist[i]) || 0;
                }
                return out;
            });
            setRows(mapped);
        } catch (err) {
            if (!USE_SUMMARY_MOCK) {
                console.error('Failed to fetch /api/summary', err);
            }
            setRows([]);
        } finally {
            setLoading(false);
        }
    }

    // 초기 로딩 시: 오늘 날짜, 조회구분=일, 설비구분=전체로 호출
    React.useEffect(() => {
        const params = computeParams({ mode: 'day', date: defaultDate, equipment: 'all' });
        setSubmitted(true);
        setApplied({ mode: 'day', date: defaultDate, equipment: 'all' });
        fetchSummary(params);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onSubmit = async (e) => {
        e.preventDefault();
        setSubmitted(true);
        setApplied(draft);
        const params = computeParams(draft);
        await fetchSummary(params);
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