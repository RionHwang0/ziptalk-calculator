/**
 * 부동산 계산기 정적 배포 빌드 스크립트
 * 
 * 이 스크립트는 Vite를 사용하여 정적 배포용 빌드를 생성합니다.
 * 백엔드가 없는 환경에서도 기본 계산 기능이 작동하도록 준비합니다.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('부동산 계산기 - 정적 배포를 위한 빌드 시작...');

// Replit 환경에서 배포를 위한 환경 설정
// config 디렉토리 확인 및 생성
const configDir = path.join(__dirname, '.config');
if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir, { recursive: true });
}

// Replit 정적 배포 설정 파일
const staticDeploymentConfig = {
  "build": {
    "command": "vite build --config vite.static.config.ts",
    "directory": "dist"
  },
  "publicDir": "dist",
  "rewrites": [
    { "source": "/*", "destination": "/index.html" }
  ]
};

// 설정 파일 저장
fs.writeFileSync(
  path.join(configDir, 'replit.static.json'), 
  JSON.stringify(staticDeploymentConfig, null, 2)
);

console.log('정적 배포 설정 파일이 생성되었습니다.');

// dist 디렉토리 생성 및 정리
const distDir = path.join(__dirname, 'dist');
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

try {
  // 정적 빌드 실행
  console.log('Vite 정적 빌드 실행 중...');
  execSync('npx vite build --config vite.static.config.ts', { stdio: 'inherit' });
  
  // 정적 빌드 후 인덱스 파일 복사
  console.log('정적 배포 파일 구성 중...');
  
  // client/static-index.html를 메인 인덱스로 복사
  if (fs.existsSync(path.join(distDir, 'client/static-index.html'))) {
    fs.copyFileSync(
      path.join(distDir, 'client/static-index.html'),
      path.join(distDir, 'index.html')
    );
  }
  
  console.log('부동산 계산기 정적 배포 준비가 완료되었습니다!');
  console.log('이제 Replit Deploy 버튼을 클릭하여 배포를 진행하세요.');
  
} catch (error) {
  console.error('빌드 준비 중 오류 발생:', error);
  process.exit(1);
}