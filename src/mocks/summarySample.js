const BASE_SAMPLE = [
    {
        department: '부산본부',
        transformer_count: 10,
        transformer_avg: 82.4,
        data: [1, 0, 0, 2, 1, 3, 1, 1, 0, 0, 0, 1],
    },
    {
        department: '울산본부',
        transformer_count: 8,
        transformer_avg: 76.2,
        data: [0, 1, 1, 1, 1, 2, 1, 0, 0, 0, 0, 1],
    },
    {
        department: '창원본부',
        transformer_count: 12,
        transformer_avg: 88.6,
        data: [0, 0, 1, 1, 2, 1, 2, 2, 1, 1, 0, 1],
    },
];

const cloneRows = () =>
    BASE_SAMPLE.map((row) => ({
        ...row,
        data: [...row.data],
    }));

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 간단한 /api/summary 목 응답 생성기
 * - 비동기 응답 지연(200ms)을 줘서 로딩 상태를 확인할 수 있음
 * - params를 받아서 향후 조건별 분기 구현도 가능 (현재는 샘플 그대로 반환)
 */
export async function getSummarySampleRows({ params } = {}) {
    if (params) {
        console.info('[Mock] /api/summary params:', params);
    }
    await delay(200);
    return cloneRows();
}

export const SUMMARY_SAMPLE_ROWS = cloneRows();

