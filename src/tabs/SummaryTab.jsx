import React, { useState } from 'react';
import apiClient from '../api/client';
import SummaryFilters from '../components/summary/SummaryFilters';
import SummaryTable from '../components/summary/SummaryTable';
import SummaryDetailModal from '../components/summary/SummaryDetailModal';

const DIST_KEYS = ['b50', 'b60', 'b70', 'b80', 'b90', 'b100', 'b110', 'b120', 'b130', 'b140', 'b150', 'b150p'];

function yesterdayISO() {
    const d = new Date();
    d.setDate(d.getDate() - 1);
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

    const defaultDate = yesterdayISO();

    // 폼 입력(draft)과 적용(applied)을 분리 -> 조회 버튼 눌러야만 테이블 갱신
    const [draft, setDraft] = useState({ mode: 'day', date: defaultDate, equipment: 'all' });
    const [applied, setApplied] = useState({ mode: 'day', date: defaultDate, equipment: 'all' });

    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState([]);
    const [detailModal, setDetailModal] = useState({ open: false, branch: '', departmentCode: '', distKey: '' });

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
        if (!params) return;
        setLoading(true);
        try {
            const raw = (await apiClient.get('/summary', { params })).data;
            const apiRows = Array.isArray(raw) ? raw : [];
            const mapped = apiRows.map((r) => {
                // API 응답 구조 확인용 (개발 후 제거 가능)
                if (apiRows.length > 0 && apiRows.indexOf(r) === 0) {
                    console.log('[SummaryTab] API 응답 샘플:', r);
                    console.log('[SummaryTab] department_code:', r.department_code, 'department_id:', r.department_id, 'department:', r.department);
                }
                const out = {
                    branch: r.department ?? '',
                    departmentCode: r.department_code ?? r.department_id ?? '',
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
            console.error('Failed to fetch /summary', err);
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

    const onOpenDetailModal = ({ branch, departmentCode, distKey }) => {
        console.log('[SummaryTab] onOpenDetailModal 호출:', { branch, departmentCode, distKey });
        setDetailModal({ open: true, branch: branch ?? '', departmentCode: departmentCode ?? '', distKey: distKey ?? '' });
    };
    const onCloseDetailModal = () => {
        setDetailModal((prev) => ({ ...prev, open: false }));
    };

    const periodLabel = applied.date ? (applied.mode === 'month' ? `${applied.date.slice(0, 7)} (월간)` : `${applied.date} (일간)`) : '';

    return (
        <section className="w-full">
            <SummaryFilters state={draft} setState={setDraft} selects={{ equipmentOptions }} onSubmit={onSubmit} onReset={onReset} loading={loading} />
            <SummaryTable
                rows={rows}
                submitted={submitted}
                loading={loading}
                periodLabel={periodLabel}
                onOpenDetailModal={onOpenDetailModal}
            />
            <SummaryDetailModal
                open={detailModal.open}
                onClose={onCloseDetailModal}
                branch={detailModal.branch}
                departmentCode={detailModal.departmentCode}
                distKey={detailModal.distKey}
                applied={detailModal.open ? applied : null}
            />
        </section>
    );
}