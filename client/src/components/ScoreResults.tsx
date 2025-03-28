import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart } from 'lucide-react';
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

  return (
    <Card id="score-result" className="bg-white rounded-xl shadow-md p-2 mb-8">
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
        <div className="space-y-4">
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
      </CardContent>
    </Card>
  );
}
