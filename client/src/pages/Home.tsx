import { useState } from "react";
import SubscriptionCalculator from "@/components/SubscriptionCalculator";
import ScoreResults from "@/components/ScoreResults";
import CompetitionRateUpload from "@/components/CompetitionRateUpload";
import ApartmentMap from "@/components/ApartmentMap";
import CompetitionAnalysis from "@/components/CompetitionAnalysis";
import { CalculatedScore } from "@/lib/calculator";

export default function Home() {
  const [calculatedScore, setCalculatedScore] = useState<CalculatedScore | null>(null);
  const [competitionData, setCompetitionData] = useState(null);
  const [selectedApartment, setSelectedApartment] = useState(null);

  return (
    <div className="font-sans bg-[#F5F6F7] text-[#333333] min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold">청약 점수 계산기</h1>
          <nav className="hidden md:block">
            <ul className="flex space-x-6">
              <li><a href="#" className="text-[#333333] hover:text-[#3182F6] transition">홈</a></li>
              <li><a href="#calculator" className="text-[#333333] hover:text-[#3182F6] transition">계산기</a></li>
              <li><a href="#analysis" className="text-[#333333] hover:text-[#3182F6] transition">당첨 확인</a></li>
              <li><a href="#help" className="text-[#333333] hover:text-[#3182F6] transition">도움말</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column */}
          <div className="w-full lg:w-1/2">
            <SubscriptionCalculator onCalculate={setCalculatedScore} />
            {calculatedScore && <ScoreResults score={calculatedScore} />}
          </div>

          {/* Right Column */}
          <div className="w-full lg:w-1/2">
            <CompetitionRateUpload onUpload={setCompetitionData} />
            <ApartmentMap 
              competitionData={competitionData} 
              onApartmentSelect={setSelectedApartment} 
            />
          </div>
        </div>
        
        {/* Competition Analysis */}
        {calculatedScore && competitionData && (
          <CompetitionAnalysis 
            score={calculatedScore} 
            competitionData={competitionData}
            selectedApartment={selectedApartment}
          />
        )}
      </main>

      <footer className="bg-[#333333] text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <h3 className="text-xl font-bold mb-4">청약 점수 계산기</h3>
              <p className="text-gray-400 max-w-md">본 서비스는 한국 주택 청약 제도에 따른 점수 계산과 당첨 가능성을 분석하는 서비스입니다.</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h4 className="text-lg font-medium mb-4">서비스</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="text-gray-400 hover:text-white transition">청약 점수 계산</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition">당첨 가능성 분석</a></li>
                  <li><a href="#" className="text-gray-400 hover:text-white transition">청약 뉴스</a></li>
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
          
          <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">© {new Date().getFullYear()} 청약 점수 계산기. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
