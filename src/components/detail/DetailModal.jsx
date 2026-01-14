import React, { useEffect, useMemo, useState } from 'react';
import apiClient from '../../api/client';
import Modal from '../common/Modal';
import TrendBarChart from '../charts/TrendBarChart';

export default function DetailModal({ open, onClose, row, mode = 'day', startDate, endDate }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [chartData, setChartData] = useState([]);
    const [rawList, setRawList] = useState([]);

    useEffect(() => {
        if (!open || !row?.transformerId) return;

        let alive = true;
        (async () => {
            try {
                setLoading(true);
                setError('');
                setChartData([]);
                setRawList([]);

                const transformerId = String(row.transformerId).trim();
                if (!transformerId) return;

                // 날짜 파라미터 생성
                const dateParams = buildDateParams(mode, startDate, endDate);
                const queryString = new URLSearchParams({
                    transformer_id: transformerId,
                    ...dateParams,
                }).toString();

                const payload = (await apiClient.get(`/detail?${queryString}`)).data;

                if (!alive) return;

                const normalized = normalizeDetailResponse(payload, mode);
                setChartData(normalized.chart);
                setRawList(normalized.raw);
            } catch (e) {
                if (!alive) return;
                console.error(e);
                setError('상세 데이터를 불러오지 못했습니다.');
            } finally {
                if (alive) setLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, [open, row, mode, startDate, endDate]);

    const title = row ? `상세 보기 · ${row.compNo}` : '상세 보기';
    const metaRows = useMemo(
        () =>
            row
                ? [
                      ['지사', row.branch],
                      ['선로명', row.lineName],
                      ['선로번호', row.lineNo],
                      ['변대주 전산화번호', row.compNo],
                      ['가공지중구분', row.ouType],
                      ['결선방식', row.connectionType],
                      ['용량 A/B/C (kVA)', `${fmt(row.capA)} / ${fmt(row.capB)} / ${fmt(row.capC)}`],
                      ['고객', row.customer],
                      ['AMI 구축', Number(row.amiBuilt) || 0],
                      ['AMI 구축 계약전력', fmt(row.contractPowerAmi)],
                      ['AMI 미구축 계약전력', fmt(row.contractPowerNoAmi)],
                      [
                          '합산이용률',
                          row.sumUtilPct != null ? `${Number(row.sumUtilPct).toFixed(1)}%` : '-',
                      ],
                      [
                          '상별 이용률 A/B/C (%)',
                          `${Number(row.phaseUtilA || 0).toFixed(1)}% / ${Number(row.phaseUtilB || 0).toFixed(
                              1,
                          )}% / ${Number(row.phaseUtilC || 0).toFixed(1)}%`,
                      ],
                  ]
                : [],
        [row],
    );

    return (
        <Modal open={open} onClose={onClose} title={title} wide>
            {!row ? (
                <div className="text-gray-500">행을 선택해 주세요.</div>
            ) : loading ? (
                <div className="text-gray-500">불러오는 중…</div>
            ) : error ? (
                <div className="text-red-600">{error}</div>
            ) : chartData.length === 0 ? (
                <div className="text-gray-500">표시할 데이터가 없습니다.</div>
            ) : (
                <div className="space-y-4">
                    <div>
                        <div className="mb-1 flex items-center justify-between">
                            <div className="text-sm text-gray-600">이용률 추이 (스택 막대)</div>
                            <div className="text-xs text-gray-500">
                                단위: {mode === 'month' ? '월별 이용률(%)' : '일별 이용률(%)'}
                            </div>
                        </div>
                        <div className="rounded-xl border border-gray-200 p-2">
                            <TrendBarChart data={chartData} height={220} />
                        </div>
                    </div>

                    <div>
                        <div className="mb-1 text-sm text-gray-600">기본 정보</div>
                        <div className="overflow-hidden rounded-xl border border-gray-200">
                            <table className="w-full text-sm">
                                <tbody>
                                    {metaRows.map(([k, v]) => (
                                        <tr key={k} className="odd:bg-white even:bg-gray-50">
                                            <td className="px-3 py-2 w-48 text-gray-600">{k}</td>
                                            <td className="px-3 py-2">{v ?? '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
}

function normalizeDetailResponse(payload, mode) {
    const list = Array.isArray(payload) ? payload : [];
    const sorted = [...list].sort((a, b) => String(a.creation).localeCompare(String(b.creation)));
    const chart = sorted.map((item) => {
        const usageA = Number(item.usage_a) || 0;
        const usageB = Number(item.usage_b) || 0;
        const usageC = Number(item.usage_c) || 0;
        const usageRate = Number(item.usage_rate) || usageA + usageB + usageC;
        return {
            label: formatCreationLabel(item.creation, mode),
            usageA,
            usageB,
            usageC,
            usageRate,
        };
    });
    return { chart, raw: sorted };
}

function formatCreationLabel(raw, mode) {
    const str = String(raw ?? '');
    if (str.length !== 8) return str;
    const y = str.slice(0, 4);
    const m = str.slice(4, 6);
    const d = str.slice(6, 8);
    if (mode === 'month') return `${y}-${m}`;
    return `${y}-${m}-${d}`;
}

function fmt(n) {
    const v = Number(n);
    return Number.isFinite(v) ? v.toLocaleString() : '-';
}

// 날짜를 YYYYMMDD 형식으로 변환
function formatYmd(dateObj) {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}${m}${d}`;
}

// 월의 마지막 일자 구하기
function lastDayOfMonth(dateObj) {
    const y = dateObj.getFullYear();
    const m = dateObj.getMonth();
    return new Date(y, m + 1, 0);
}

// 날짜 파라미터 생성
function buildDateParams(mode, startDate, endDate) {
    const params = {};
    
    if (mode === 'month') {
        // 월일 경우: 시작일은 선택된 월의 1일, 종료일은 해당 월의 말일
        if (startDate) {
            const ym = String(startDate).slice(0, 7); // YYYY-MM
            const start = new Date(ym + '-01T00:00:00');
            const end = lastDayOfMonth(start);
            params.start_date = formatYmd(start);
            params.end_date = formatYmd(end);
        }
    } else {
        // 일일 경우: 시작일과 종료일은 선택된 일자 그대로
        if (startDate) {
            const dstr = String(startDate).length === 7 ? String(startDate) + '-01' : String(startDate);
            const d = new Date(dstr + 'T00:00:00');
            params.start_date = formatYmd(d);
        }
        if (endDate) {
            const dstr = String(endDate).length === 7 ? String(endDate) + '-01' : String(endDate);
            const d = new Date(dstr + 'T00:00:00');
            params.end_date = formatYmd(d);
        }
    }
    
    return params;
}
