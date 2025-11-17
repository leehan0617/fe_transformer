const BASE_SAMPLE = [
    {
        id: 1,
        department_id: 9,
        department_name: '부산울산본부직할',
        transformer_id: 1,
        line_name: '창선간',
        line_id: '39R1',
        pole_id: '0190H301',
        connection_type: '43',
        line_type: '가공',
        volume_a: 75,
        volume_b: 75,
        volume_c: 75,
        customer_count: 50,
        ami_count: 30,
        ami_voltage_sum: 40,
        not_ami_voltage_sum: 11,
        usage_rate: 10,
        usage_a: 2,
        usage_b: 3,
        usage_c: 4,
    },
    {
        id: 2,
        department_id: 9,
        department_name: '부산울산본부직할',
        transformer_id: 2,
        line_name: '부산간',
        line_id: '39R2',
        pole_id: '0190H302',
        connection_type: '44',
        line_type: '지중',
        volume_a: 100,
        volume_b: 100,
        volume_c: 100,
        customer_count: 80,
        ami_count: 50,
        ami_voltage_sum: 60,
        not_ami_voltage_sum: 20,
        usage_rate: 85,
        usage_a: 82,
        usage_b: 86,
        usage_c: 87,
    },
    {
        id: 3,
        department_id: 10,
        department_name: '서울산지사',
        transformer_id: 3,
        line_name: '서울간',
        line_id: '11R1',
        pole_id: '0101H301',
        connection_type: '43',
        line_type: '가공',
        volume_a: 50,
        volume_b: 50,
        volume_c: 50,
        customer_count: 30,
        ami_count: 20,
        ami_voltage_sum: 25,
        not_ami_voltage_sum: 8,
        usage_rate: 92,
        usage_a: 91,
        usage_b: 93,
        usage_c: 92,
    },
    {
        id: 4,
        department_id: 10,
        department_name: '서울산지사',
        transformer_id: 4,
        line_name: '강남간',
        line_id: '11R2',
        pole_id: '0101H302',
        connection_type: '44',
        line_type: '지중',
        volume_a: 150,
        volume_b: 150,
        volume_c: 150,
        customer_count: 120,
        ami_count: 100,
        ami_voltage_sum: 90,
        not_ami_voltage_sum: 30,
        usage_rate: 78,
        usage_a: 77,
        usage_b: 79,
        usage_c: 78,
    },
    {
        id: 5,
        department_id: 11,
        department_name: '북부산지사',
        transformer_id: 5,
        line_name: '북부산간',
        line_id: '39R3',
        pole_id: '0190H303',
        connection_type: '43',
        line_type: '가공',
        volume_a: 75,
        volume_b: 75,
        volume_c: 0,
        customer_count: 45,
        ami_count: 25,
        ami_voltage_sum: 35,
        not_ami_voltage_sum: 12,
        usage_rate: 95,
        usage_a: 94,
        usage_b: 96,
        usage_c: 95,
    },
    {
        id: 6,
        department_id: 11,
        department_name: '북부산지사',
        transformer_id: 6,
        line_name: '해운대간',
        line_id: '39R4',
        pole_id: '0190H304',
        connection_type: '44',
        line_type: '지중',
        volume_a: 100,
        volume_b: 100,
        volume_c: 100,
        customer_count: 70,
        ami_count: 45,
        ami_voltage_sum: 55,
        not_ami_voltage_sum: 18,
        usage_rate: 68,
        usage_a: 67,
        usage_b: 69,
        usage_c: 68,
    },
];

const cloneRows = () =>
    BASE_SAMPLE.map((row) => ({
        ...row,
    }));

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 간단한 /detail 목 응답 생성기
 * - 비동기 응답 지연(200ms)을 줘서 로딩 상태를 확인할 수 있음
 * - params를 받아서 조건별 필터링 구현
 */
export async function getDetailSampleRows({ params } = {}) {
    if (params) {
        console.info('[Mock] /detail params:', params);
    }
    await delay(200);
    
    let filtered = cloneRows();
    
    // 파라미터에 따른 필터링
    if (params) {
        // department_code 필터링
        if (params.department_code && params.department_code !== 'all') {
            const deptId = Number(params.department_code);
            filtered = filtered.filter((row) => row.department_id === deptId);
        }
        
        // line_type 필터링 (upper → 가공, under → 지중)
        if (params.line_type) {
            const lineTypeMap = { 'upper': '가공', 'under': '지중' };
            const lineType = lineTypeMap[params.line_type] || params.line_type;
            filtered = filtered.filter((row) => row.line_type === lineType);
        }
        
        // line_name 필터링
        if (params.line_name) {
            filtered = filtered.filter((row) => 
                row.line_name.toLowerCase().includes(params.line_name.toLowerCase())
            );
        }
        
        // line_id 필터링
        if (params.line_id) {
            filtered = filtered.filter((row) => 
                row.line_id.includes(params.line_id)
            );
        }
        
        // pole_id 필터링
        if (params.pole_id) {
            filtered = filtered.filter((row) => 
                row.pole_id.toLowerCase().includes(params.pole_id.toLowerCase())
            );
        }
        
        // usage_rate 필터링
        if (params.usage_rate) {
            if (params.usage_rate === '150+') {
                // 150% 초과
                filtered = filtered.filter((row) => row.usage_rate > 150);
            } else {
                // 숫자값 미만 (예: '50' → 50% 미만)
                const maxRate = Number(params.usage_rate);
                if (!Number.isNaN(maxRate)) {
                    filtered = filtered.filter((row) => row.usage_rate < maxRate);
                }
            }
        }
    }
    
    return filtered;
}

export const DETAIL_SAMPLE_ROWS = cloneRows();

/**
 * /department 목 응답 생성기
 * - 부서 목록을 반환
 */
export async function getDepartmentSampleRows() {
    await delay(100);
    return [
        { id: 9, name: '부산울산본부직할' },
        { id: 10, name: '서울산지사' },
        { id: 11, name: '북부산지사' },
        { id: 12, name: '영도지사' },
    ];
}

