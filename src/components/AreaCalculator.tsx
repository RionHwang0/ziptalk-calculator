import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator as CalculatorIcon, ArrowRight, ArrowRightLeft } from "lucide-react";

export default function AreaCalculator() {
  const [pyeongValue, setPyeongValue] = useState<string>("");
  const [squareMeterValue, setSquareMeterValue] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("pyeongToMeter");
  const [result, setResult] = useState<{ value: number; unit: string } | null>(null);
  
  // 평 -> 제곱미터 변환 (1평 = 3.305785 m²)
  const convertPyeongToSquareMeter = (pyeong: number): number => {
    return pyeong * 3.305785;
  };
  
  // 제곱미터 -> 평 변환 (1m² = 0.3025 평)
  const convertSquareMeterToPyeong = (squareMeter: number): number => {
    return squareMeter * 0.3025;
  };
  
  // 결과 계산 처리
  const handleCalculate = () => {
    try {
      console.log("계산 시작, 현재 탭:", activeTab);
      console.log("평수 값:", pyeongValue);
      console.log("제곱미터 값:", squareMeterValue);
      
      if (activeTab === "pyeongToMeter" && pyeongValue) {
        const pyeong = parseFloat(pyeongValue);
        console.log("변환할 평수:", pyeong);
        
        if (!isNaN(pyeong)) {
          const squareMeter = convertPyeongToSquareMeter(pyeong);
          console.log("변환된 제곱미터:", squareMeter);
          
          setResult({
            value: Math.round(squareMeter * 100) / 100, // 소수점 2자리까지
            unit: "제곱미터 (m²)"
          });
          setSquareMeterValue(squareMeter.toFixed(2));
        } else {
          console.error("유효하지 않은 평수 값");
          alert("유효한 숫자를 입력해주세요.");
        }
      } else if (activeTab === "meterToPyeong" && squareMeterValue) {
        const squareMeter = parseFloat(squareMeterValue);
        console.log("변환할 제곱미터:", squareMeter);
        
        if (!isNaN(squareMeter)) {
          const pyeong = convertSquareMeterToPyeong(squareMeter);
          console.log("변환된 평수:", pyeong);
          
          setResult({
            value: Math.round(pyeong * 100) / 100, // 소수점 2자리까지
            unit: "평"
          });
          setPyeongValue(pyeong.toFixed(2));
        } else {
          console.error("유효하지 않은 제곱미터 값");
          alert("유효한 숫자를 입력해주세요.");
        }
      } else {
        console.error("입력값이 없음");
        alert("변환할 값을 입력해주세요.");
      }
    } catch (error) {
      console.error("계산 중 오류 발생:", error);
      alert("계산 중 오류가 발생했습니다.");
    }
  };
  
  // 모드 전환 처리
  const handleSwitch = () => {
    // 탭 전환
    const newTab = activeTab === "pyeongToMeter" ? "meterToPyeong" : "pyeongToMeter";
    setActiveTab(newTab);
    
    // 값 초기화
    setPyeongValue("");
    setSquareMeterValue("");
    setResult(null);
  };
  
  // 탭 변경 처리
  const handleTabChange = (value: string) => {
    console.log("탭 변경:", value);
    setActiveTab(value);
    
    // 결과 초기화
    setResult(null);
  };
  
  // 필드 변경 처리
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'pyeong' | 'squareMeter') => {
    const value = e.target.value;
    
    // 입력값 업데이트
    if (field === 'pyeong') {
      setPyeongValue(value);
    } else {
      setSquareMeterValue(value);
    }
    
    // 결과 초기화
    setResult(null);
  };

  return (
    <Card className="bg-white rounded-xl shadow-md p-2 mb-8">
      <CardContent className="pt-6">
        <h2 className="text-xl font-bold mb-6 flex items-center">
          <CalculatorIcon className="h-6 w-6 mr-2 text-[#FEE500]" />
          평수 계산기
        </h2>
        
        <div className="flex justify-end mb-4">
          <button 
            onClick={handleSwitch} 
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-[#FEE500] text-black hover:bg-[#E6CF00] h-10 w-full py-3 px-4 font-medium rounded-lg hover:shadow-md transition duration-200"
          >
            <ArrowRightLeft className="h-4 w-4" />
            <span>전환</span>
          </button>
        </div>
        
        <Tabs 
          value={activeTab} 
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="pyeongToMeter">평 → 제곱미터</TabsTrigger>
            <TabsTrigger value="meterToPyeong">제곱미터 → 평</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pyeongToMeter" className="space-y-6">
            <div className="form-group">
              <Label htmlFor="pyeong" className="block text-sm font-medium mb-2">평수 입력</Label>
              <Input
                id="pyeong"
                type="text"
                value={pyeongValue}
                onChange={(e) => handleInputChange(e, 'pyeong')}
                placeholder="변환할 평수를 입력하세요"
                className="w-full p-3 border rounded-lg"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="meterToPyeong" className="space-y-6">
            <div className="form-group">
              <Label htmlFor="squareMeter" className="block text-sm font-medium mb-2">제곱미터 입력</Label>
              <Input
                id="squareMeter"
                type="text"
                value={squareMeterValue}
                onChange={(e) => handleInputChange(e, 'squareMeter')}
                placeholder="변환할 제곱미터를 입력하세요"
                className="w-full p-3 border rounded-lg"
              />
            </div>
          </TabsContent>
          
          <div className="mt-6">
            <button 
              onClick={() => {
                console.log("변환하기 버튼 클릭됨");
                handleCalculate();
              }} 
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-[#FEE500] text-black hover:bg-[#E6CF00] h-10 w-full py-3 px-4 font-medium rounded-lg hover:shadow-md transition duration-200"
            >
              변환하기
            </button>
          </div>
          
          {/* Result Display */}
          {result && (
            <div className="mt-8 p-4 bg-[#F5F6F7] rounded-lg">
              <h3 className="text-lg font-medium mb-2">변환 결과</h3>
              <div className="flex flex-col items-center justify-center">
                <p className="text-sm text-gray-500 mb-2">
                  {activeTab === "pyeongToMeter" ? `${pyeongValue} 평` : `${squareMeterValue} m²`}
                </p>
                <ArrowRight className="text-gray-400 mx-4 mb-2" />
                <p className="text-xl font-bold">{result.value} {result.unit}</p>
              </div>
            </div>
          )}
          
          <div className="mt-6 p-4 bg-[#F8F9FA] rounded-lg">
            <h3 className="text-sm font-medium mb-2">변환 정보</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 1평 = 3.305785 제곱미터 (m²)</li>
              <li>• 1제곱미터 (m²) = 0.3025 평</li>
              <li>• 공급면적 기준으로 계산됩니다</li>
            </ul>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}