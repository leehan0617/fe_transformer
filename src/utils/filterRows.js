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
        if (!opt || opt === 'Any' || opt === '전체') return true;
        // '부산본부' → '부산'으로 정규화하여 포함 매칭
        const normOpt = String(opt).replace(/본부$/, '').trim();
        return String(row.branch || '').includes(normOpt);
    };

    const matchEquipment = (row) => {
        const opt = f.equipment;
        if (!opt || opt === 'Any' || opt === '전체') return true;
        // 새 옵션은 '가공/지중' → row.ouType 기준으로 비교 (없으면 row.equipment로 폴백)
        const src = row.ouType ?? row.equipment;
        return String(src) === String(opt);
    };

    const matchSumUtil = (row) => {
        const opt = f.sumUtil;
        if (!opt || opt === 'Any' || opt === '전체') return true;
        const v = Number(row.sumUtilPct);
        if (!Number.isFinite(v)) return false;

        if (opt.endsWith('미만')) {
            const n = parseInt(opt, 10); // '60%미만' → 60
            return v < n;
        }
        if (opt === '150%초과') return v > 150;

        // 예전 형식('>= 80%' 등)도 임시 허용
        if (opt.startsWith('>=')) {
            const n = parseInt(opt.replace('>=', ''), 10);
            return v >= n;
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
