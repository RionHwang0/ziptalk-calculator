import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SubscriptionCalculator from "@/components/SubscriptionCalculator";
import ScoreResults from "@/components/ScoreResults";
import AreaCalculator from "@/components/AreaCalculator";
import TaxCalculator from "@/components/TaxCalculator";
import HoldingTaxCalculator from "@/components/HoldingTaxCalculator";
import AdSenseAd from "@/components/AdSenseAd";
import { CalculatedScore } from "@/lib/calculator";

export default function Home() {
  const [calculatedScore, setCalculatedScore] = useState<CalculatedScore | null>(null);
  const [activeTab, setActiveTab] = useState("subscription");

  return (
    <div className="font-sans bg-[#F5F6F7] text-[#333333] min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold">부동산 계산기</h1>
          <nav className="hidden md:block">
            <ul className="flex space-x-6">
              <li><a href="#" className="text-[#333333] hover:text-[#3182F6] transition">홈</a></li>
              <li><a href="#calculator" className="text-[#333333] hover:text-[#3182F6] transition">계산기</a></li>
              <li><a href="#help" className="text-[#333333] hover:text-[#3182F6] transition">도움말</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Main Tabs */}
        <Tabs 
          defaultValue="subscription" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-4 mb-8 text-xs md:text-sm">
            <TabsTrigger value="subscription" className="px-1 md:px-2">청약 점수</TabsTrigger>
            <TabsTrigger value="area" className="px-1 md:px-2">평수 계산</TabsTrigger>
            <TabsTrigger value="tax" className="px-1 md:px-2">취득세 계산</TabsTrigger>
            <TabsTrigger value="holdingtax" className="px-1 md:px-2">보유세 계산</TabsTrigger>
          </TabsList>

          {/* Subscription Calculator Tab */}
          <TabsContent value="subscription">
            <div className="max-w-lg mx-auto">
              <SubscriptionCalculator onCalculate={setCalculatedScore} />
              
              {/* 계산기와 결과 사이 광고 */}
              <div className="my-6">
                <AdSenseAd slot="1234567890" format="auto" style={{ height: "250px" }} />
              </div>
              
              {calculatedScore && <ScoreResults score={calculatedScore} />}
            </div>
          </TabsContent>

          {/* Area Calculator Tab */}
          <TabsContent value="area">
            <div className="max-w-lg mx-auto">
              <AreaCalculator />
              
              {/* 평수 계산기 아래 광고 */}
              <div className="mt-6">
                <AdSenseAd slot="2345678901" format="auto" style={{ height: "250px" }} />
              </div>
            </div>
          </TabsContent>

          {/* Tax Calculator Tab */}
          <TabsContent value="tax">
            <div className="max-w-lg mx-auto">
              <TaxCalculator />
              
              {/* 취득세 계산기 아래 광고 */}
              <div className="mt-6">
                <AdSenseAd slot="3456789012" format="auto" style={{ height: "250px" }} />
              </div>
            </div>
          </TabsContent>
          
          {/* Holding Tax Calculator Tab */}
          <TabsContent value="holdingtax">
            <div className="max-w-lg mx-auto">
              <HoldingTaxCalculator />
              
              {/* 보유세 계산기 아래 광고 */}
              <div className="mt-6">
                <AdSenseAd slot="4567890123" format="auto" style={{ height: "250px" }} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="bg-[#333333] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <h3 className="text-xl font-bold mb-4">부동산 계산기</h3>
              <p className="text-gray-400 max-w-md">본 서비스는 한국 주택 청약 제도에 따른 점수 계산, 평수 환산, 취득세 계산을 돕는 서비스입니다.</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h4 className="text-lg font-medium mb-4">서비스</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white transition">청약 점수 계산</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition">평수 계산기</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition">취득세 계산기</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition">보유세 계산기</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition">자주 묻는 질문</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-medium mb-4">정보</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white transition">이용약관</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition">개인정보처리방침</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition">공지사항</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition">사이트맵</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-medium mb-4">문의</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white transition">고객센터</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition">피드백 보내기</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition">협업 문의</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* 푸터 광고 영역 */}
          <div className="mt-8 py-6">
            <AdSenseAd slot="5678901234" format="horizontal" style={{ height: "120px" }} />
          </div>
          
          <div className="border-t border-gray-700 mt-4 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">© {new Date().getFullYear()} 부동산 계산기. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
