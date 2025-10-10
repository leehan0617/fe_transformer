import React from 'react';

/**
 * DetailFilters (Vertical-ish grid with fixed widths):
 *  md: 12-column grid → 각 행을 2 / 3 / 3 / (여유 4) 로 배치
 *  - 같은 사이즈 그룹
 *    • 조회구분 / 지사 / 선로명  → col-span-2
 *    • 조회일자(시작/종료) / 설비구분 / 선로번호 → col-span-3
 *    • 합산이용률 / 변대주 전산화번호 → col-span-3
 *  - 마지막 열(남는 4칸)은 우측 여유/조회 버튼 영역으로 사용
 *
 *  Tweaks:
 *    - 각 입력 간격 확대: 행 gap → md:gap-6, 라벨 하단 여백 mb-2, 섹션 간 space-y-6
 *    - 버튼 영역을 항상 우측 끝 정렬 (justify-end)
 */
export default function DetailFilters({ state, setState, selects, onSubmit, onReset, loading }) {
    const { branchOptions, equipmentOptions, sumUtilOptions } = selects;
    const set = (k) => (e) => setState((prev) => ({ ...prev, [k]: e.target ? e.target.value : e }));

    const startDisplay = state.mode === 'month' ? (state.startDate ? String(state.startDate).slice(0,7) : '') : (state.startDate || '');
    const endDisplay   = state.mode === 'month' ? (state.endDate ? String(state.endDate).slice(0,7) : '')   : (state.endDate || '');

    return (
        <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6">
            <div className="mb-3 text-sm font-semibold text-gray-700">검색조건</div>

            <div className="w-full space-y-6">
                {/* Row 1: 조회구분(2) / 시작일(3) / 종료일(3) / (4) 여유 */}
                <div className="grid grid-cols-12 gap-5 md:gap-6 items-end">
                    <div className="col-span-12 md:col-span-2">
                        <span className="text-sm font-medium mb-2 block">조회구분</span>
                        <div className="flex gap-6 h-10 items-center mt-1">
                            <label className="inline-flex items-center gap-2">
                                <input type="radio" name="mode" value="month" checked={state.mode === 'month'} onChange={set('mode')} />
                                <span>월</span>
                            </label>
                            <label className="inline-flex items-center gap-2">
                                <input type="radio" name="mode" value="day" checked={state.mode === 'day'} onChange={set('mode')} />
                                <span>일</span>
                            </label>
                        </div>
                    </div>

                    <div className="col-span-12 md:col-span-3">
                        <label className="text-sm font-medium mb-2 block">{state.mode === 'month' ? '시작월' : '시작일'}</label>
                        <input type={state.mode === 'month' ? 'month' : 'date'} value={startDisplay} onChange={set('startDate')} className="h-10 w-full rounded-lg border border-gray-300 px-3 focus:outline-none focus:ring-2 focus:ring-sky-400" />
                    </div>

                    <div className="col-span-12 md:col-span-3">
                        <label className="text-sm font-medium mb-2 block">{state.mode === 'month' ? '종료월' : '종료일'}</label>
                        <input type={state.mode === 'month' ? 'month' : 'date'} value={endDisplay} onChange={set('endDate')} className="h-10 w-full rounded-lg border border-gray-300 px-3 focus:outline-none focus:ring-2 focus:ring-sky-400" />
                    </div>

                    {/* 여유/placeholder 공간 */}
                    <div className="hidden md:block md:col-span-4" />
                </div>

                {/* Row 2: 지사(2) / 설비구분(3) / 합산이용률(3) / (4) 여유 */}
                <div className="grid grid-cols-12 gap-5 md:gap-6 items-end">
                    <div className="col-span-12 md:col-span-2">
                        <label className="text-sm font-medium mb-2 block">지사</label>
                        <select value={state.branch} onChange={set('branch')} className="h-10 w-full rounded-lg border border-gray-300 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400">
                            {branchOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>

                    <div className="col-span-12 md:col-span-3">
                        <label className="text-sm font-medium mb-2 block">설비구분</label>
                        <select value={state.equipment} onChange={set('equipment')} className="h-10 w-full rounded-lg border border-gray-300 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400">
                            {equipmentOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>

                    <div className="col-span-12 md:col-span-3">
                        <label className="text-sm font-medium mb-2 block">합산이용률</label>
                        <select value={state.sumUtil} onChange={set('sumUtil')} className="h-10 w-full rounded-lg border border-gray-300 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400">
                            {sumUtilOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                    </div>

                    <div className="hidden md:block md:col-span-4" />
                </div>

                {/* Row 3: 선로명(2) / 선로번호(3) / 변대주 전산화번호(3) / 조회버튼(4) */}
                <div className="grid grid-cols-12 gap-5 md:gap-6 items-end">
                    <div className="col-span-12 md:col-span-2">
                        <label className="text-sm font-medium mb-2 block">선로명</label>
                        <input type="text" value={state.lineName} onChange={set('lineName')} className="h-10 w-full rounded-lg border border-gray-300 px-3 focus:outline-none focus:ring-2 focus:ring-sky-400" placeholder="예: 1호선" />
                    </div>

                    <div className="col-span-12 md:col-span-3">
                        <label className="text-sm font-medium mb-2 block">선로번호</label>
                        <input type="text" value={state.lineNo} onChange={set('lineNo')} className="h-10 w-full rounded-lg border border-gray-300 px-3 focus:outline-none focus:ring-2 focus:ring-sky-400" placeholder="예: 1001" />
                    </div>

                    <div className="col-span-12 md:col-span-3">
                        <label className="text-sm font-medium mb-2 block">변대주 전산화번호</label>
                        <input type="text" value={state.compNo} onChange={set('compNo')} className="h-10 w-full rounded-lg border border-gray-300 px-3 focus:outline-none focus:ring-2 focus:ring-sky-400" placeholder="예: CN-0001" />
                    </div>

                    <div className="col-span-12 md:col-span-4 flex justify-end">
                        <div className="flex gap-3">
                            <button type="button" onClick={onReset} className="h-10 px-4 rounded-lg border border-gray-300 bg-white hover:bg-gray-50">초기화</button>
                            <button type="submit" className="h-10 px-6 rounded-lg bg-sky-600 text-white hover:bg-sky-700 shadow-sm" aria-busy={loading}>{loading ? '조회 중...' : '조회'}</button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}