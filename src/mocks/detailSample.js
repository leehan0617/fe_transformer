// 50개의 샘플 데이터 생성
const generateSampleData = () => {
    const departments = [
        { id: 9, name: '부산울산본부직할' },
        { id: 10, name: '서울산지사' },
        { id: 11, name: '북부산지사' },
        { id: 12, name: '영도지사' },
    ];
    
    const lineNames = [
        '창선간', '부산간', '서울간', '강남간', '북부산간', '해운대간',
        '동래간', '서면간', '남포간', '광안간', '송도간', '기장간',
        '정관간', '장안간', '울산간', '양산간', '김해간', '거제간',
    ];
    
    const lineTypes = ['가공', '지중'];
    const connectionTypes = ['43', '44'];
    
    const samples = [];
    let id = 1;
    let transformerId = 1;
    
    for (let i = 0; i < 50; i++) {
        const dept = departments[i % departments.length];
        const lineName = lineNames[i % lineNames.length];
        const lineType = lineTypes[i % 2];
        const connectionType = connectionTypes[i % 2];
        
        const baseVolume = [50, 75, 100, 150, 200][i % 5];
        const volumeA = baseVolume;
        const volumeB = baseVolume;
        const volumeC = i % 7 === 0 ? 0 : baseVolume; // 일부는 C상이 0
        
        const customerCount = 20 + (i * 3) % 150;
        const amiCount = Math.floor(customerCount * (0.4 + (i % 5) * 0.1));
        const amiVoltage = Math.floor(amiCount * (0.8 + (i % 3) * 0.1));
        const notAmiVoltage = Math.floor((customerCount - amiCount) * (0.3 + (i % 4) * 0.1));
        
        const usageRate = 20 + (i * 2) % 160; // 20~180% 범위
        const usageA = usageRate - 2 + (i % 5);
        const usageB = usageRate + (i % 3);
        const usageC = usageRate + 1 + (i % 4);
        
        const lineId = `${dept.id === 9 || dept.id === 11 ? '39' : '11'}R${(i % 20) + 1}`;
        const poleId = `${String(dept.id).padStart(2, '0')}${String((i % 10) + 1).padStart(2, '0')}H${String((i % 100) + 1).padStart(3, '0')}`;
        
        samples.push({
            id: id++,
            department_id: dept.id,
            department_name: dept.name,
            transformer_id: transformerId++,
            line_name: lineName,
            line_id: lineId,
            pole_id: poleId,
            connection_type: connectionType,
            line_type: lineType,
            volume_a: volumeA,
            volume_b: volumeB,
            volume_c: volumeC,
            customer_count: customerCount,
            ami_count: amiCount,
            ami_voltage_sum: amiVoltage,
            not_ami_voltage_sum: notAmiVoltage,
            usage_rate: usageRate,
            usage_a: usageA,
            usage_b: usageB,
            usage_c: usageC,
        });
    }
    
    return samples;
};

const BASE_SAMPLE = generateSampleData();

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

    // 페이징 적용 (0-base request_page, page_size)
    const totalCount = filtered.length;
    const requestPage = Number(params?.request_page ?? 0);
    const pageSize = Number(params?.page_size ?? totalCount);
    const safePage = Number.isFinite(requestPage) && requestPage >= 0 ? requestPage : 0;
    const safeSize = Number.isFinite(pageSize) && pageSize > 0 ? pageSize : totalCount;
    const start = safePage * safeSize;
    const data = filtered.slice(start, start + safeSize);
    
    return { data, count: totalCount };
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

