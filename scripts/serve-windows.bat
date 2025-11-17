@echo off
REM Windows용 간단한 웹 서버 스크립트

echo === Windows 웹 서버 시작 ===

REM 빌드 확인
if not exist dist (
    echo 빌드가 필요합니다. 빌드 중...
    npm run build
)

REM Python 간단한 HTTP 서버 실행
echo 웹 서버 시작 중... (포트 8080)
echo 브라우저에서 http://localhost:8080 으로 접속하세요.
echo 종료하려면 Ctrl+C를 누르세요.

cd dist
python -m http.server 8080
