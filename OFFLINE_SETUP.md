# 폐쇄망 환경 의존성 설치 가이드

## 📦 오프라인 패키지 준비 (인터넷 연결 환경)

### 1. 의존성 캐시 생성

```bash
# 인터넷 연결된 환경에서 실행
npm install

# npm 캐시 확인
npm cache verify

# 캐시 위치 확인 (Linux/macOS)
npm config get cache

# 캐시 위치 확인 (Windows)
npm config get cache
```

### 2. 완전한 오프라인 패키지 생성

```bash
# 1. 의존성 설치
npm ci

# 2. 프로덕션 빌드
npm run build:prod

# 3. npm 캐시 백업 (선택사항)
# Linux/macOS
tar -czf npm-cache-backup.tar.gz ~/.npm

# Windows
# PowerShell에서 실행
Compress-Archive -Path "$env:APPDATA\npm-cache" -DestinationPath "npm-cache-backup.zip"
```

### 3. 배포 패키지 생성

```bash
# 모든 필요한 파일 포함 패키지
tar -czf offline-react-app.tar.gz \
  --exclude=node_modules/.cache \
  --exclude=dist/.vite \
  dist/ \
  node_modules/ \
  package*.json \
  .npmrc \
  scripts/ \
  src/ \
  public/ \
  *.config.js \
  README.md \
  OFFLINE_SETUP.md

echo "패키지 크기: $(du -sh offline-react-app.tar.gz | cut -f1)"
```

## 🚀 폐쇄망 환경 설치

프로젝트 루트의 **`.npmrc`** 에 `offline=true` 가 설정되어 있어, 폐쇄망에서 **`npm ci`** 만 실행해도 레지스트리 접속 없이 `package-lock.json`과 로컬 캐시만 사용합니다. (레지스트리 서버 조회로 인한 에러 방지)

### Ubuntu/Linux 환경

```bash
# 1. 패키지 압축 해제
tar -xzf offline-react-app.tar.gz

# 2. 스크립트 실행 권한 부여
chmod +x scripts/*.sh

# 3. Node.js 버전 확인
node --version  # 18.x 이상 필요
npm --version   # 9.x 이상 필요

# 4. 오프라인 설치 실행
./scripts/setup-ubuntu.sh

# 5. 개발 서버 실행
npm run dev:ubuntu
# 또는 프로덕션 서버
./scripts/serve-ubuntu.sh
```

### Windows 환경

```cmd
REM 1. 패키지 압축 해제 (7-Zip 또는 WinRAR 사용)
REM offline-react-app.tar.gz 파일을 압축 해제

REM 2. Node.js 버전 확인
node --version
npm --version

REM 3. 오프라인 설치 실행
scripts\setup-windows.bat

REM 4. 개발 서버 실행
npm run dev:windows
REM 또는 프로덕션 서버
scripts\serve-windows.bat
```

## 🔧 npm 캐시 복원 (선택사항)

### Linux/macOS
```bash
# npm 캐시 복원
tar -xzf npm-cache-backup.tar.gz -C ~/

# 캐시 검증
npm cache verify
```

### Windows
```powershell
# npm 캐시 복원
Expand-Archive -Path "npm-cache-backup.zip" -DestinationPath "$env:APPDATA\npm-cache"

# 캐시 검증
npm cache verify
```

## 🐛 문제 해결

### 의존성 설치 실패 시

```bash
# 1. 캐시 정리
npm cache clean --force

# 2. node_modules 삭제 후 재시도
rm -rf node_modules
npm ci --offline

# 3. package-lock.json 재생성 (인터넷 환경에서만)
npm install
```

### 빌드 실패 시

```bash
# 1. 빌드 캐시 정리
rm -rf dist

# 2. Vite 캐시 정리
rm -rf node_modules/.vite

# 3. 재빌드
npm run build
```

### 포트 충돌 시

```bash
# 다른 포트로 실행
npm run dev -- --port 3001
npm run preview -- --port 4174
```

## 📋 체크리스트

### 배포 전 확인사항
- [ ] `package-lock.json` 파일 포함
- [ ] `.npmrc` 파일 포함 (폐쇄망에서 `npm ci` 시 레지스트리 미조회)
- [ ] `node_modules/` 폴더 포함
- [ ] `dist/` 폴더 포함 (빌드된 결과물)
- [ ] `scripts/` 폴더 포함
- [ ] 모든 설정 파일 포함 (vite.config.js, tailwind.config.js 등)

### 설치 후 확인사항
- [ ] Node.js 버전 호환성 (18.x 이상)
- [ ] npm 버전 호환성 (9.x 이상)
- [ ] Python 설치 (웹 서버용)
- [ ] 필요한 포트 사용 가능 (3000, 4173, 8080)

## 🔄 업데이트 가이드

### 코드 수정 시
1. `src/` 폴더 내 파일 수정
2. `npm run build` 실행
3. `dist/` 폴더를 웹 서버에 배포

### 의존성 추가 시 (인터넷 환경에서만)
1. `package.json` 수정
2. `npm install` 실행
3. 새로운 오프라인 패키지 생성
4. 폐쇄망 환경에 재배포

## 📞 지원

문제가 발생하면 다음을 확인하세요:
1. Node.js 및 npm 버전
2. 포트 사용 상태
3. 파일 권한 (Linux/macOS)
4. 방화벽 설정
5. 네트워크 접근 권한
