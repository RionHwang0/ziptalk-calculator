import { Switch, Route, Link, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

// 정적 환경 표시 배너
function StaticBanner() {
  return (
    <div className="bg-blue-500 text-white text-center py-1 text-sm">
      정적 모드에서 실행 중입니다. 일부 기능이 제한될 수 있습니다.
    </div>
  );
}

function Router() {
  // 정적 배포에서는 Admin 페이지 제외
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

// Simple Header component with navigation
function Header() {
  return (
    <header className="bg-yellow-500 text-white py-4">
      <div className="container mx-auto flex justify-between items-center px-4">
        <Link href="/">
          <h1 className="text-xl font-bold cursor-pointer">부동산 계산기</h1>
        </Link>
      </div>
    </header>
  );
}

function StaticApp() {
  return (
    <>
      <StaticBanner />
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <Router />
        </main>
      </div>
      <Toaster />
    </>
  );
}

export default StaticApp;