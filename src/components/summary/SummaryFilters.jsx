import React from 'react';

export default function SummaryFilters({ state, setState, selects, onSubmit, onReset, loading }) {
    const { equipmentOptions } = selects;
    const set = (k) => (e) => setState((prev) => ({ ...prev, [k]: e.target ? e.target.value : e }));

    // 날짜 입력 value를 모드에 맞춰 표시 (month 모드면 YYYY-MM, day 모드면 YYYY-MM-DD)
    const dateDisplayValue = state.mode === 'month'
        ? (state.date ? String(state.date).slice(0, 7) : '')
        : (state.date || '');

    return (
        <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6">
            {/* Heading */}
            <div className="mb-3 text-sm font-semibold text-gray-700">검색조건</div>

            {/* Single row, aligned horizontally (responsive) */}
            <div className="grid grid-cols-12 gap-3 items-end">
                {/* 조회구분 */}
                <div className="col-span-12 md:col-span-3">
                    <label className="text-sm font-medium mb-1 block">조회구분</label>
                    <div className="h-10 flex items-center gap-4">
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

                {/* 조회일자 */}
                <div className="col-span-12 md:col-span-3">
                    <label className="text-sm font-medium mb-1">{state.mode === 'month' ? '조회월' : '조회일자'}</label>
                    <input
                        type={state.mode === 'month' ? 'month' : 'date'}
                        value={dateDisplayValue}
                        onChange={set('date')}
                        className="h-10 w-full rounded-lg border border-gray-300 px-3 focus:outline-none focus:ring-2 focus:ring-sky-400"
                    />
                </div>

                {/* 설비구분 */}
                <div className="col-span-12 md:col-span-4">
                    <label className="text-sm font-medium mb-1">설비구분</label>
                    <select
                        value={state.equipment}
                        onChange={set('equipment')}
                        className="h-10 w-full rounded-lg border border-gray-300 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                    >
                        {equipmentOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                {/* Actions */}
                <div className="col-span-12 md:col-span-2 flex items-center justify-end gap-2">
                    <button
                        type="button"
                        onClick={onReset}
                        className="h-10 px-4 rounded-lg border border-gray-300 bg-white hover:bg-gray-50"
                    >
                        초기화
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="h-10 px-4 rounded-lg bg-sky-600 text-white hover:bg-sky-700 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                        aria-busy={loading}
                    >
                        {loading && (
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        {loading ? '조회 중...' : '조회'}
                    </button>
                </div>
            </div>
        </form>
    );
}