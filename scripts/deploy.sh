#!/bin/bash

# 배포 스크립트 (Ubuntu용)
echo "=== 배포 스크립트 시작 ==="

# 빌드 디렉토리 정리
echo "이전 빌드 정리 중..."
rm -rf dist/

# 프로덕션 빌드
echo "프로덕션 빌드 중..."
npm run build:prod

# 빌드 결과 확인
if [ -d "dist" ]; then
    echo "빌드 성공!"
    echo "빌드 크기: $(du -sh dist | cut -f1)"
    echo "빌드된 파일들:"
    ls -la dist/
else
    echo "빌드 실패!"
    exit 1
fi

echo "=== 배포 준비 완료 ==="
echo "dist/ 폴더의 내용을 웹 서버에 배포하세요."
