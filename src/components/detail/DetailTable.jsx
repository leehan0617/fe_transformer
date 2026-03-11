import React from 'react';

export default function DetailTable({ rows, submitted, loading, page, pageSize, totalCount, onPageChange, onPageSizeChange, onOpenDetail }) {
    // Base (rowSpan=2)
    const BASE = [
        { key: 'branch', label: '지사' },
        { key: 'lineName', label: '선로명' },
        { key: 'lineNo', label: '선로번호' },
        { key: 'compNo', label: '변대주 전산화번호', multiline: true }, // multiline 플래그 추가
        { key: 'connectionType', label: '결선방식' },
        { key: 'ouType', label: '설비구분' },
    ];

    // Groups (colSpan)
    const CAP_GROUP = {
        label: '변압기 용량(kVA)',
        cols: [
            { key: 'capA', label: 'A', align: 'right' },
            { key: 'capB', label: 'B', align: 'right' },
            { key: 'capC', label: 'C', align: 'right' },
        ],
    };

    const CUST_GROUP = {
        label: '변압기 고객(호)',
        cols: [
            { key: 'customer', label: '고객' },     // 현재 데이터 스키마: 텍스트/숫자 혼재 가능
            { key: 'amiBuilt', label: 'AMI 구축' }, // 현재 데이터 스키마: Y/N 또는 숫자
        ],
    };

    const LOAD_GROUP = {
        label: '변압기 부하(계약전력)',
        cols: [
            { key: 'contractPowerAmi',   label: 'AMI 구축',   align: 'right' },
            { key: 'contractPowerNoAmi', label: 'AMI 미구축', align: 'right' },
        ],
    };

    const SUMUTIL = { key: 'sumUtilPct', label: '변압기 합산이용률', align: 'right' }; // rowSpan=2
    const PEAK_TIME = { key: 'peakTime', label: '피크시간' }; // rowSpan=2
    const PEAK_DEMAND = { key: 'peakDemand', label: '피크값', align: 'right' }; // rowSpan=2

    const PHASE_UTIL_GROUP = {
        label: '각 상별 추정 이용률',
        cols: [
            { key: 'phaseUtilA', label: 'A', align: 'right' },
            { key: 'phaseUtilB', label: 'B', align: 'right' },
            { key: 'phaseUtilC', label: 'C', align: 'right' },
        ],
    };

    // 🔹 엑셀 다운로드 가능 조건 & 핸들러
    const canDownload = submitted && !loading && rows && rows.length > 0;
    const totalPages = pageSize ? Math.ceil(totalCount / pageSize) : 0;
    const disablePager = !submitted || loading || totalPages <= 1;
    const currentPageDisplay = totalPages === 0 ? 0 : page + 1;
    const totalPageDisplay = totalPages || 0;

    const handlePageChange = (next) => {
        if (disablePager) return;
        const safeNext = Math.min(Math.max(next, 0), Math.max(totalPages - 1, 0));
        if (safeNext !== page) {
            onPageChange?.(safeNext);
        }
    };

    const handlePageSizeChange = (e) => {
        const nextSize = Number(e.target.value);
        if (!Number.isFinite(nextSize) || nextSize <= 0) return;
        onPageSizeChange?.(nextSize);
    };
    const onDownloadXLSX = () =>
        exportXLSX({
            rows,
            BASE,
            CAP_GROUP,
            CUST_GROUP,
            LOAD_GROUP,
            SUMUTIL,
            PEAK_TIME,
            PEAK_DEMAND,
            PHASE_UTIL_GROUP,
        });

    return (
        <section className="mt-6">
            <div className="flex items-end justify-between mb-2">
                <h2 className="text-lg font-semibold">결과</h2>
                <div className="flex items-center gap-3">
                    {submitted && !loading && (
                        <div className="text-sm text-gray-500">
                            총 {totalCount.toLocaleString()}건 · {pageSize.toLocaleString()}개/페이지
                        </div>
                    )}
                    <div className="flex items-center gap-1 text-sm">
                        <label className="text-gray-600">페이지당</label>
                        <select
                            value={pageSize}
                            onChange={handlePageSizeChange}
                            disabled={!submitted || loading}
                            className="border rounded-md px-2 py-1 text-sm"
                        >
                            {[10, 20, 50, 100].map((size) => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                        <button
                            type="button"
                            className="px-2 py-1 border rounded disabled:opacity-50"
                            onClick={() => handlePageChange(0)}
                            disabled={disablePager || page <= 0}
                            title="첫 페이지"
                        >
                            ≪
                        </button>
                        <button
                            type="button"
                            className="px-2 py-1 border rounded disabled:opacity-50"
                            onClick={() => handlePageChange(page - 1)}
                            disabled={disablePager || page <= 0}
                            title="이전 페이지"
                        >
                            ‹
                        </button>
                        <div className="px-2 text-gray-700">
                            {currentPageDisplay} / {totalPageDisplay}
                        </div>
                        <button
                            type="button"
                            className="px-2 py-1 border rounded disabled:opacity-50"
                            onClick={() => handlePageChange(page + 1)}
                            disabled={disablePager || page >= totalPages - 1}
                            title="다음 페이지"
                        >
                            ›
                        </button>
                        <button
                            type="button"
                            className="px-2 py-1 border rounded disabled:opacity-50"
                            onClick={() => handlePageChange(totalPages - 1)}
                            disabled={disablePager || page >= totalPages - 1}
                            title="마지막 페이지"
                        >
                            ≫
                        </button>
                    </div>
                    <button
                        type="button"
                        onClick={onDownloadXLSX}
                        disabled={!canDownload}
                        className={`h-8 px-3 rounded-md border text-sm shadow-sm ${
                            canDownload
                                ? 'border-gray-300 bg-white hover:bg-gray-50'
                                : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                        title={canDownload ? '현재 표를 .xlsx로 저장' : '조회 결과가 있을 때 사용 가능'}
                    >
                        엑셀(.xlsx) 다운로드
                    </button>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm whitespace-nowrap">
                        <thead className="bg-gray-50 text-gray-600">
                        {/* Header row 1 */}
                        <tr>
                            {BASE.map((c) => (
                                <Th key={`base-top-${c.key}`} rowSpan={2}>
                                    {c.multiline ? (
                                        <div className="leading-tight">
                                            <div>변대주</div>
                                            <div>전산화번호</div>
                                        </div>
                                    ) : (
                                        c.label
                                    )}
                                </Th>
                            ))}
                            <Th colSpan={CAP_GROUP.cols.length} className="text-center">{CAP_GROUP.label}</Th>
                            <Th colSpan={CUST_GROUP.cols.length} className="text-center">{CUST_GROUP.label}</Th>
                            <Th colSpan={LOAD_GROUP.cols.length} className="text-center">{LOAD_GROUP.label}</Th>
                            <Th rowSpan={2} className="text-right">{SUMUTIL.label}</Th>
                            <Th rowSpan={2} className="text-center">{PEAK_TIME.label}</Th>
                            <Th rowSpan={2} className="text-right">{PEAK_DEMAND.label}</Th>
                            <Th colSpan={PHASE_UTIL_GROUP.cols.length} className="text-center">{PHASE_UTIL_GROUP.label}</Th>
                        </tr>

                        {/* Header row 2 */}
                        <tr>
                            {CAP_GROUP.cols.map((c) => (
                                <Th key={`cap-${c.key}`} className={c.align === 'right' ? 'text-right' : ''}>{c.label}</Th>
                            ))}
                            {CUST_GROUP.cols.map((c) => (
                                <Th key={`cust-${c.key}`} className={c.align === 'right' ? 'text-right' : ''}>{c.label}</Th>
                            ))}
                            {LOAD_GROUP.cols.map((c) => (
                                <Th key={`load-${c.key}`} className={c.align === 'right' ? 'text-right' : ''}>{c.label}</Th>
                            ))}
                            {PHASE_UTIL_GROUP.cols.map((c) => (
                                <Th key={`phu-${c.key}`} className={c.align === 'right' ? 'text-right' : ''}>{c.label}</Th>
                            ))}
                        </tr>
                        </thead>

                        <tbody>
                        {!submitted ? (
                            <tr>
                                <td colSpan={
                                    BASE.length + CAP_GROUP.cols.length + CUST_GROUP.cols.length + LOAD_GROUP.cols.length + 1 + 2 + PHASE_UTIL_GROUP.cols.length
                                } className="p-6 text-center text-gray-500">
                                    위의 조건을 선택한 후 <span className="font-medium">조회</span>를 눌러 주세요.
                                </td>
                            </tr>
                        ) : loading ? (
                            <tr>
                                <td colSpan={
                                    BASE.length + CAP_GROUP.cols.length + CUST_GROUP.cols.length + LOAD_GROUP.cols.length + 1 + 2 + PHASE_UTIL_GROUP.cols.length
                                } className="p-6 text-center text-gray-500">불러오는 중…</td>
                            </tr>
                        ) : rows.length === 0 ? (
                            <tr>
                                <td colSpan={
                                    BASE.length + CAP_GROUP.cols.length + CUST_GROUP.cols.length + LOAD_GROUP.cols.length + 1 + 2 + PHASE_UTIL_GROUP.cols.length
                                } className="p-6 text-center text-gray-500">조건에 맞는 결과가 없습니다.</td>
                            </tr>
                        ) : (
                            rows.map((row, i) => (
                                <tr 
                                    key={row.id ?? i} 
                                    className="odd:bg-white even:bg-gray-50 cursor-pointer hover:bg-sky-50 transition-colors"
                                    onClick={() => onOpenDetail?.(row)}
                                >
                                    <Td>{fmtText(row.branch)}</Td>
                                    <Td>{fmtText(row.lineName)}</Td>
                                    <Td>{fmtText(row.lineNo)}</Td>
                                    <Td>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();          // 행 클릭 이벤트 막기
                                                onOpenDetail?.(row);          // 현재 행 전체 데이터를 모달로 전달
                                            }}
                                            className="text-sky-600 hover:text-sky-700 underline underline-offset-2"
                                            title="상세 보기"
                                        >
                                            {fmtText(row.compNo)}
                                        </button>
                                    </Td>
                                    <Td>{fmtText(row.connectionType)}</Td>
                                    <Td>{fmtText(row.ouType)}</Td>

                                    {CAP_GROUP.cols.map((c) => (
                                        <Td key={`cap-${c.key}`} className="text-right tabular-nums">{fmtNum(row[c.key])}</Td>
                                    ))}

                                    {/* 변압기 고객 (현재 스키마대로: 텍스트/숫자 혼용 가능) */}
                                    <Td className="text-right tabular-nums">{fmtMaybeNum(row.customer)}</Td>
                                    <Td className="text-right tabular-nums">{fmtMaybeNum(row.amiBuilt)}</Td>

                                    {/* 부하 */}
                                    <Td className="text-right tabular-nums">{fmtNum(row.contractPowerAmi)}</Td>
                                    <Td className="text-right tabular-nums">{fmtNum(row.contractPowerNoAmi)}</Td>

                                    {/* 합산이용률 */}
                                    <Td className="text-right tabular-nums">{fmtPct(row.sumUtilPct)}</Td>

                                    {/* 피크 */}
                                    <Td>{fmtText(row.peakTime)}</Td>
                                    <Td className="text-right tabular-nums">{fmtNum(row.peakDemand)}</Td>

                                    {/* 상별 추정 이용률 */}
                                    <Td className="text-right tabular-nums">{fmtPct(row.phaseUtilA)}</Td>
                                    <Td className="text-right tabular-nums">{fmtPct(row.phaseUtilB)}</Td>
                                    <Td className="text-right tabular-nums">{fmtPct(row.phaseUtilC)}</Td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}

function Th({ children, className = '', rowSpan, colSpan }) {
    return (
        <th rowSpan={rowSpan} colSpan={colSpan} className={`px-3 py-2 text-left font-medium border border-gray-300 ${className}`}>
            {children}
        </th>
    );
}

function Td({ children, className = '' }) {
    return <td className={`px-3 py-2 align-middle border border-gray-300 ${className}`}>{children}</td>;
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
    // 숫자가 아니면 원문 출력
    if (v === 0) return '0';
    return v ?? '-';
}
function fmtPct(v) {
    const n = Number(v);
    if (!Number.isFinite(n)) return '-';
    return `${n.toFixed(1)}%`;
}

/* ================= XLSX export ================= */
async function exportXLSX({ rows, BASE, CAP_GROUP, CUST_GROUP, LOAD_GROUP, SUMUTIL, PEAK_TIME, PEAK_DEMAND, PHASE_UTIL_GROUP }) {
    const XLSX = await import('xlsx');

    // 컬럼 순서를 평탄화
    const ORDER = [
        ...BASE.map((c) => c.key),
        ...CAP_GROUP.cols.map((c) => c.key),
        ...CUST_GROUP.cols.map((c) => c.key),
        ...LOAD_GROUP.cols.map((c) => c.key),
        SUMUTIL.key,
        PEAK_TIME.key,
        PEAK_DEMAND.key,
        ...PHASE_UTIL_GROUP.cols.map((c) => c.key),
    ];

    // Header rows (2-tier)
    const headerTop = [
        ...BASE.map((c) => c.label),
        CAP_GROUP.label, '', '',                 // 3칸 병합
        CUST_GROUP.label, '',                    // 2칸 병합
        LOAD_GROUP.label, '',                    // 2칸 병합
        SUMUTIL.label,                           // rowSpan
        PEAK_TIME.label,                         // rowSpan
        PEAK_DEMAND.label,                       // rowSpan
        PHASE_UTIL_GROUP.label, '', '',          // 3칸 병합
    ];

    const headerSub = [
        ...BASE.map(() => ''),                   // rowSpan (빈칸)
        ...CAP_GROUP.cols.map((c) => c.label),
        ...CUST_GROUP.cols.map((c) => c.label),
        ...LOAD_GROUP.cols.map((c) => c.label),
        '',                                      // SUMUTIL rowSpan (빈칸)
        '',                                      // PEAK_TIME rowSpan (빈칸)
        '',                                      // PEAK_DEMAND rowSpan (빈칸)
        ...PHASE_UTIL_GROUP.cols.map((c) => c.label),
    ];

    // Body rows
    const toCell = (r, k) => {
        const v = r?.[k];

        if (['capA','capB','capC','contractPowerAmi','contractPowerNoAmi','sumUtilPct','peakDemand','phaseUtilA','phaseUtilB','phaseUtilC'].includes(k)) {
            const n = Number(v);
            return Number.isFinite(n) ? n : '';
        }
        // 고객/AMI 구축은 스키마 혼합 대응 (숫자면 숫자, 아니면 원문)
        if (['customer','amiBuilt'].includes(k)) {
            const n = Number(v);
            return Number.isFinite(n) ? n : (v ?? '');
        }
        return v ?? '';
    };

    const body = rows.map((r) => ORDER.map((k) => toCell(r, k)));

    const aoa = [headerTop, headerSub, ...body];
    const ws = XLSX.utils.aoa_to_sheet(aoa);

    // Merges: BASE(6개)와 SUMUTIL(1개)은 rowSpan=2, 그룹 헤더는 colSpan
    const baseCount = BASE.length; // 6
    const merges = [];

    // BASE rowSpan
    for (let c = 0; c < baseCount; c++) {
        merges.push({ s: { r: 0, c }, e: { r: 1, c } });
    }

    // CAP_GROUP colSpan 3 → columns baseCount .. baseCount+2
    merges.push({ s: { r: 0, c: baseCount }, e: { r: 0, c: baseCount + CAP_GROUP.cols.length - 1 } });

    // CUST_GROUP colSpan 2
    const custStart = baseCount + CAP_GROUP.cols.length;
    merges.push({ s: { r: 0, c: custStart }, e: { r: 0, c: custStart + CUST_GROUP.cols.length - 1 } });

    // LOAD_GROUP colSpan 2
    const loadStart = custStart + CUST_GROUP.cols.length;
    merges.push({ s: { r: 0, c: loadStart }, e: { r: 0, c: loadStart + LOAD_GROUP.cols.length - 1 } });

    // SUMUTIL rowSpan
    const sumUtilCol = loadStart + LOAD_GROUP.cols.length;
    merges.push({ s: { r: 0, c: sumUtilCol }, e: { r: 1, c: sumUtilCol } });

    // PEAK_TIME rowSpan
    const peakTimeCol = sumUtilCol + 1;
    merges.push({ s: { r: 0, c: peakTimeCol }, e: { r: 1, c: peakTimeCol } });

    // PEAK_DEMAND rowSpan
    const peakDemandCol = peakTimeCol + 1;
    merges.push({ s: { r: 0, c: peakDemandCol }, e: { r: 1, c: peakDemandCol } });

    // PHASE_UTIL_GROUP colSpan 3
    const phaseStart = peakDemandCol + 1;
    merges.push({ s: { r: 0, c: phaseStart }, e: { r: 0, c: phaseStart + PHASE_UTIL_GROUP.cols.length - 1 } });

    ws['!merges'] = merges;

    // Column widths (rough)
    ws['!cols'] = [
        { wch: 12 }, // 지사
        { wch: 14 }, // 선로명
        { wch: 10 }, // 선로번호
        { wch: 16 }, // 전산화번호
        { wch: 10 }, // 결선방식
        { wch: 10 }, // 가공지중
        { wch: 8 }, { wch: 8 }, { wch: 8 },   // 용량 A/B/C
        { wch: 10 }, { wch: 10 },             // 고객 / AMI 구축
        { wch: 14 }, { wch: 16 },             // 부하
        { wch: 14 },                          // 합산이용률
        { wch: 18 },                          // 피크시간
        { wch: 12 },                          // 피크값
        { wch: 8 }, { wch: 8 }, { wch: 8 },   // 상별 A/B/C
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Detail');

    const datePart = new Date().toISOString().slice(0, 10);
    XLSX.writeFileXLSX(wb, `detail_${datePart}.xlsx`, { bookType: 'xlsx' });
}
