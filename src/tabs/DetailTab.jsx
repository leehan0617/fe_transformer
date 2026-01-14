import React, { useState } from 'react';
import apiClient from '../api/client';
import DetailFilters from '../components/detail/DetailFilters';
import DetailTable from '../components/detail/DetailTable';
import DetailModal from '../components/detail/DetailModal';

function todayISO() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

export default function DetailTab() {
    // 🔸 변경된 옵션 - label과 value 분리
    const [branchOptions, setBranchOptions] = useState([{ label: '전체', value: 'all' }]);
    const equipmentOptions = [
        { label: '전체', value: 'all' },
        { label: '가공', value: 'upper' },
        { label: '지중', value: 'under' },
    ];
    const sumUtilOptions = [
        { label: '전체', value: 'all' },
        { label: '50%미만', value: '50' },
        { label: '60%미만', value: '60' },
        { label: '70%미만', value: '70' },
        { label: '80%미만', value: '80' },
        { label: '90%미만', value: '90' },
        { label: '100%미만', value: '100' },
        { label: '110%미만', value: '110' },
        { label: '120%미만', value: '120' },
        { label: '130%미만', value: '130' },
        { label: '140%미만', value: '140' },
        { label: '150%미만', value: '150' },
        { label: '150%초과', value: '150+' },
    ];

    const [branchLoading, setBranchLoading] = useState(false);
    const [branchFetched, setBranchFetched] = useState(false);

    const defaultDate = todayISO();

    const [state, setState] = useState({
        mode: 'day',
        startDate: defaultDate,
        endDate: defaultDate,
        branch: 'all',     // 🔸 value 값 사용
        equipment: 'all',
        sumUtil: 'all',
        lineName: '',
        lineNo: '',
        compNo: '',
    });

    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [rows, setRows] = useState([]);
    const [page, setPage] = useState(0);              // 0-base
    const [pageSize, setPageSize] = useState(20);
    const [totalCount, setTotalCount] = useState(0);
    const [lastParams, setLastParams] = useState(null);

    // 지사 목록 API 호출 함수
    const fetchBranches = async () => {
        // 이미 가져온 경우 중복 호출 방지
        if (branchFetched || branchLoading) return;

        setBranchLoading(true);
        try {
            const branches = (await apiClient.get('/department')).data;
            const branchList = Array.isArray(branches) ? branches : [];
            // API 응답을 옵션 배열로 변환: [{label: '전체', value: 'all'}, {label: '북부산지사', value: ...}, ...]
            const branchOptionsList = [
                { label: '전체', value: 'all' },
                ...branchList.map(branch => ({ label: branch.name, value: String(branch.id) }))
            ];
            setBranchOptions(branchOptionsList);
            setBranchFetched(true);
        } catch (err) {
            console.error('Failed to fetch departments', err);
            // 에러 발생 시 기본값 유지
        } finally {
            setBranchLoading(false);
        }
    };

    // 지사 select 박스 클릭/포커스 시 API 호출
    const handleBranchFocus = () => {
        fetchBranches();
    };

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

    // API 파라미터 구성
    function computeParams({ mode, startDate, endDate, branch, equipment, sumUtil, lineName, lineNo, compNo }) {
        const params = {};

        // 날짜 파라미터
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

        // 지사 (branch) - 'all'이 아닐 경우에만 department_code로 전달
        if (branch && branch !== 'all') {
            params.department_code = branch;
        }

        // 설비구분 (equipment) - 'all'이 아닐 경우에만 line_type으로 전달 (upper/under 그대로)
        if (equipment && equipment !== 'all') {
            params.line_type = equipment; // 'upper' 또는 'under' 그대로 전달
        }

        // 합산이용률 (sumUtil) - 'all'이 아닐 경우에만 usage_rate로 전달
        if (sumUtil && sumUtil !== 'all') {
            // '150+'일 경우 '+'까지 같이 붙여서 전달
            params.usage_rate = sumUtil; // '50', '60', ..., '150', '150+' 그대로 전달
        }

        // 선로명, 선로번호, 변대주 전산화번호 - 값이 있을 때만 전달
        if (lineName && lineName.trim()) {
            params.line_name = lineName.trim();
        }
        if (lineNo && lineNo.trim()) {
            params.line_id = lineNo.trim();
        }
        if (compNo && compNo.trim()) {
            params.pole_id = compNo.trim();
        }

        return params;
    }

    // 상세 데이터 조회 API 호출
    const fetchDetail = async ({ params, page: pageArg = page, pageSize: sizeArg = pageSize, resetPage = false } = {}) => {
        const finalParams = params || lastParams;
        if (!finalParams) return;
        const requestPage = resetPage ? 0 : pageArg;
        setLoading(true);
        try {
            const requestParams = { ...finalParams, request_page: requestPage, page_size: sizeArg };
            const raw = (await apiClient.get('/detail', { params: requestParams })).data;

            const apiRows = Array.isArray(raw?.data) ? raw.data : [];
            const total = Number(raw?.count) || 0;

            // API 응답을 테이블 형식에 맞게 매핑
            const mapped = apiRows.map((r) => ({
                id: r.id, // 모달에서 사용
                transformerId: r.transformer_id,
                branch: r.department_name || '',
                lineName: r.line_name || '',
                lineNo: r.line_id || '',
                compNo: r.pole_id || '',
                connectionType: r.connection_type || '',
                ouType: r.line_type || '',
                capA: Number(r.volume_a) || 0,
                capB: Number(r.volume_b) || 0,
                capC: Number(r.volume_c) || 0,
                customer: Number(r.customer_count) || 0,
                amiBuilt: Number(r.ami_count) || 0,
                contractPowerAmi: Number(r.ami_voltage_sum) || 0,
                contractPowerNoAmi: Number(r.not_ami_voltage_sum) || 0,
                sumUtilPct: Number(r.usage_rate) || 0,
                phaseUtilA: Number(r.usage_a) || 0,
                phaseUtilB: Number(r.usage_b) || 0,
                phaseUtilC: Number(r.usage_c) || 0,
            }));
            
            setRows(mapped);
            setTotalCount(total);
            setPage(requestPage);
            setPageSize(sizeArg);
            setLastParams(finalParams);
        } catch (err) {
            console.error('Failed to fetch detail', err);
            setRows([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setSubmitted(true);
        const params = computeParams(state);
        setLastParams(params);
        setPage(0);
        await fetchDetail({ params, page: 0, resetPage: true });
    };

    const onReset = () => {
        setState({
            mode: 'day',
            startDate: defaultDate,
            endDate: defaultDate,
            branch: 'all',
            equipment: 'all',
            sumUtil: 'all',
            lineName: '',
            lineNo: '',
            compNo: '',
        });
        setSubmitted(false);
        setRows([]);
        setPage(0);
        setTotalCount(0);
        setLastParams(null);
    };

    const openDetail = (row) => {
        if (row) {
            setSelectedRow(row);
        }
    };
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
                onBranchFocus={handleBranchFocus}
            />

            <DetailTable
                rows={rows}
                submitted={submitted}
                loading={loading}
                page={page}
                pageSize={pageSize}
                totalCount={totalCount}
                onPageChange={(nextPage) => fetchDetail({ page: nextPage })}
                onPageSizeChange={(nextSize) => fetchDetail({ page: 0, pageSize: nextSize, resetPage: true })}
                onOpenDetail={openDetail}
            />

            <DetailModal 
                open={!!selectedRow} 
                row={selectedRow} 
                onClose={closeDetail} 
                mode={state.mode}
                startDate={state.startDate}
                endDate={state.endDate}
            />
        </section>
    );
}
