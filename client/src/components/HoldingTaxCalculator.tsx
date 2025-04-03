import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Building2 } from "lucide-react";

interface HoldingTaxResult {
  totalTax: number;
  propertyTax: number;
  comprehensiveRealEstateTax: number;
}

export default function HoldingTaxCalculator() {
  const [publicPrice, setPublicPrice] = useState<string>("");
  const [houseCount, setHouseCount] = useState<string>("1");
  const [isRestricted, setIsRestricted] = useState<boolean>(false);
  const [isDiscounted, setIsDiscounted] = useState<boolean>(false);
  const [taxResult, setTaxResult] = useState<HoldingTaxResult | null>(null);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 숫자만 허용
    if (value === "" || /^\d+$/.test(value)) {
      setPublicPrice(value);
    }
  };

  const calculateHoldingTax = () => {
    if (!publicPrice) {
      alert("공시가격을 입력해주세요.");
      return;
    }
    
    // 만원 단위를 원 단위로 변환
    const price = parseFloat(publicPrice) * 10000;
    const houseCountNum = parseInt(houseCount);
    
    // 재산세 계산
    let propertyTaxRate = 0.001; // 0.1%
    if (price > 600000000) propertyTaxRate = 0.002; // 0.2%
    if (price > 900000000) propertyTaxRate = 0.003; // 0.3%
    const propertyTax = Math.floor(price * propertyTaxRate);

    // 종합부동산세 계산 (1가구 1주택 기준 12억 이상부터 과세, 그 외 6억)
    let comprehensiveRealEstateTax = 0;
    const threshold = (houseCountNum === 1) ? 1200000000 : 600000000;
    const taxBase = Math.max(price - threshold, 0);

    if (taxBase > 0) {
      let crtRate = 0.006; // 기본 0.6%
      if (houseCountNum > 1 && isRestricted) crtRate = 0.012; // 다주택 조정대상지역

      comprehensiveRealEstateTax = Math.floor(taxBase * crtRate);

      if (isDiscounted) {
        comprehensiveRealEstateTax = Math.floor(comprehensiveRealEstateTax * 0.7); // 30% 감면
      }
    }

    const totalTax = propertyTax + comprehensiveRealEstateTax;

    setTaxResult({
      totalTax,
      propertyTax,
      comprehensiveRealEstateTax
    });
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString("ko-KR");
  };

  return (
    <Card className="bg-white rounded-xl shadow-md p-2 mb-8">
      <CardContent className="pt-6">
        <h2 className="text-xl font-bold mb-6 flex items-center">
          <Building2 className="h-6 w-6 mr-2 text-[#FEE500]" />
          보유세 계산기 (재산세 + 종합부동산세)
        </h2>
        
        <div className="space-y-6">
          <div className="form-group">
            <Label htmlFor="publicPrice" className="block text-sm font-medium mb-2">공시가격 (만원)</Label>
            <Input
              id="publicPrice"
              type="text"
              value={publicPrice}
              onChange={handlePriceChange}
              placeholder="예: 90000"
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
              id="isRestricted" 
              checked={isRestricted} 
              onCheckedChange={(checked) => setIsRestricted(checked as boolean)}
            />
            <Label htmlFor="isRestricted" className="text-sm font-medium cursor-pointer">
              조정대상지역 여부
            </Label>
          </div>
          
          <div className="form-group flex items-center space-x-2">
            <Checkbox 
              id="isDiscounted" 
              checked={isDiscounted} 
              onCheckedChange={(checked) => setIsDiscounted(checked as boolean)}
            />
            <Label htmlFor="isDiscounted" className="text-sm font-medium cursor-pointer">
              연령 및 장기보유 감면 적용
            </Label>
          </div>
          
          <Button 
            onClick={calculateHoldingTax} 
            className="w-full py-3 px-4 bg-[#FEE500] text-[#333333] font-medium rounded-lg hover:shadow-md transition duration-200"
          >
            계산하기
          </Button>
        </div>
        
        {taxResult && (
          <div className="mt-8 p-4 bg-[#F5F6F7] rounded-lg space-y-2">
            <h3 className="text-lg font-bold mb-3">총 보유세: {formatNumber(taxResult.totalTax)}원</h3>
            <p className="text-sm">- 재산세: {formatNumber(taxResult.propertyTax)}원</p>
            <p className="text-sm">- 종합부동산세: {formatNumber(taxResult.comprehensiveRealEstateTax)}원</p>
            <p className="text-xs text-gray-500 mt-2">※ 실제 세액은 상세 공제 항목 및 지자체 세율에 따라 달라질 수 있습니다.</p>
          </div>
        )}

        <div className="mt-6 p-4 bg-[#F8F9FA] rounded-lg">
          <h3 className="text-sm font-medium mb-2">재산세 안내</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 6억원 이하 : 0.1%</li>
            <li>• 6억원 초과 ~ 9억원 이하 : 0.2%</li>
            <li>• 9억원 초과 : 0.3%</li>
            <li>• 재산세 과세 기준일은 매년 6월 1일입니다</li>
          </ul>
        </div>
        
        <div className="mt-4 p-4 bg-[#F8F9FA] rounded-lg">
          <h3 className="text-sm font-medium mb-2">종합부동산세 안내</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 1주택자 : 공시가격 12억원 초과분에 대해 과세</li>
            <li>• 다주택자 : 공시가격 6억원 초과분에 대해 과세</li>
            <li>• 기본세율 : 0.6%</li>
            <li>• 다주택 조정대상지역 : 1.2%</li>
            <li>• 65세 이상 또는 5년 이상 장기보유 시 30% 감면 가능</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}