import { useState } from "react";
import { Calculator } from "@/lib/calculator";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator as CalculatorIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SubscriptionCalculatorProps {
  onCalculate: (score: ReturnType<typeof Calculator.calculateScore>) => void;
}

export default function SubscriptionCalculator({ onCalculate }: SubscriptionCalculatorProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    age: "",
    noHomePeriod: "",
    dependents: "",
    subscriptionPeriod: "",
    income: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    // Validate form
    if (!formData.age || !formData.noHomePeriod || !formData.dependents || 
        !formData.subscriptionPeriod || !formData.income) {
      toast({
        title: "입력 오류",
        description: "모든 항목을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    // Calculate score
    const result = Calculator.calculateScore({
      age: parseInt(formData.age),
      noHomePeriod: parseInt(formData.noHomePeriod),
      dependents: parseInt(formData.dependents),
      subscriptionPeriod: parseInt(formData.subscriptionPeriod),
      income: parseInt(formData.income),
    });

    onCalculate(result);
  };

  return (
    <Card className="bg-white rounded-xl shadow-md p-2 mb-8">
      <CardContent className="pt-6">
        <h2 className="text-xl font-bold mb-6 flex items-center">
          <CalculatorIcon className="h-6 w-6 mr-2 text-[#FEE500]" />
          청약 점수 계산하기
        </h2>
        
        <form id="subscription-score-form" className="space-y-5" onSubmit={handleSubmit}>
          {/* Age Field */}
          <div className="form-group">
            <Label htmlFor="age" className="block text-sm font-medium mb-2">나이</Label>
            <Select value={formData.age} onValueChange={(value) => handleChange("age", value)}>
              <SelectTrigger className="w-full p-3 border rounded-lg bg-white">
                <SelectValue placeholder="나이 선택" className="text-gray-900" />
              </SelectTrigger>
              <SelectContent className="max-h-[15rem] overflow-y-auto bg-white z-50">
                <SelectItem value="19" className="bg-white hover:bg-gray-100">19세 미만</SelectItem>
                <SelectItem value="20" className="bg-white hover:bg-gray-100">20-24세</SelectItem>
                <SelectItem value="25" className="bg-white hover:bg-gray-100">25-29세</SelectItem>
                <SelectItem value="30" className="bg-white hover:bg-gray-100">30-34세</SelectItem>
                <SelectItem value="35" className="bg-white hover:bg-gray-100">35-39세</SelectItem>
                <SelectItem value="40" className="bg-white hover:bg-gray-100">40-44세</SelectItem>
                <SelectItem value="45" className="bg-white hover:bg-gray-100">45-49세</SelectItem>
                <SelectItem value="50" className="bg-white hover:bg-gray-100">50-54세</SelectItem>
                <SelectItem value="55" className="bg-white hover:bg-gray-100">55-59세</SelectItem>
                <SelectItem value="60" className="bg-white hover:bg-gray-100">60-64세</SelectItem>
                <SelectItem value="65" className="bg-white hover:bg-gray-100">65세 이상</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* No Home Period Field */}
          <div className="form-group">
            <Label htmlFor="noHomePeriod" className="block text-sm font-medium mb-2">무주택 기간</Label>
            <Select value={formData.noHomePeriod} onValueChange={(value) => handleChange("noHomePeriod", value)}>
              <SelectTrigger className="w-full p-3 border rounded-lg bg-white">
                <SelectValue placeholder="무주택 기간 선택" className="text-gray-900" />
              </SelectTrigger>
              <SelectContent className="max-h-[15rem] overflow-y-auto bg-white z-50">
                <SelectItem value="0" className="bg-white hover:bg-gray-100">없음</SelectItem>
                <SelectItem value="1" className="bg-white hover:bg-gray-100">1년 미만</SelectItem>
                <SelectItem value="2" className="bg-white hover:bg-gray-100">1-2년</SelectItem>
                <SelectItem value="3" className="bg-white hover:bg-gray-100">2-3년</SelectItem>
                <SelectItem value="4" className="bg-white hover:bg-gray-100">3-4년</SelectItem>
                <SelectItem value="5" className="bg-white hover:bg-gray-100">4-5년</SelectItem>
                <SelectItem value="8" className="bg-white hover:bg-gray-100">5-8년</SelectItem>
                <SelectItem value="10" className="bg-white hover:bg-gray-100">8-10년</SelectItem>
                <SelectItem value="12" className="bg-white hover:bg-gray-100">10-12년</SelectItem>
                <SelectItem value="15" className="bg-white hover:bg-gray-100">12-15년</SelectItem>
                <SelectItem value="20" className="bg-white hover:bg-gray-100">15년 이상</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Dependents Field */}
          <div className="form-group">
            <Label htmlFor="dependents" className="block text-sm font-medium mb-2">부양 가족 수</Label>
            <Select value={formData.dependents} onValueChange={(value) => handleChange("dependents", value)}>
              <SelectTrigger className="w-full p-3 border rounded-lg bg-white">
                <SelectValue placeholder="부양 가족 수 선택" className="text-gray-900" />
              </SelectTrigger>
              <SelectContent className="max-h-[15rem] overflow-y-auto bg-white z-50">
                <SelectItem value="0" className="bg-white hover:bg-gray-100">없음</SelectItem>
                <SelectItem value="1" className="bg-white hover:bg-gray-100">1명</SelectItem>
                <SelectItem value="2" className="bg-white hover:bg-gray-100">2명</SelectItem>
                <SelectItem value="3" className="bg-white hover:bg-gray-100">3명</SelectItem>
                <SelectItem value="4" className="bg-white hover:bg-gray-100">4명</SelectItem>
                <SelectItem value="5" className="bg-white hover:bg-gray-100">5명</SelectItem>
                <SelectItem value="6" className="bg-white hover:bg-gray-100">6명 이상</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Subscription Period Field */}
          <div className="form-group">
            <Label htmlFor="subscriptionPeriod" className="block text-sm font-medium mb-2">청약 통장 가입 기간</Label>
            <Select value={formData.subscriptionPeriod} onValueChange={(value) => handleChange("subscriptionPeriod", value)}>
              <SelectTrigger className="w-full p-3 border rounded-lg bg-white">
                <SelectValue placeholder="가입 기간 선택" className="text-gray-900" />
              </SelectTrigger>
              <SelectContent className="max-h-[15rem] overflow-y-auto bg-white z-50">
                <SelectItem value="0" className="bg-white hover:bg-gray-100">없음</SelectItem>
                <SelectItem value="1" className="bg-white hover:bg-gray-100">1년 미만</SelectItem>
                <SelectItem value="2" className="bg-white hover:bg-gray-100">1-2년</SelectItem>
                <SelectItem value="3" className="bg-white hover:bg-gray-100">2-3년</SelectItem>
                <SelectItem value="4" className="bg-white hover:bg-gray-100">3-4년</SelectItem>
                <SelectItem value="5" className="bg-white hover:bg-gray-100">4-5년</SelectItem>
                <SelectItem value="6" className="bg-white hover:bg-gray-100">5-6년</SelectItem>
                <SelectItem value="7" className="bg-white hover:bg-gray-100">6-7년</SelectItem>
                <SelectItem value="8" className="bg-white hover:bg-gray-100">7-8년</SelectItem>
                <SelectItem value="9" className="bg-white hover:bg-gray-100">8-9년</SelectItem>
                <SelectItem value="10" className="bg-white hover:bg-gray-100">9-10년</SelectItem>
                <SelectItem value="15" className="bg-white hover:bg-gray-100">10-15년</SelectItem>
                <SelectItem value="20" className="bg-white hover:bg-gray-100">15년 이상</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Income Field */}
          <div className="form-group">
            <Label htmlFor="income" className="block text-sm font-medium mb-2">연간 소득</Label>
            <Select value={formData.income} onValueChange={(value) => handleChange("income", value)}>
              <SelectTrigger className="w-full p-3 border rounded-lg bg-white">
                <SelectValue placeholder="연간 소득 선택" className="text-gray-900" />
              </SelectTrigger>
              <SelectContent className="max-h-[15rem] overflow-y-auto bg-white z-50">
                <SelectItem value="1000" className="bg-white hover:bg-gray-100">1,000만원 미만</SelectItem>
                <SelectItem value="2000" className="bg-white hover:bg-gray-100">1,000-2,000만원</SelectItem>
                <SelectItem value="3000" className="bg-white hover:bg-gray-100">2,000-3,000만원</SelectItem>
                <SelectItem value="4000" className="bg-white hover:bg-gray-100">3,000-4,000만원</SelectItem>
                <SelectItem value="5000" className="bg-white hover:bg-gray-100">4,000-5,000만원</SelectItem>
                <SelectItem value="6000" className="bg-white hover:bg-gray-100">5,000-6,000만원</SelectItem>
                <SelectItem value="7000" className="bg-white hover:bg-gray-100">6,000만원 이상</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            type="submit" 
            className="w-full py-3 px-4 bg-[#FEE500] text-[#333333] font-medium rounded-lg hover:shadow-md transition duration-200"
          >
            점수 계산하기
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
