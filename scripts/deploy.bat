@echo off
REM 배포 스크립트 (Windows용)

echo === 배포 스크립트 시작 ===

REM 빌드 디렉토리 정리
echo 이전 빌드 정리 중...
if exist dist rmdir /s /q dist

REM 프로덕션 빌드
echo 프로덕션 빌드 중...
npm run build:prod

REM 빌드 결과 확인
if exist dist (
    echo 빌드 성공!
    echo 빌드된 파일들:
    dir dist
) else (
    echo 빌드 실패!
    exit /b 1
)

echo === 배포 준비 완료 ===
echo dist\ 폴더의 내용을 웹 서버에 배포하세요.
pause
