import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 빌드 전 public 디렉토리 확인 및 생성
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// client/index.html을 public/index.html로 복사하는 함수
const copyIndexHtml = () => {
  try {
    const sourceIndexPath = path.join(__dirname, 'client', 'index.html');
    const targetIndexPath = path.join(publicDir, 'index.html');
    
    // 파일 복사
    fs.copyFileSync(sourceIndexPath, targetIndexPath);
    console.log('index.html 파일이 성공적으로 복사되었습니다.');
    
    return true;
  } catch (error) {
    console.error('index.html 파일 복사 중 오류가 발생했습니다:', error);
    return false;
  }
};

// 정적 파일 배포를 위한 간단한 HTML 생성
const createSimpleHtml = () => {
  const htmlContent = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>부동산 계산기</title>
  <style>
    body {
      font-family: 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif;
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #F5F6F7;
      color: #333333;
    }
    .container {
      max-width: 600px;
      padding: 2rem;
      background-color: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      text-align: center;
    }
    h1 {
      font-size: 1.75rem;
      margin-bottom: 1rem;
    }
    p {
      margin: 1rem 0;
      line-height: 1.6;
    }
    .button {
      display: inline-block;
      background-color: #FEE500;
      color: #333333;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 500;
      margin-top: 1rem;
      transition: all 0.2s;
    }
    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>부동산 계산기</h1>
    <p>간편하게 청약 가점을 계산하고 부동산 관련 비용을 확인해보세요</p>
    <p>이 앱은 청약 점수 계산기, 평수 계산기, 취득세 계산기, 보유세 계산기를 제공합니다.</p>
    <p>정적 페이지에서는 계산기 기능이 제한됩니다. 모든 기능을 사용하시려면 동적 서버로 전환해주세요.</p>
    <a href="/" class="button">앱 실행하기</a>
  </div>
</body>
</html>`;

  fs.writeFileSync(path.join(publicDir, 'index.html'), htmlContent);
  console.log('정적 배포용 index.html 파일이 생성되었습니다.');
};

// 메인 빌드 프로세스
const buildStatic = () => {
  console.log('정적 배포를 위한 빌드를 시작합니다...');
  
  // 정적 HTML 생성
  createSimpleHtml();
  
  console.log('정적 배포 준비가 완료되었습니다.');
};

buildStatic();