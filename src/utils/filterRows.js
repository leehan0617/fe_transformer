export function filterRows(DATA, f) {
    const parseStartTS = () => {
        if (!f.startDate) return undefined;
        if (f.mode === 'month') {
            const ym = String(f.startDate).slice(0, 7);
            const d = new Date(ym + '-01T00:00:00');
            return d.getTime();
        }
        const dstr = String(f.startDate).length === 7 ? String(f.startDate) + '-01' : String(f.startDate);
        return new Date(dstr + 'T00:00:00').getTime();
    };

    const parseEndTS = () => {
        if (!f.endDate) return undefined;
        if (f.mode === 'month') {
            const ym = String(f.endDate).slice(0, 7);
            const [y, m] = ym.split('-').map((x) => Number(x));
            const d = new Date(y, m, 0, 23, 59, 59, 999); // 월말 23:59:59.999
            return d.getTime();
        }
        const dstr = String(f.endDate).length === 7 ? String(f.endDate) + '-01' : String(f.endDate);
        const d = new Date(dstr + 'T23:59:59.999'); // 일자 끝
        return d.getTime();
    };

    const s = parseStartTS();
    const e = parseEndTS();

    const matchBranch = (row) => {
        const opt = f.branch;
        if (!opt || opt === 'all') return true;
        // value가 branch id인 경우, row.branch와 비교
        // 실제 구현에서는 API에서 받은 branch id와 매칭할 수 있도록 수정 필요
        return String(row.branch || '').includes(String(opt));
    };

    const matchEquipment = (row) => {
        const opt = f.equipment;
        if (!opt || opt === 'all') return true;
        // value: 'upper' (가공), 'under' (지중)
        const src = row.ouType ?? row.equipment;
        if (opt === 'upper') return String(src) === '가공';
        if (opt === 'under') return String(src) === '지중';
        return false;
    };

    const matchSumUtil = (row) => {
        const opt = f.sumUtil;
        if (!opt || opt === 'all') return true;
        const v = Number(row.sumUtilPct);
        if (!Number.isFinite(v)) return false;

        // value 형식: '50', '60', ..., '150', '150+'
        if (opt === '150+') return v > 150;
        
        const threshold = parseInt(opt, 10);
        if (!Number.isNaN(threshold)) {
            return v < threshold;
        }
        return true;
    };

    return DATA.filter((row) => {
        const t = new Date(row.date + 'T00:00:00').getTime();
        if (s && t < s) return false;
        if (e && t > e) return false;

        if (!matchBranch(row)) return false;
        if (!matchEquipment(row)) return false;
        if (!matchSumUtil(row)) return false;

        if (f.lineName && !String(row.lineName || '').toLowerCase().includes(String(f.lineName).toLowerCase())) return false;
        if (f.lineNo && !String(row.lineNo || '').includes(String(f.lineNo))) return false;
        if (f.compNo && !String(row.compNo || '').toLowerCase().includes(String(f.compNo).toLowerCase())) return false;

        return true;
    });
}
