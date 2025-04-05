import React from 'react';
import ReactDOM from 'react-dom/client';
import StaticApp from './StaticApp';
import './index.css';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

// 정적 배포용 QueryClient 인스턴스 생성
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5분
      retry: 1,
    },
  }
});

// API 요청을 가로채서 모의 데이터 반환하는 함수 재정의
const originalFetch = window.fetch;

// 정적 모드에서 사용할 페이크 API 함수
const fakeFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const url = typeof input === 'string' ? input : input.toString();
  console.log('Static mode fetch:', url);
  
  // 청약 계산기 점수 계산 API
  if (url.includes('/api/calculate-score') && init?.method === 'POST') {
    try {
      const body = init.body ? JSON.parse(init.body as string) : {};
      const { age, noHomePeriod, dependents, subscriptionPeriod, income } = body;
      
      // 원본 계산기의 점수 계산 로직 적용 (Calculator.ts와 동일)
      // Age score calculation (max 20)
      let ageScore = 0;
      if (age >= 40) {
        ageScore = 20; // Maximum score for age 40+
      } else if (age >= 35) {
        ageScore = 15;
      } else if (age >= 30) {
        ageScore = 10;
      } else if (age >= 25) {
        ageScore = 5;
      } else {
        ageScore = 2;
      }
      
      // No home period score calculation (max 20)
      const noHomePeriodScore = Math.min(20, noHomePeriod);
      
      // Dependents score calculation (max 30)
      let dependentsScore = 0;
      if (dependents >= 3) {
        dependentsScore = 30; // Maximum score for 3+ dependents
      } else if (dependents === 2) {
        dependentsScore = 20;
      } else if (dependents === 1) {
        dependentsScore = 10;
      }
      
      // Subscription period score calculation (max 20)
      const subscriptionPeriodScore = Math.min(20, subscriptionPeriod);
      
      // Income score calculation (max 10)
      let incomeScore = 0;
      if (income <= 2000) {
        incomeScore = 10; // Maximum score for income under 20M KRW
      } else if (income <= 4000) {
        incomeScore = 5;
      } else if (income <= 6000) {
        incomeScore = 2;
      }
      
      // Calculate total score (max 100)
      const totalScore = Math.min(100, ageScore + noHomePeriodScore + dependentsScore + subscriptionPeriodScore + incomeScore);
      
      // Calculate probability based on total score
      const probability = Math.min(100, Math.round(totalScore * 0.9));
      
      const result = {
        ageScore,
        noHomePeriodScore,
        dependentsScore,
        subscriptionPeriodScore,
        incomeScore,
        totalScore,
        probability
      };
      
      const responseInit: ResponseInit = {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      };
      
      return new Response(JSON.stringify(result), responseInit);
    } catch (error) {
      console.error('Error parsing JSON:', error);
    }
  }
  
  // 기본적으로 404 응답 반환 (정적 배포에서 지원하지 않는 API)
  const errorResponseInit: ResponseInit = {
    status: 404,
    statusText: 'Not Found',
    headers: { 'Content-Type': 'application/json' }
  };
  
  return new Response(
    JSON.stringify({ error: '정적 배포에서는 이 API를 사용할 수 없습니다.' }), 
    errorResponseInit
  );
};

// 전역 fetch 함수 재정의
window.fetch = fakeFetch;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <StaticApp />
    </QueryClientProvider>
  </React.StrictMode>,
);