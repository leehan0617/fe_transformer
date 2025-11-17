@echo off
REM Windows 환경 설정 스크립트

echo === Windows 환경 설정 시작 ===

REM Node.js 버전 확인
node --version
npm --version

REM 의존성 설치 (오프라인 모드)
echo 의존성 설치 중...
npm ci --offline --no-audit --no-fund

REM 빌드 실행
echo 프로덕션 빌드 중...
npm run build

echo === Windows 환경 설정 완료 ===
echo 개발 서버 실행: npm run dev:windows
echo 프리뷰 서버 실행: npm run preview:windows
pause
