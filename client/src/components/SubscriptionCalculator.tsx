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
              <SelectTrigger className="w-full p-3 border rounded-lg">
                <SelectValue placeholder="나이 선택" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 52 }, (_, i) => i + 19).map((age) => (
                  <SelectItem key={age} value={age.toString()}>
                    {age}세
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* No Home Period Field */}
          <div className="form-group">
            <Label htmlFor="noHomePeriod" className="block text-sm font-medium mb-2">무주택 기간</Label>
            <Select value={formData.noHomePeriod} onValueChange={(value) => handleChange("noHomePeriod", value)}>
              <SelectTrigger className="w-full p-3 border rounded-lg">
                <SelectValue placeholder="무주택 기간 선택" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 21 }, (_, i) => i).map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}년
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Dependents Field */}
          <div className="form-group">
            <Label htmlFor="dependents" className="block text-sm font-medium mb-2">부양 가족 수</Label>
            <Select value={formData.dependents} onValueChange={(value) => handleChange("dependents", value)}>
              <SelectTrigger className="w-full p-3 border rounded-lg">
                <SelectValue placeholder="부양 가족 수 선택" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 7 }, (_, i) => i).map((count) => (
                  <SelectItem key={count} value={count.toString()}>
                    {count}명
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Subscription Period Field */}
          <div className="form-group">
            <Label htmlFor="subscriptionPeriod" className="block text-sm font-medium mb-2">청약 통장 가입 기간</Label>
            <Select value={formData.subscriptionPeriod} onValueChange={(value) => handleChange("subscriptionPeriod", value)}>
              <SelectTrigger className="w-full p-3 border rounded-lg">
                <SelectValue placeholder="가입 기간 선택" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 21 }, (_, i) => i).map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}년
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Income Field */}
          <div className="form-group">
            <Label htmlFor="income" className="block text-sm font-medium mb-2">연간 소득</Label>
            <Select value={formData.income} onValueChange={(value) => handleChange("income", value)}>
              <SelectTrigger className="w-full p-3 border rounded-lg">
                <SelectValue placeholder="연간 소득 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1000">1,000만원 미만</SelectItem>
                <SelectItem value="2000">1,000-2,000만원</SelectItem>
                <SelectItem value="3000">2,000-3,000만원</SelectItem>
                <SelectItem value="4000">3,000-4,000만원</SelectItem>
                <SelectItem value="5000">4,000-5,000만원</SelectItem>
                <SelectItem value="6000">5,000-6,000만원</SelectItem>
                <SelectItem value="7000">6,000만원 이상</SelectItem>
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
