#!/bin/bash

# Ubuntu 환경 설정 스크립트
echo "=== Ubuntu 환경 설정 시작 ==="

# Node.js 버전 확인
echo "Node.js 버전: $(node --version)"
echo "npm 버전: $(npm --version)"

# 의존성 설치 (오프라인 모드)
echo "의존성 설치 중..."
npm ci --offline --no-audit --no-fund

# 빌드 실행
echo "프로덕션 빌드 중..."
npm run build

echo "=== Ubuntu 환경 설정 완료 ==="
echo "개발 서버 실행: npm run dev:ubuntu"
echo "프리뷰 서버 실행: npm run preview:ubuntu"
