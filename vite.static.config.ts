import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

/**
 * 부동산 계산기 정적 배포용 Vite 설정
 * 
 * 이 설정은 백엔드 없이 독립적으로 실행 가능한 정적 빌드를 생성합니다.
 * static-main.tsx를 진입점으로 사용하여 서버 API 호출을 클라이언트 측 계산으로 대체합니다.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@components': path.resolve(__dirname, './client/src/components'),
      '@lib': path.resolve(__dirname, './client/src/lib'),
      '@hooks': path.resolve(__dirname, './client/src/hooks'),
      '@shared': path.resolve(__dirname, './shared'),
      '@assets': path.resolve(__dirname, './attached_assets'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2020',
    // 정적 배포용 진입점 설정
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'client/static-index.html'),
      },
    },
    // 출력 청크 설정
    minify: 'terser',
    sourcemap: false,
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: true
      }
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-hook-form'
    ]
  }
});