import React from 'react';

/**
 * SummaryTable (지사 PK):
 * - 두번째 탭과 동일한 사이즈: text-sm, px-3 py-2, overflow-x-auto (스케일 축소 제거)
 * - 왼쪽 3컬럼 헤더를 간결화: 지사 / 변압기수 / 평균(%)
 * - 헤더 = [지사, 변압기수, 평균(%)] + 그룹헤더 "변압기 최대 이용률 분포" (colspan 12)
 * - 하위 12컬럼 = 50%미만, 60%미만, 70%미만, 80%미만, 90%미만, 100%미만, 110%미만, 120%미만, 130%미만, 140%미만, 150%미만, 150%이상
 * - 상단 우측: 기간/건수 + "엑셀(.xlsx) 다운로드" 버튼 (SheetJS xlsx, 병합 헤더 포함)
 */
/** 50%미만 ~ 150%이상 분포 컬럼 전체 클릭 가능 (지사/변압기수/평균만 비클릭) */
const DIST_COLS = [
    { key: 'b50', label: '50%미만', align: 'right' },
    { key: 'b60', label: '60%미만', align: 'right' },
    { key: 'b70', label: '70%미만', align: 'right' },
    { key: 'b80', label: '80%미만', align: 'right' },
    { key: 'b90', label: '90%미만', align: 'right' },
    { key: 'b100', label: '100%미만', align: 'right' },
    { key: 'b110', label: '110%미만', align: 'right' },
    { key: 'b120', label: '120%미만', align: 'right' },
    { key: 'b130', label: '130%미만', align: 'right' },
    { key: 'b140', label: '140%미만', align: 'right' },
    { key: 'b150', label: '150%미만', align: 'right' },
    { key: 'b150p', label: '150%이상', align: 'right' },
];

