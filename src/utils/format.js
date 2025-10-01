export function formatKoreanDate(iso) {
    const d = new Date(iso + 'T00:00:00');
    const mm = d.getMonth() + 1;
    const dd = d.getDate();
    return `${mm.toString().padStart(2, '0')}월 ${dd.toString().padStart(2, '0')}일`;
}