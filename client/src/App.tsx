import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Admin from "@/pages/Admin";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

function Router() {
  // 세션 스토리지에서 인증 상태 확인
  const isAuth = sessionStorage.getItem('isAdminAuthenticated') === 'true';
  const [, navigate] = useLocation();
  
  // 인증 확인 함수
  const ProtectedAdminRoute = () => {
    useEffect(() => {
      if (!isAuth) {
        navigate('/');
        alert('관리자 페이지에 접근 권한이 없습니다.');
      }
    }, []);
    
    return isAuth ? <Admin /> : null;
  };
  
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin" component={ProtectedAdminRoute} />
      <Route component={NotFound} />
    </Switch>
  );
}

// Simple Header component with navigation
function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAdminButton, setShowAdminButton] = useState(false);
  const [, navigate] = useLocation();

  // 관리자 인증 처리
  const handleAuthentication = () => {
    // 임시 비밀번호 (실제로는 환경변수나 서버 인증을 사용해야 함)
    const ADMIN_PASSWORD = "admin1234";
    
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('isAdminAuthenticated', 'true');
      setShowAuthModal(false);
      setShowAdminButton(true);
      navigate("/admin");
    } else {
      alert("비밀번호가 일치하지 않습니다.");
    }
  };

  // 컴포넌트 마운트 시 인증 상태 확인 및 특수 키 조합 감지 설정
  useEffect(() => {
    const authStatus = sessionStorage.getItem('isAdminAuthenticated') === 'true';
    if (authStatus) {
      setIsAuthenticated(true);
      setShowAdminButton(true);
    }
    
    // 특수 키 조합(Ctrl+Shift+A)을 감지하여 관리자 접근 모달 표시
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        setShowAuthModal(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Admin 페이지로 이동하려고 할 때 인증 모달 표시
  const handleAdminClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setShowAuthModal(true);
    } else {
      navigate("/admin");
    }
  };

  return (
    <header className="bg-yellow-500 text-white py-4">
      <div className="container mx-auto flex justify-between items-center px-4">
        <Link href="/">
          <h1 className="text-xl font-bold cursor-pointer">부동산 계산기</h1>
        </Link>
        <nav>
          {showAdminButton && (
            <a href="/admin" onClick={handleAdminClick}>
              <Button variant="secondary" className="bg-white text-yellow-600 hover:bg-gray-100">
                관리자 페이지
              </Button>
            </a>
          )}
        </nav>
      </div>
      
      {/* 관리자 인증 모달 */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h3 className="text-gray-800 font-bold text-lg mb-4">관리자 인증</h3>
            <p className="text-gray-600 mb-4">관리자 페이지에 접근하려면 비밀번호를 입력하세요.</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-4"
              placeholder="비밀번호 입력"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAuthModal(false)}>
                취소
              </Button>
              <Button onClick={handleAuthentication}>
                인증
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow">
          <Router />
        </main>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
