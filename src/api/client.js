import axios from 'axios';

// 단일 API 엔드포인트 설정 (환경변수 VITE_API_ENDPOINT 사용, 없으면 상대경로)
export const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT || '';

export const apiClient = axios.create({
    baseURL: API_ENDPOINT,
    withCredentials: false,
});

// 필요 시 공통 헤더/인터셉터 추가 가능
export default apiClient;

