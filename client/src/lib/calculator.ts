export interface CalculatorInput {
  age: number;
  noHomePeriod: number;
  dependents: number;
  subscriptionPeriod: number;
  income: number;
}

export interface CalculatedScore {
  ageScore: number;
  noHomePeriodScore: number;
  dependentsScore: number;
  subscriptionPeriodScore: number;
  incomeScore: number;
  totalScore: number;
  probability: number;
}

export class Calculator {
  
  /**
   * Calculate subscription score based on input parameters
   */
  static calculateScore(input: CalculatorInput): CalculatedScore {
    // Age score calculation (max 20)
    let ageScore = 0;
    if (input.age >= 40) {
      ageScore = 20; // Maximum score for age 40+
    } else if (input.age >= 35) {
      ageScore = 15;
    } else if (input.age >= 30) {
      ageScore = 10;
    } else if (input.age >= 25) {
      ageScore = 5;
    } else {
      ageScore = 2;
    }
    
    // No home period score calculation (max 20)
    const noHomePeriodScore = Math.min(20, input.noHomePeriod);
    
    // Dependents score calculation (max 30)
    let dependentsScore = 0;
    if (input.dependents >= 3) {
      dependentsScore = 30; // Maximum score for 3+ dependents
    } else if (input.dependents === 2) {
      dependentsScore = 20;
    } else if (input.dependents === 1) {
      dependentsScore = 10;
    }
    
    // Subscription period score calculation (max 20)
    const subscriptionPeriodScore = Math.min(20, input.subscriptionPeriod);
    
    // Income score calculation (max 10)
    let incomeScore = 0;
    if (input.income <= 2000) {
      incomeScore = 10; // Maximum score for income under 20M KRW
    } else if (input.income <= 4000) {
      incomeScore = 5;
    } else if (input.income <= 6000) {
      incomeScore = 2;
    }
    
    // Calculate total score (max 100)
    const totalScore = Math.min(100, ageScore + noHomePeriodScore + dependentsScore + subscriptionPeriodScore + incomeScore);
    
    // Calculate probability based on total score
    // This is a simple linear calculation - in a real app this would be more complex
    const probability = Math.min(100, Math.round(totalScore * 0.9));
    
    return {
      ageScore,
      noHomePeriodScore,
      dependentsScore,
      subscriptionPeriodScore,
      incomeScore,
      totalScore,
      probability
    };
  }
}
