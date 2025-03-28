import { Card, CardContent } from "@/components/ui/card";
import { BarChart as BarChartIcon } from "lucide-react";
import { CalculatedScore } from "@/lib/calculator";

interface CompetitionAnalysisProps {
  score: CalculatedScore;
  competitionData: any;
  selectedApartment: any | null;
}

interface RecentApartment {
  id: number;
  name: string;
  location: string;
  competitionRate: number;
  minScore: number;
  avgScore: number;
}

export default function CompetitionAnalysis({ score, competitionData, selectedApartment }: CompetitionAnalysisProps) {
  // Default values when no apartment is selected
  let averageCompetitionRate = competitionData.averageCompetitionRate || 25.3;
  let winningChance = competitionData.winningChance || 3.9;
  let requiredScore = competitionData.requiredScore || 72;
  
  // If an apartment is selected, use its specific data
  if (selectedApartment) {
    averageCompetitionRate = selectedApartment.competitionRate;
    winningChance = calculateWinningChance(score.totalScore, selectedApartment);
    requiredScore = selectedApartment.requiredScore || requiredScore;
  }

  const scoreDifference = requiredScore - score.totalScore;
  
  const recentApartments: RecentApartment[] = competitionData.recentApartments || [
    { id: 1, name: "롯데캐슬 스카이", location: "서울시 용산구", competitionRate: 38, minScore: 70, avgScore: 74 },
    { id: 2, name: "힐스테이트 파크", location: "경기도 하남시", competitionRate: 22, minScore: 65, avgScore: 69 },
    { id: 3, name: "자이 더 스위트", location: "부산시 해운대구", competitionRate: 15, minScore: 60, avgScore: 64 },
    { id: 4, name: "SK 뷰 파크", location: "대구시 수성구", competitionRate: 12, minScore: 58, avgScore: 62 }
  ];

  function calculateWinningChance(userScore: number, apartment: any): number {
    // This is a simplified calculation - in a real app, this would be more complex
    const minScore = apartment.minScore || (apartment.requiredScore - 5);
    const maxScore = apartment.avgScore || apartment.requiredScore;
    
    if (userScore >= maxScore) return 85;
    if (userScore >= minScore) {
      // Linear scale between min and max scores
      return 30 + (userScore - minScore) * (55 / (maxScore - minScore));
    }
    return Math.max(1, 30 * (userScore / minScore));
  }

  return (
    <Card className="bg-white rounded-xl shadow-md p-2 mb-8">
      <CardContent className="pt-6">
        <h2 className="text-xl font-bold mb-6 flex items-center">
          <BarChartIcon className="h-6 w-6 mr-2 text-[#3182F6]" />
          경쟁률 분석
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Average Competition Rate */}
          <div className="bg-[#F5F6F7] rounded-lg p-5">
            <h3 className="text-sm text-gray-500 mb-3">평균 경쟁률</h3>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold mr-2">{averageCompetitionRate.toFixed(1)}</span>
              <span className="text-lg font-medium">: 1</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              전국 평균 대비 
              <span className={competitionData.nationalAvgDiff > 0 ? "text-[#FF5252]" : "text-[#2AC769]"}>
                {competitionData.nationalAvgDiff > 0 ? ' +' : ' '}
                {competitionData.nationalAvgDiff?.toFixed(1) || '12.4'}
              </span>
            </p>
          </div>
          
          {/* Your Winning Chance */}
          <div className="bg-[#F5F6F7] rounded-lg p-5">
            <h3 className="text-sm text-gray-500 mb-3">선택 지역 당첨 확률</h3>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold mr-2">{winningChance.toFixed(1)}</span>
              <span className="text-lg font-medium">%</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              귀하의 점수로는 
              <span className={
                winningChance >= 70 ? "text-[#2AC769]" : 
                winningChance >= 30 ? "text-[#3182F6]" : 
                "text-[#FF5252]"
              }>
                {' '}
                {winningChance >= 70 ? "높은 확률" : 
                 winningChance >= 30 ? "중간 확률" : 
                 "낮은 확률"}
              </span>
            </p>
          </div>
          
          {/* Required Score */}
          <div className="bg-[#F5F6F7] rounded-lg p-5">
            <h3 className="text-sm text-gray-500 mb-3">평균 당첨 점수</h3>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold mr-2">{requiredScore}</span>
              <span className="text-lg font-medium">점</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              귀하의 점수보다 
              <span className={scoreDifference > 0 ? "text-[#FF5252]" : "text-[#2AC769]"}>
                {' '}
                {scoreDifference > 0 ? 
                  `${scoreDifference}점 높음` : 
                  scoreDifference < 0 ? 
                  `${Math.abs(scoreDifference)}점 낮음` : 
                  "동일함"}
              </span>
            </p>
          </div>
        </div>
        
        {/* Recently Accepted Apartments */}
        <div className="mt-8">
          <h3 className="font-medium text-lg mb-4">최근 당첨된 아파트</h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#EAEBEE]">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">아파트명</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">지역</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">경쟁률</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">최저 당첨 점수</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">평균 당첨 점수</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-[#EAEBEE]">
                {recentApartments.map((apt) => (
                  <tr key={apt.id}>
                    <td className="px-4 py-3 whitespace-nowrap">{apt.name}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{apt.location}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{apt.competitionRate}:1</td>
                    <td className="px-4 py-3 whitespace-nowrap">{apt.minScore}점</td>
                    <td className="px-4 py-3 whitespace-nowrap">{apt.avgScore}점</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
