import React, { useMemo, useState } from 'react';
import DetailFilters from '../components/DetailFilters';
import ResultsTable from '../components/ResultsTable';
import DetailModal from '../components/DetailModal';
import { filterRows } from '../utils/filterRows';

function todayISO() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

export default function DetailTab() {
    // 🔸 변경된 옵션
    const branchOptions = ['전체', '부산본부', '울산본부'];
    const equipmentOptions = ['전체', '가공', '지중'];
    const sumUtilOptions = [
        '전체',
        '50%미만','60%미만','70%미만','80%미만','90%미만',
        '100%미만','110%미만','120%미만','130%미만','140%미만','150%미만',
        '150%초과',
    ];

    const DATA = useMemo(
        () => [
            {
                id: 1,
                date: '2025-09-20',
                branch: '서울',
                equipment: 'A라인',
                lineName: '1호선',
                lineNo: '1001',
                compNo: 'CN-0001',
                connectionType: 'Δ-Y',
                ouType: '가공',
                capA: 50, capB: 75, capC: 100,
                customer: '홍길동',
                amiBuilt: true,
                contractPowerAmi: 80,
                contractPowerNoAmi: 0,
                sumUtil: '>= 90%', // 샘플에서만 사용
                sumUtilPct: 92.4,
                phaseUtilA: 91.2, phaseUtilB: 93.1, phaseUtilC: 92.8,
            },
            {
                id: 2,
                date: '2025-09-21',
                branch: '부산',
                equipment: 'B라인',
                lineName: '2호선',
                lineNo: '2002',
                compNo: 'CN-0002',
                connectionType: 'Y-Y',
                ouType: '지중',
                capA: 75, capB: 75, capC: 150,
                customer: '부산상사',
                amiBuilt: false,
                contractPowerAmi: 0,
                contractPowerNoAmi: 120,
                sumUtil: '>= 80%',
                sumUtilPct: 86.0,
                phaseUtilA: 84.5, phaseUtilB: 86.8, phaseUtilC: 86.7,
            },
            {
                id: 3,
                date: '2025-09-22',
                branch: '대전',
                equipment: 'C라인',
                lineName: '3호선',
                lineNo: '3003',
                compNo: 'CN-0003',
                connectionType: 'Δ-Δ',
                ouType: '가공',
                capA: 100, capB: 100, capC: 100,
                customer: '대전푸드',
                amiBuilt: true,
                contractPowerAmi: 60,
                contractPowerNoAmi: 0,
                sumUtil: 'Any',
                sumUtilPct: 78.3,
                phaseUtilA: 77.9, phaseUtilB: 78.6, phaseUtilC: 78.4,
            },
            {
                id: 4,
                date: '2025-09-23',
                branch: '광주',
                equipment: 'A라인',
                lineName: '1호선',
                lineNo: '1004',
                compNo: 'CN-0004',
                connectionType: 'Y-Δ',
                ouType: '지중',
                capA: 150, capB: 0, capC: 0,
                customer: '광주물산',
                amiBuilt: true,
                contractPowerAmi: 90,
                contractPowerNoAmi: 0,
                sumUtil: '>= 95%',
                sumUtilPct: 95.1,
                phaseUtilA: 94.7, phaseUtilB: 95.5, phaseUtilC: 95.0,
            },
            {
                id: 5,
                date: '2025-09-24',
                branch: '서울',
                equipment: 'B라인',
                lineName: '2호선',
                lineNo: '2005',
                compNo: 'CN-0005',
                connectionType: 'Y-Y',
                ouType: '가공',
                capA: 50, capB: 50, capC: 50,
                customer: '서울전기',
                amiBuilt: false,
                contractPowerAmi: 0,
                contractPowerNoAmi: 70,
                sumUtil: '>= 80%',
                sumUtilPct: 88.9,
                phaseUtilA: 87.3, phaseUtilB: 89.6, phaseUtilC: 89.8,
            },
        ],
        []
    );

    const defaultDate = todayISO();

    const [state, setState] = useState({
        mode: 'day',
        startDate: defaultDate,
        endDate: defaultDate,
        branch: '전체',     // 🔸 기본값을 새 옵션에 맞춤
        equipment: '전체',
        sumUtil: '전체',
        lineName: '',
        lineNo: '',
        compNo: '',
    });

    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);

    const rows = useMemo(() => filterRows(DATA, state), [DATA, state]);

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSubmitted(true);
        await new Promise((r) => setTimeout(r, 300));
        setLoading(false);
    };

    const onReset = () => {
        setState({
            mode: 'day',
            startDate: defaultDate,
            endDate: defaultDate,
            branch: '전체',
            equipment: '전체',
            sumUtil: '전체',
            lineName: '',
            lineNo: '',
            compNo: '',
        });
        setSubmitted(false);
    };

    const openDetail = (row) => setSelectedRow(row);
    const closeDetail = () => setSelectedRow(null);

    return (
        <section className="w-full">
            <DetailFilters
                state={state}
                setState={setState}
                selects={{ branchOptions, equipmentOptions, sumUtilOptions }}
                onSubmit={onSubmit}
                onReset={onReset}
                loading={loading}
            />

            <ResultsTable
                rows={rows}
                submitted={submitted}
                loading={loading}
                onOpenDetail={openDetail}
            />

            <DetailModal open={!!selectedRow} row={selectedRow} onClose={closeDetail} mode={state.mode} />
        </section>
    );
}
