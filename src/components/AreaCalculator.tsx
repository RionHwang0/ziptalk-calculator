import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
    if (activeTab === "pyeongToMeter" && pyeongValue) {
      const pyeong = parseFloat(pyeongValue);
      const squareMeter = convertPyeongToSquareMeter(pyeong);
      setResult({
        value: Math.round(squareMeter * 100) / 100, // 소수점 2자리까지
        unit: "제곱미터 (m²)"
      });
      setSquareMeterValue(squareMeter.toFixed(2));
    } else if (activeTab === "meterToPyeong" && squareMeterValue) {
      const squareMeter = parseFloat(squareMeterValue);
      const pyeong = convertSquareMeterToPyeong(squareMeter);
      setResult({
        value: Math.round(pyeong * 100) / 100, // 소수점 2자리까지
        unit: "평"
      });
      setPyeongValue(pyeong.toFixed(2));
    }
  };
  
  // 모드 전환 처리
  const handleSwitch = () => {
    // 탭 전환
    const newTab = activeTab === "pyeongToMeter" ? "meterToPyeong" : "pyeongToMeter";
    setActiveTab(newTab);
    
    // 값 초기화
    setResult(null);
  };
  
  // 필드 변경 처리
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'pyeong' | 'squareMeter') => {
    const value = e.target.value;
    
    // 숫자와 소수점만 허용
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      if (field === 'pyeong') {
        setPyeongValue(value);
      } else {
        setSquareMeterValue(value);
      }
      
      // 결과 초기화
      setResult(null);
    }
  };

  return (
    <Card className="bg-white rounded-xl shadow-md p-2 mb-8">
      <CardContent className="pt-6">
        <h2 className="text-xl font-bold mb-6 flex items-center">
          <CalculatorIcon className="h-6 w-6 mr-2 text-[#FEE500]" />
          평수 계산기
        </h2>
        
        <div className="flex justify-end mb-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSwitch} 
            className="flex items-center gap-1"
          >
            <ArrowRightLeft className="h-4 w-4" />
            <span>전환</span>
          </Button>
        </div>
        
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
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
            <Button 
              onClick={handleCalculate} 
              className="w-full py-3 px-4 bg-[#FEE500] text-[#333333] font-medium rounded-lg hover:shadow-md transition duration-200"
            >
              변환하기
            </Button>
          </div>
          
          {/* Result Display */}
          {result && (
            <div className="mt-8 p-4 bg-[#F5F6F7] rounded-lg">
              <h3 className="text-lg font-medium mb-2">변환 결과</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    {activeTab === "pyeongToMeter" ? `${pyeongValue} 평` : `${squareMeterValue} m²`}
                  </p>
                </div>
                <ArrowRight className="text-gray-400 mx-4" />
                <div>
                  <p className="text-xl font-bold">{result.value} {result.unit}</p>
                </div>
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