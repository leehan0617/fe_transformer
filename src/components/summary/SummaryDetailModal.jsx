import React, { useEffect, useState } from 'react';
import apiClient from '../../api/client';
import Modal from '../common/Modal';

/**
 * SummaryTable의 이용률 분포 셀 클릭 시 열리는 모달.
 * DetailTab과 동일한 /detail API로 조회하여 테이블 형태로 표시.
 */
const BASE = [
    { key: 'branch', label: '지사' },
    { key: 'lineName', label: '선로명' },
    { key: 'lineNo', label: '선로번호' },
    { key: 'compNo', label: '변대주 전산화번호' },
    { key: 'connectionType', label: '결선방식' },
    { key: 'ouType', label: '설비구분' },
];
const CAP_GROUP = [
    { key: 'capA', label: 'A', align: 'right' },
    { key: 'capB', label: 'B', align: 'right' },
    { key: 'capC', label: 'C', align: 'right' },
];
const CUST_GROUP = [
    { key: 'customer', label: '고객' },
    { key: 'amiBuilt', label: 'AMI 구축' },
];
const LOAD_GROUP = [
    { key: 'contractPowerAmi', label: 'AMI 구축', align: 'right' },
    { key: 'contractPowerNoAmi', label: 'AMI 미구축', align: 'right' },
];
const SUMUTIL = { key: 'sumUtilPct', label: '변압기 합산이용률', align: 'right' };
const PHASE_GROUP = [
    { key: 'phaseUtilA', label: 'A', align: 'right' },
    { key: 'phaseUtilB', label: 'B', align: 'right' },
    { key: 'phaseUtilC', label: 'C', align: 'right' },
];

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

function computeDetailParams({ mode, date, equipment }, usageRate, departmentCode) {
    const params = {};
    if (mode === 'month' && date) {
        const ym = String(date).slice(0, 7);
        const start = new Date(ym + '-01T00:00:00');
        const end = lastDayOfMonth(start);
        params.start_date = formatYmd(start);
        params.end_date = formatYmd(end);
    } else if (date) {
        const dstr = String(date).length === 7 ? String(date) + '-01' : String(date);
        const d = new Date(dstr + 'T00:00:00');
        const ymd = formatYmd(d);
        params.start_date = ymd;
        params.end_date = ymd;
    }
    if (equipment && equipment !== 'all') params.line_type = equipment;
    if (usageRate) params.usage_rate = usageRate;
    if (departmentCode) params.department_code = departmentCode;
    return params;
}

function fmtText(v) {
    if (v === 0) return '0';
    return v ?? '-';
}
function fmtNum(v) {
    const n = Number(v);
    if (Number.isFinite(n)) return n.toLocaleString();
    return '-';
}
function fmtMaybeNum(v) {
    const n = Number(v);
    if (Number.isFinite(n)) return n.toLocaleString();
    if (v === 0) return '0';
    return v ?? '-';
}
function fmtPct(v) {
    const n = Number(v);
    if (!Number.isFinite(n)) return '-';
    return `${n.toFixed(1)}%`;
}

