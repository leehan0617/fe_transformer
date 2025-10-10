import React, { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import TrendBarChart from '../charts/TrendBarChart';

export default function DetailModal({ open, onClose, row, mode = 'day' }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [data, setData] = useState(null);

    useEffect(() => {
        if (!open || !row) return;
        let alive = true;
        (async () => {
            try {
                setLoading(true);
                setError('');
                // TODO: 실제 API 연동
                // const res = await fetch(`/api/transformers/${encodeURIComponent(row.compNo)}?mode=${mode}`);
                // const json = await res.json();
                const json = await fakeFetch(row, mode);
                if (!alive) return;
                setData(json);
            } catch (e) {
                if (!alive) return;
                setError('상세 데이터를 불러오지 못했습니다.');
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => { alive = false; };
    }, [open, row, mode]);

    const title = row ? `상세 보기 · ${row.compNo}` : '상세 보기';
    const unitLabel = mode === 'month' ? '단위: 월' : '단위: 일';

    return (
        <Modal open={open} onClose={onClose} title={title} wide>
            {!row ? (
                <div className="text-gray-500">행을 선택해 주세요.</div>
            ) : loading ? (
                <div className="text-gray-500">불러오는 중…</div>
            ) : error ? (
                <div className="text-red-600">{error}</div>
            ) : (
                <div className="space-y-4">{/* 공백 최소화: 6 → 4 */}
                    {/* Top: Full-width chart */}
                    <div>
                        <div className="mb-1 flex items-center justify-between">
                            <div className="text-sm text-gray-600">최근 12기간 추이</div>
                            <div className="text-xs text-gray-500">{unitLabel}</div>
                        </div>
                        <div className="rounded-xl border border-gray-200 p-2">{/* p-3 → p-2 */}
                            <TrendBarChart
                                labels={data?.trend?.labels ?? []}
                                values={data?.trend?.values ?? []}
                                height={220}
                            />
                        </div>
                    </div>

                    {/* Bottom: meta table */}
                    <div>
                        <div className="mb-1 text-sm text-gray-600">기본 정보</div>
                        <div className="overflow-hidden rounded-xl border border-gray-200">
                            <table className="w-full text-sm">
                                <tbody>
                                {[
                                    ['지사', row.branch],
                                    ['설비구분', row.equipment],
                                    ['결선방식', row.connectionType],
                                    ['가공지중구분', row.ouType],
                                    ['용량 A/B/C (kVA)', `${fmt(row.capA)} / ${fmt(row.capB)} / ${fmt(row.capC)}`],
                                    ['고객', row.customer],
                                    ['AMI 구축', row.amiBuilt ? 'Y' : 'N'],
                                    ['AMI 구축 계약전력', fmt(row.contractPowerAmi)],
                                    ['AMI 미구축 계약전력', fmt(row.contractPowerNoAmi)],
                                    ['합산이용률', row.sumUtilPct != null ? `${Number(row.sumUtilPct).toFixed(1)}%` : '-'],
                                ].map(([k, v]) => (
                                    <tr key={k} className="odd:bg-white even:bg-gray-50">
                                        <td className="px-3 py-2 w-40 text-gray-600">{k}</td>
                                        <td className="px-3 py-2">{v ?? '-'}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Optional payload preview */}
                    {data?.extra && (
                        <div>
                            <div className="mb-1 text-sm text-gray-600">추가 데이터(예시)</div>
                            <pre className="text-xs bg-gray-50 rounded-xl border border-gray-200 p-3 overflow-auto max-h-60">
                {JSON.stringify(data.extra, null, 2)}
              </pre>
                        </div>
                    )}
                </div>
            )}
        </Modal>
    );
}

function fmt(n) {
    const v = Number(n);
    return Number.isFinite(v) ? v.toLocaleString() : '-';
}

function toYyMmDd(d) {
    const yy = String(d.getFullYear()).slice(-2);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yy}-${mm}-${dd}`;
}
function toYyMm(d) {
    const yy = String(d.getFullYear()).slice(-2);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${yy}-${mm}`;
}

async function fakeFetch(row, mode) {
    // 예시 데이터 생성 (최근 12개 구간)
    await new Promise((r) => setTimeout(r, 200));
    const anchor = new Date((row?.date ?? new Date().toISOString().slice(0,10)) + 'T00:00:00');
    const labels = [];
    const values = [];
    if (mode === 'month') {
        const start = new Date(anchor.getFullYear(), anchor.getMonth() - 11, 1);
        for (let i = 0; i < 12; i++) {
            const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
            labels.push(toYyMm(d));           // 25-01, 25-02 ...
            values.push(Math.floor(40 + Math.random() * 80));
        }
    } else {
        const start = new Date(anchor);
        start.setDate(anchor.getDate() - 11);
        for (let i = 0; i < 12; i++) {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            labels.push(toYyMmDd(d));         // 25-09-01, 25-09-02 ...
            values.push(Math.floor(40 + Math.random() * 80));
        }
    }
    return { trend: { labels, values }, extra: { compNo: row.compNo, mode, anchor: anchor.toISOString() } };
}
