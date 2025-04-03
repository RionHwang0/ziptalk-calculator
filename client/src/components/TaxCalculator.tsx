import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calculator as CalculatorIcon } from "lucide-react";

interface TaxResult {
  totalCost: number;
  acquisitionTax: number;
  educationTax: number;
  stampDuty: number;
  brokerageFee: number;
  registrationFee: number;
}

// 중개수수료 요율 계산 함수
function getBrokerageFeeRate(price: number): number {
  if (price < 50000000) return 0.006;
  if (price < 200000000) return 0.005;
  if (price < 600000000) return 0.004;
  if (price < 900000000) return 0.005;
  return 0.009; // 9억 초과는 협의 요율 최대치
}

// 중개수수료 계산 함수
function getBrokerageFee(price: number): number {
  const rate = getBrokerageFeeRate(price);
  return Math.floor(price * rate);
}

export default function TaxCalculator() {
  const [price, setPrice] = useState<string>("");
  const [houseCount, setHouseCount] = useState<string>("1");
  const [isFirstTime, setIsFirstTime] = useState<boolean>(false);
  const [isRestrictedArea, setIsRestrictedArea] = useState<boolean>(false);
  const [taxResult, setTaxResult] = useState<TaxResult | null>(null);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 숫자만 허용
    if (value === "" || /^\d+$/.test(value)) {
      setPrice(value);
    }
  };

  const calculateTax = () => {
    if (!price) {
      alert("매매가를 입력해주세요.");
      return;
    }
    
    // 만원 단위를 원 단위로 변환
    const priceInWon = parseFloat(price) * 10000;
    const houseCountNum = parseInt(houseCount);
    
    let taxRate = 0.01;

    if (isFirstTime && houseCountNum === 1 && priceInWon <= 600000000) {
      taxRate = 0.005;
    } else if (priceInWon > 900000000) {
      taxRate = 0.03;
    } else if (priceInWon > 600000000) {
      taxRate = 0.02;
    }

    const acquisitionTax = Math.floor(priceInWon * taxRate);
    const educationTax = Math.floor(acquisitionTax * 0.1);
    const stampDuty = priceInWon > 1000000000 ? 350000 : 150000;
    
    // 새로운 중개수수료 계산 함수 사용
    const brokerageFee = getBrokerageFee(priceInWon);
    
    const registrationFee = 300000;

    const totalCost = acquisitionTax + educationTax + stampDuty + brokerageFee + registrationFee;

    setTaxResult({
      totalCost,
      acquisitionTax,
      educationTax,
      stampDuty,
      brokerageFee,
      registrationFee
    });
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString("ko-KR");
  };

  return (
    <Card className="bg-white rounded-xl shadow-md p-2 mb-8">
      <CardContent className="pt-6">
        <h2 className="text-xl font-bold mb-6 flex items-center">
          <CalculatorIcon className="h-6 w-6 mr-2 text-[#FEE500]" />
          취득세 및 초기 비용 계산기
        </h2>
        
        <div className="space-y-6">
          <div className="form-group">
            <Label htmlFor="price" className="block text-sm font-medium mb-2">매매가 (만원)</Label>
            <Input
              id="price"
              type="text"
              value={price}
              onChange={handlePriceChange}
              placeholder="예: 45000"
              className="w-full p-3 border rounded-lg"
            />
          </div>
          
          <div className="form-group">
            <Label htmlFor="houseCount" className="block text-sm font-medium mb-2">주택 수</Label>
            <Select value={houseCount} onValueChange={setHouseCount}>
              <SelectTrigger className="w-full p-3 border rounded-lg">
                <SelectValue placeholder="주택 수 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1주택</SelectItem>
                <SelectItem value="2">2주택 이상</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="form-group flex items-center space-x-2">
            <Checkbox 
              id="isFirstTime" 
              checked={isFirstTime} 
              onCheckedChange={(checked) => setIsFirstTime(checked as boolean)}
            />
            <Label htmlFor="isFirstTime" className="text-sm font-medium cursor-pointer">
              생애최초 구입 여부
            </Label>
          </div>
          
          <div className="form-group flex items-center space-x-2">
            <Checkbox 
              id="isRestrictedArea" 
              checked={isRestrictedArea} 
              onCheckedChange={(checked) => setIsRestrictedArea(checked as boolean)}
            />
            <Label htmlFor="isRestrictedArea" className="text-sm font-medium cursor-pointer">
              조정대상지역 여부
            </Label>
          </div>
          
          <Button 
            onClick={calculateTax} 
            className="w-full py-3 px-4 bg-[#FEE500] text-[#333333] font-medium rounded-lg hover:shadow-md transition duration-200"
          >
            계산하기
          </Button>
        </div>
        
        {taxResult && (
          <div className="mt-8 p-4 bg-[#F5F6F7] rounded-lg space-y-2">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-bold">총 예상 초기 비용:</h3>
              <span className="text-lg font-bold">{formatNumber(taxResult.totalCost)}원</span>
            </div>
            <p className="text-sm">- 취득세: {formatNumber(taxResult.acquisitionTax)}원</p>
            <p className="text-sm">- 지방교육세: {formatNumber(taxResult.educationTax)}원</p>
            <p className="text-sm">- 인지세: {formatNumber(taxResult.stampDuty)}원</p>
            <p className="text-sm">- 중개수수료: {formatNumber(taxResult.brokerageFee)}원</p>
            <p className="text-sm">- 등기비용: {formatNumber(taxResult.registrationFee)}원</p>
            <p className="text-xs text-gray-500 mt-2">※ 9억 원 초과 주택의 경우, 중개보수 요율은 0.4% ~ 0.9% 범위 내에서 중개인과 협의가 필요합니다.</p>
          </div>
        )}

        <div className="mt-6 p-4 bg-[#F8F9FA] rounded-lg">
          <h3 className="text-sm font-medium mb-2">취득세 안내</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 생애최초 1주택 구입 & 6억원 이하 : 0.5%</li>
            <li>• 6억원 이하 : 1%</li>
            <li>• 6억원 초과 ~ 9억원 이하 : 2%</li>
            <li>• 9억원 초과 : 3%</li>
            <li>• 지방교육세는 취득세의 10%가 적용됩니다</li>
            <li>• 등기비용은 대략적인 금액이며 실제와 차이가 있을 수 있습니다</li>
          </ul>
        </div>
        
        <div className="mt-4 p-4 bg-[#F8F9FA] rounded-lg">
          <h3 className="text-sm font-medium mb-2">중개수수료 안내(상한)</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 5천만원 미만 : 0.6%</li>
            <li>• 5천만원 이상 ~ 2억원 미만 : 0.5%</li>
            <li>• 2억원 이상 ~ 6억원 미만 : 0.4%</li>
            <li>• 6억원 이상 ~ 9억원 미만 : 0.5%</li>
            <li>• 9억원 이상 : 0.9% (협의가능)</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}