export default function SummaryDetailModal({ open, onClose, branch, departmentCode, distKey, applied }) {
    console.log('[SummaryDetailModal] props:', { branch, departmentCode, distKey, applied });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [rows, setRows] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(0);
    const pageSize = 20;

    const DIST_KEY_TO_USAGE = {
        b50: '50', b60: '60', b70: '70', b80: '80', b90: '90', b100: '100',
        b110: '110', b120: '120', b130: '130', b140: '140', b150: '150', b150p: '150+',
    };
    const DIST_KEY_TO_LABEL = {
        b50: '50% 미만', b60: '60% 미만', b70: '70% 미만', b80: '80% 미만', b90: '90% 미만', b100: '100% 미만',
        b110: '110% 미만', b120: '120% 미만', b130: '130% 미만', b140: '140% 미만', b150: '150% 미만', b150p: '150% 이상',
    };
    const usageRate = distKey ? DIST_KEY_TO_USAGE[distKey] : null;
    const distLabel = distKey ? DIST_KEY_TO_LABEL[distKey] : '';

    useEffect(() => {
        if (open) setPage(0);
    }, [open]);

    useEffect(() => {
        if (!open || !applied || !usageRate) return;

        let alive = true;
        (async () => {
            setLoading(true);
            setError('');
            setRows([]);
            setTotalCount(0);
            try {
                const params = computeDetailParams(applied, usageRate, departmentCode);
                const requestParams = { ...params, request_page: page, page_size: pageSize };
                console.log('[SummaryDetailModal] API 호출 params:', requestParams);
                const raw = (await apiClient.get('/detail', { params: requestParams })).data;

                if (!alive) return;

                const apiRows = Array.isArray(raw?.data) ? raw.data : [];
                const total = Number(raw?.count) || 0;

                const mapped = apiRows.map((r) => ({
                    id: r.id,
                    transformerId: r.transformer_id,
                    branch: r.department_name || '',
                    lineName: r.line_name || '',
                    lineNo: r.line_id || '',
                    compNo: r.pole_id || '',
                    connectionType: r.connection_type || '',
                    ouType: r.line_type || '',
                    capA: Number(r.volume_a) || 0,
                    capB: Number(r.volume_b) || 0,
                    capC: Number(r.volume_c) || 0,
                    customer: Number(r.customer_count) || 0,
                    amiBuilt: Number(r.ami_count) || 0,
                    contractPowerAmi: Number(r.ami_voltage_sum) || 0,
                    contractPowerNoAmi: Number(r.not_ami_voltage_sum) || 0,
                    sumUtilPct: Number(r.usage_rate) || 0,
                    phaseUtilA: Number(r.usage_a) || 0,
                    phaseUtilB: Number(r.usage_b) || 0,
                    phaseUtilC: Number(r.usage_c) || 0,
                }));

                setRows(mapped);
                setTotalCount(total);
            } catch (e) {
                if (!alive) return;
                console.error(e);
                setError('상세 데이터를 불러오지 못했습니다.');
            } finally {
                if (alive) setLoading(false);
            }
        })();

        return () => { alive = false; };
    }, [open, applied, usageRate, departmentCode, page]);

    const totalPages = pageSize ? Math.ceil(totalCount / pageSize) : 0;
    const title = branch ? `${distLabel} 상세 · ${branch}` : `${distLabel} 상세`;

    return (
        <Modal open={open} onClose={onClose} title={title} wide>
            {!distLabel ? (
                <div className="text-gray-500">조회 조건이 없습니다.</div>
            ) : loading && rows.length === 0 ? (
                <div className="flex items-center gap-2 text-gray-500">
                    <svg className="animate-spin h-5 w-5 text-sky-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    불러오는 중…
                </div>
            ) : error ? (
                <div className="text-red-600">{error}</div>
            ) : (
                <div className="space-y-3">
                    <div className="text-sm text-gray-500">
                        총 {totalCount.toLocaleString()}건 · {page + 1}/{totalPages || 1} 페이지
                    </div>
                    <div className="overflow-x-auto rounded-xl border border-gray-200">
                        <table className="w-full text-sm whitespace-nowrap">
                            <thead className="bg-gray-50 text-gray-600">
                                <tr>
                                    {BASE.map((c) => (
                                        <th key={c.key} className="px-3 py-2 text-left font-medium border border-gray-300">{c.label}</th>
                                    ))}
                                    {CAP_GROUP.map((c) => (
                                        <th key={c.key} className="px-3 py-2 text-right font-medium border border-gray-300">{c.label}</th>
                                    ))}
                                    {CUST_GROUP.map((c) => (
                                        <th key={c.key} className="px-3 py-2 text-right font-medium border border-gray-300">{c.label}</th>
                                    ))}
                                    {LOAD_GROUP.map((c) => (
                                        <th key={c.key} className="px-3 py-2 text-right font-medium border border-gray-300">{c.label}</th>
                                    ))}
                                    <th className="px-3 py-2 text-right font-medium border border-gray-300">{SUMUTIL.label}</th>
                                    {PHASE_GROUP.map((c) => (
                                        <th key={c.key} className="px-3 py-2 text-right font-medium border border-gray-300">{c.label}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.length === 0 ? (
                                    <tr>
                                        <td colSpan={BASE.length + CAP_GROUP.length + CUST_GROUP.length + LOAD_GROUP.length + 1 + PHASE_GROUP.length} className="px-3 py-6 text-center text-gray-500 border border-gray-300">
                                            조건에 맞는 결과가 없습니다.
                                        </td>
                                    </tr>
                                ) : (
                                    rows.map((row, i) => (
                                        <tr key={row.id ?? i} className="odd:bg-white even:bg-gray-50">
                                            {BASE.map((c) => (
                                                <td key={c.key} className="px-3 py-2 border border-gray-300">{fmtText(row[c.key])}</td>
                                            ))}
                                            {CAP_GROUP.map((c) => (
                                                <td key={c.key} className="px-3 py-2 text-right tabular-nums border border-gray-300">{fmtNum(row[c.key])}</td>
                                            ))}
                                            {CUST_GROUP.map((c) => (
                                                <td key={c.key} className="px-3 py-2 text-right tabular-nums border border-gray-300">{fmtMaybeNum(row[c.key])}</td>
                                            ))}
                                            {LOAD_GROUP.map((c) => (
                                                <td key={c.key} className="px-3 py-2 text-right tabular-nums border border-gray-300">{fmtNum(row[c.key])}</td>
                                            ))}
                                            <td className="px-3 py-2 text-right tabular-nums border border-gray-300">{fmtPct(row.sumUtilPct)}</td>
                                            {PHASE_GROUP.map((c) => (
                                                <td key={c.key} className="px-3 py-2 text-right tabular-nums border border-gray-300">{fmtPct(row[c.key])}</td>
                                            ))}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2">
                            <button
                                type="button"
                                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                                disabled={page <= 0}
                                onClick={() => setPage((p) => Math.max(0, p - 1))}
                            >
                                이전
                            </button>
                            <span className="text-sm text-gray-600">
                                {page + 1} / {totalPages}
                            </span>
                            <button
                                type="button"
                                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                                disabled={page >= totalPages - 1}
                                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                            >
                                다음
                            </button>
                        </div>
                    )}
                </div>
            )}
        </Modal>
    );
}
