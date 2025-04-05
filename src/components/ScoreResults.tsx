import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, CheckCircle, Building, AlertTriangle } from 'lucide-react';
import { CalculatedScore } from "@/lib/calculator";

interface ScoreResultsProps {
  score: CalculatedScore;
}

export default function ScoreResults({ score }: ScoreResultsProps) {
  const scoreBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animate the score bar
    if (scoreBarRef.current) {
      scoreBarRef.current.style.width = "0%";
      setTimeout(() => {
        if (scoreBarRef.current) {
          scoreBarRef.current.style.width = `${score.totalScore}%`;
        }
      }, 100);
    }
    
    // Scroll to results
    const element = document.getElementById('score-result');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, [score]);

  const getWinningProbabilityClass = () => {
    if (score.probability >= 70) return "bg-[#2AC769]";
    if (score.probability >= 30) return "bg-[#3182F6]";
    return "bg-[#FF5252]";
  };

  const getWinningProbabilityText = () => {
    if (score.probability >= 70) return "높음";
    if (score.probability >= 30) return "중간";
    return "낮음";
  };
  
  // 청약 가점 분석 함수
  const analyzeScore = (userScore: number) => {
    const 평균당첨점수 = 62; // 2023년 전국 평균값 예시
    
    if (userScore >= 70) {
      return {
        average: 평균당첨점수,
        analysis: "청약 가점이 매우 높습니다. 대부분의 지역에서 당첨 확률이 높습니다.",
        class: "text-[#2AC769]"
      };
    } else if (userScore >= 평균당첨점수) {
      return {
        average: 평균당첨점수,
        analysis: "평균 이상의 청약 가점입니다. 인기 지역을 제외하면 당첨 가능성이 있습니다.",
        class: "text-[#3182F6]"
      };
    } else if (userScore >= 50) {
      return {
        average: 평균당첨점수,
        analysis: "청약 가점이 다소 낮습니다. 비인기 지역이나 추첨제 비율이 높은 곳을 노려보세요.",
        class: "text-[#F59E0B]"
      };
    } else {
      return {
        average: 평균당첨점수,
        analysis: "청약 가점이 낮아 가점제 당첨은 어렵습니다. 추첨제 비율이 높은 민간 분양 위주로 고려해보세요.",
        class: "text-[#FF5252]"
      };
    }
  };
  
  // 지원 가능 아파트 예측 함수
  const recommendApartment = (userScore: number) => {
    if (userScore >= 70) {
      return {
        recommendations: [
          "서울 강남권 민영 아파트",
          "수도권 3기 신도시 (가점제 비율 높음)",
          "특별공급 대상자 우선 고려"
        ],
        class: "text-[#2AC769]",
        icon: <CheckCircle className="h-5 w-5 mr-2 text-[#2AC769]" />
      };
    } else if (userScore >= 60) {
      return {
        recommendations: [
          "수도권 일반공급 (과천, 하남 제외)",
          "지방광역시 중심지 신규 분양",
          "중소건설사 분양단지"
        ],
        class: "text-[#3182F6]",
        icon: <Building className="h-5 w-5 mr-2 text-[#3182F6]" />
      };
    } else if (userScore >= 50) {
      return {
        recommendations: [
          "비수도권 소도시 공공분양",
          "추첨제 비중 높은 민간 아파트",
          "신혼부부 특별공급 적극 활용"
        ],
        class: "text-[#F59E0B]",
        icon: <Building className="h-5 w-5 mr-2 text-[#F59E0B]" />
      };
    } else {
      return {
        recommendations: [
          "추첨제 위주 민간 분양",
          "오피스텔/도시형생활주택 등 대안 고려",
          "청년/신혼부부 특별공급 자격 확인 필요"
        ],
        class: "text-[#FF5252]",
        icon: <AlertTriangle className="h-5 w-5 mr-2 text-[#FF5252]" />
      };
    }
  };
  
  const scoreAnalysis = analyzeScore(score.totalScore);
  const apartmentRecommendation = recommendApartment(score.totalScore);

  return (
    <Card id="score-result" className="bg-white rounded-xl shadow-md p-2 mt-0 mb-8">
      <CardContent className="pt-6">
        <h2 className="text-xl font-bold mb-6 flex items-center">
          <BarChart className="h-6 w-6 mr-2 text-[#3182F6]" />
          청약 점수 결과
        </h2>

        {/* Score Summary */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-medium">총점수</span>
            <span id="total-score" className="text-3xl font-bold">{score.totalScore}</span>
          </div>
          
          <div className="relative w-full h-5 bg-[#F5F6F7] rounded-full overflow-hidden mb-2">
            <div 
              ref={scoreBarRef}
              className="absolute top-0 left-0 h-full bg-[#3182F6] transition-all duration-500" 
              style={{ width: `${score.totalScore}%` }}
            ></div>
          </div>
          
          <div className="text-center">
            <span 
              className={`inline-block px-4 py-2 text-white font-medium rounded-full ${getWinningProbabilityClass()}`}
            >
              당첨 가능성: {getWinningProbabilityText()} ({score.probability}%)
            </span>
          </div>
        </div>

        {/* Detailed Score */}
        <div className="space-y-4 mb-6">
          <h3 className="font-medium text-md">점수 세부 내역</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#F5F6F7] rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">나이 점수</p>
              <p className="text-xl font-medium">{score.ageScore}점</p>
            </div>
            
            <div className="bg-[#F5F6F7] rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">무주택 기간 점수</p>
              <p className="text-xl font-medium">{score.noHomePeriodScore}점</p>
            </div>
            
            <div className="bg-[#F5F6F7] rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">부양 가족 수 점수</p>
              <p className="text-xl font-medium">{score.dependentsScore}점</p>
            </div>
            
            <div className="bg-[#F5F6F7] rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">청약 통장 가입 기간 점수</p>
              <p className="text-xl font-medium">{score.subscriptionPeriodScore}점</p>
            </div>
            
            <div className="bg-[#F5F6F7] rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">연간 소득 점수</p>
              <p className="text-xl font-medium">{score.incomeScore}점</p>
            </div>
          </div>
        </div>
        
        {/* Score Analysis */}
        <div className="p-4 bg-[#F8F9FA] rounded-lg mb-4" id="scoreAnalysis">
          <h3 className="text-md font-medium mb-2">분석 결과:</h3>
          <div className="flex flex-col space-y-2">
            <p className="text-sm">
              - 평균 당첨 점수: <span className="font-medium">{scoreAnalysis.average}점</span>
            </p>
            <p className="text-sm">
              - 내 점수: <span className="font-medium">{score.totalScore}점</span>
            </p>
            <p className={`text-sm ${scoreAnalysis.class} font-medium`}>
              - 평가: {scoreAnalysis.analysis}
            </p>
          </div>
        </div>
        
        {/* Apartment Recommendation */}
        <div className="p-4 bg-[#E8F5E9] rounded-lg" id="recommendation">
          <h3 className="text-md font-medium mb-2 flex items-center">
            {apartmentRecommendation.icon}
            지원 가능 아파트 예측:
          </h3>
          <ul className="text-sm space-y-2 pl-2">
            {apartmentRecommendation.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
