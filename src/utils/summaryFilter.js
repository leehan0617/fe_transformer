export function filterSummaryRows(DATA, { mode, date, equipment }) {
    const hasDate = Boolean(date);

    const parseInputDate = (str, mode) => {
        if (!str) return null;
        if (mode === 'month') {
            const ym = String(str).slice(0, 7); // YYYY-MM
            return new Date(ym + '-01T00:00:00');
        }
        const dstr = String(str).length === 7 ? String(str) + '-01' : String(str); // 허용: YYYY-MM → YYYY-MM-01
        return new Date(dstr + 'T00:00:00');
    };

    const target = hasDate ? parseInputDate(date, mode) : null;
    const tYear = target?.getFullYear();
    const tMonth = target?.getMonth();
    const tDay = target?.getDate();

    return DATA.filter((row) => {
        // 설비구분: '전체'는 모든 데이터 허용, 나머지는 row.equipGroup과 일치하는 것만
        if (equipment && equipment !== '전체' && row.equipGroup !== equipment) return false;

        if (!hasDate) return true;
        const d = new Date(row.date + 'T00:00:00');
        if (mode === 'month') return d.getFullYear() === tYear && d.getMonth() === tMonth;
        return d.getFullYear() === tYear && d.getMonth() === tMonth && d.getDate() === tDay;
    });
}