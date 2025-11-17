# React + Vite - 폐쇄망 환경용

이 프로젝트는 폐쇄망 환경에서 Ubuntu와 Windows 두 플랫폼에서 실행 가능하도록 구성되었습니다.

## 📋 요구사항

### Ubuntu 환경
- Node.js 18.x 이상
- npm 9.x 이상
- Python3 (웹 서버용)

### Windows 환경
- Node.js 18.x 이상
- npm 9.x 이상
- Python 3.x (웹 서버용)

## 🚀 빠른 시작

### Ubuntu 환경에서 실행

```bash
# 1. 프로젝트 설정
chmod +x scripts/*.sh
./scripts/setup-ubuntu.sh

# 2. 개발 서버 실행
npm run dev:ubuntu
# 또는
npm run dev

# 3. 프로덕션 빌드 및 서빙
npm run build
./scripts/serve-ubuntu.sh
```

### Windows 환경에서 실행

```cmd
REM 1. 프로젝트 설정
scripts\setup-windows.bat

REM 2. 개발 서버 실행
npm run dev:windows
REM 또는
npm run dev

REM 3. 프로덕션 빌드 및 서빙
npm run build
scripts\serve-windows.bat
```

## 📦 폐쇄망 환경 배포 가이드

### 1. 인터넷 연결 환경에서 준비

```bash
# 의존성 캐시 생성 (package-lock.json 기반)
npm ci --offline

# 프로덕션 빌드
npm run build:prod

# 배포 패키지 생성
tar -czf offline-package.tar.gz dist/ node_modules/ package*.json
```

### 2. 폐쇄망 환경에서 설치

```bash
# Ubuntu
tar -xzf offline-package.tar.gz
chmod +x scripts/*.sh
./scripts/setup-ubuntu.sh

# Windows
REM 압축 해제 후
scripts\setup-windows.bat
```

## 🔧 주요 스크립트

| 스크립트 | 설명 |
|---------|------|
| `npm run dev:ubuntu` | Ubuntu 개발 서버 (0.0.0.0:3000) |
| `npm run dev:windows` | Windows 개발 서버 (localhost:3000) |
| `npm run build` | 프로덕션 빌드 |
| `npm run preview:ubuntu` | Ubuntu 프리뷰 서버 |
| `npm run preview:windows` | Windows 프리뷰 서버 |
| `npm run install:offline` | 오프라인 의존성 설치 |

## 📁 프로젝트 구조

```
├── scripts/           # 환경별 설정 스크립트
│   ├── setup-ubuntu.sh
│   ├── setup-windows.bat
│   ├── deploy.sh
│   ├── deploy.bat
│   ├── serve-ubuntu.sh
│   └── serve-windows.bat
├── src/
│   ├── components/    # React 컴포넌트
│   ├── tabs/         # 탭 컴포넌트
│   └── utils/        # 유틸리티 함수
├── dist/             # 빌드 결과물
└── package.json      # 프로젝트 설정
```

## 🌐 네트워크 설정

### 개발 환경
- Ubuntu: `http://0.0.0.0:3000` (네트워크 접근 가능)
- Windows: `http://localhost:3000`

### 프로덕션 환경
- 간단한 웹 서버: `http://localhost:8080`
- Nginx/Apache 배포 가능

## 🔍 문제 해결

### 포트 충돌 시
```bash
# 다른 포트로 실행
npm run dev -- --port 3001
```

### 의존성 문제 시
```bash
# 캐시 정리 후 재설치
rm -rf node_modules package-lock.json
npm install
```

### 빌드 실패 시
```bash
# 빌드 캐시 정리
rm -rf dist
npm run build
```

## 📝 유지보수 가이드

1. **코드 수정**: `src/` 폴더 내 파일 수정
2. **의존성 추가**: `package.json` 수정 후 `npm install`
3. **빌드**: `npm run build`로 최신 빌드 생성
4. **배포**: `dist/` 폴더를 웹 서버에 업로드

## ⚠️ 주의사항

- 폐쇄망 환경에서는 모든 의존성이 로컬에 있어야 합니다
- `package-lock.json` 파일을 반드시 함께 배포해야 합니다
- Node.js 버전 호환성을 확인하세요
- 빌드된 `dist/` 폴더는 정적 파일이므로 어떤 웹 서버에서든 서빙 가능합니다