export default function SummaryTable({ rows, submitted, loading, periodLabel, onOpenDetailModal }) {
    const LEFT_COLS = [
        { key: 'branch', label: '지사', thClass: 'min-w-[6rem]' },
        { key: 'transformerCount', label: '변압기수', align: 'right', thClass: 'min-w-[5.5rem]' },
        { key: 'avgUtil', label: '평균(%)', align: 'right', thClass: 'min-w-[6rem]' },
    ];

    const totals = computeTotals(rows, LEFT_COLS, DIST_COLS);
    const onDownloadXLSX = () => exportXLSX(rows, totals, LEFT_COLS, DIST_COLS, periodLabel);
    const canDownload = submitted && !loading && rows.length > 0;

    const header = (
        <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">이용률 통계</h2>
            <div className="flex items-center gap-2">
                {periodLabel ? (
                    <span className="px-2 py-0.5 rounded bg-gray-100 border text-gray-700 text-sm">{periodLabel}</span>
                ) : null}
                {submitted && !loading ? (
                    <span className="text-sm text-gray-500">{rows.length.toLocaleString()}건</span>
                ) : null}
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
    );

    return (
        <section className="mt-6">
            {header}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm p-3">
                <div className="overflow-x-auto">
                    <table className="w-full table-auto text-sm whitespace-nowrap">
                        <thead className="bg-gray-50 text-gray-600">
                        {/* Row 1: group header */}
                        <tr>
                            {LEFT_COLS.map((c) => (
                                <th
                                    key={`top-${c.key}`}
                                    rowSpan={2}
                                    className={`px-3 py-2 text-left font-medium border border-gray-300 ${c.thClass ?? ''} ${
                                        c.align === 'right' ? 'text-right' : ''
                                    }`}
                                >
                                    {c.label}
                                </th>
                            ))}
                            <th colSpan={DIST_COLS.length} className="px-3 py-2 text-center font-semibold border border-gray-300">
                                변압기 최대 이용률 분포
                            </th>
                        </tr>

                        {/* Row 2: distribution detail headers */}
                        <tr>
                            {DIST_COLS.map((c) => (
                                <th
                                    key={`sub-${c.key}`}
                                    className={`px-3 py-2 text-left font-medium border border-gray-300 ${
                                        c.align === 'right' ? 'text-right' : ''
                                    }`}
                                >
                                    {c.label}
                                </th>
                            ))}
                        </tr>
                        </thead>

                        <tbody>
                        {!submitted ? (
                            <tr>
                                <td colSpan={LEFT_COLS.length + DIST_COLS.length} className="p-6 text-center text-gray-500 border border-gray-300">
                                    위의 조건을 선택한 후 <span className="font-medium">조회</span>를 눌러 주세요.
                                </td>
                            </tr>
                        ) : loading ? (
                            <tr>
                                <td colSpan={LEFT_COLS.length + DIST_COLS.length} className="p-6 text-center border border-gray-300">
                                    <div className="flex flex-col items-center gap-3">
                                        <svg className="animate-spin h-8 w-8 text-sky-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span className="text-gray-600">데이터를 불러오는 중입니다...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : rows.length === 0 ? (
                            <tr>
                                <td colSpan={LEFT_COLS.length + DIST_COLS.length} className="p-6 text-center text-gray-500 border border-gray-300">
                                    조건에 맞는 결과가 없습니다.
                                </td>
                            </tr>
                        ) : (
                            rows.map((r) => (
                                <tr key={r.branch} className="odd:bg-white even:bg-gray-50">
                                    {LEFT_COLS.map((c) => (
                                        <td
                                            key={`cell-left-${c.key}`}
                                            className={`px-3 py-2 align-middle border border-gray-300 ${
                                                c.align === 'right' ? 'text-right tabular-nums' : ''
                                            }`}
                                        >
                                            {formatCell(c.key, r)}
                                        </td>
                                    ))}
                                    {DIST_COLS.map((c) => {
                                        const isClickable = onOpenDetailModal;
                                        const value = formatCell(c.key, r);
                                        const numValue = Number(r[c.key]) || 0;
                                        return (
                                            <td
                                                key={`cell-dist-${c.key}`}
                                                className={`px-3 py-2 align-middle border border-gray-300 ${
                                                    c.align === 'right' ? 'text-right tabular-nums' : ''
                                                } ${isClickable && numValue > 0 ? 'cursor-pointer hover:bg-sky-50 hover:text-sky-700' : ''}`}
                                                onClick={isClickable && numValue > 0 ? () => onOpenDetailModal({ branch: r.branch, distKey: c.key }) : undefined}
                                                role={isClickable && numValue > 0 ? 'button' : undefined}
                                                tabIndex={isClickable && numValue > 0 ? 0 : undefined}
                                            >
                                                {value}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))
                        )}

                        {/* Totals row */}
                        {submitted && !loading && rows.length > 0 && (
                            <tr className="bg-sky-50 text-sky-900 font-semibold border-t border-sky-200">
                                <td className="px-3 py-2 border border-gray-300">전체</td>
                                <td className="px-3 py-2 text-right tabular-nums border border-gray-300">{totals.transformerCount.toLocaleString()}</td>
                                <td className="px-3 py-2 text-right tabular-nums border border-gray-300">{totals.avgUtil.toFixed(2)}</td>
                                {DIST_COLS.map((c) => (
                                    <td key={`tot-${c.key}`} className="px-3 py-2 text-right tabular-nums border border-gray-300">
                                        {totals[c.key].toLocaleString()}
                                    </td>
                                ))}
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    );
}

function formatCell(key, r) {
    if (key === 'avgUtil') return (Number(r.avgUtil) || 0).toFixed(2);
    if (key === 'transformerCount') return (Number(r.transformerCount) || 0).toLocaleString();
    return r[key] ?? 0;
}

function computeTotals(rows, LEFT_COLS, DIST_COLS) {
    const n = rows.length || 1;
    const sum = (arr, k) => arr.reduce((acc, x) => acc + (Number(x[k]) || 0), 0);
    const totals = {
        transformerCount: sum(rows, 'transformerCount'),
        avgUtil: rows.reduce((acc, x) => acc + (Number(x.avgUtil) || 0), 0) / n,
    };
    for (const c of DIST_COLS) totals[c.key] = sum(rows, c.key);
    return totals;
}

// ---- XLSX export (dynamic import for small initial bundle)
async function exportXLSX(rows, totals, LEFT_COLS, DIST_COLS, periodLabel) {
    const XLSX = await import('xlsx');
    const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

    const headerTop = [
        LEFT_COLS[0].label,
        LEFT_COLS[1].label,
        LEFT_COLS[2].label,
        '변압기 최대 이용률 분포',
        ...Array(Math.max(DIST_COLS.length - 1, 0)).fill(''),
    ];
    const headerSub = ['', '', '', ...DIST_COLS.map((c) => c.label)];

    const body = rows.map((r) => [
        r.branch,
        Number(r.transformerCount) || 0,
        round2(r.avgUtil),
        ...DIST_COLS.map((c) => Number(r[c.key]) || 0),
    ]);

    const totalRow = [
        '전체',
        Number(totals.transformerCount) || 0,
        round2(totals.avgUtil),
        ...DIST_COLS.map((c) => Number(totals[c.key]) || 0),
    ];

    const aoa = [headerTop, headerSub, ...body, totalRow];
    const ws = XLSX.utils.aoa_to_sheet(aoa);

    ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } },
        { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } },
        { s: { r: 0, c: 2 }, e: { r: 1, c: 2 } },
        { s: { r: 0, c: 3 }, e: { r: 0, c: 3 + DIST_COLS.length - 1 } },
    ];

    ws['!cols'] = [
        { wch: 12 }, // 지사
        { wch: 8 },  // 변압기수
        { wch: 10 }, // 평균(%)
        ...DIST_COLS.map(() => ({ wch: 10 })),
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Summary');

    const datePart = new Date().toISOString().slice(0, 10);
    const suffix = periodLabel ? `_${periodLabel.replace(/\s|\(|\)|\//g, '')}` : '';
    XLSX.writeFileXLSX(wb, `summary${suffix}_${datePart}.xlsx`, { bookType: 'xlsx' });
}
