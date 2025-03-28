import { 
  users, type User, type InsertUser,
  subscriptionScores, type SubscriptionScore, type InsertScore,
  apartments, type Apartment, type InsertApartment,
  competitionData, type CompetitionData, type InsertCompetitionData
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Storage interface with all CRUD methods
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Score operations
  calculateScore(data: {
    age: number;
    noHomePeriod: number;
    dependents: number;
    subscriptionPeriod: number;
    income: number;
  }): Promise<any>;
  
  // Competition data operations
  processCompetitionData(data: any[]): Promise<any>;
  
  // Apartment operations
  getApartments(): Promise<any[]>;
  getApartment(id: number): Promise<any | undefined>;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Score calculation
  async calculateScore(data: {
    age: number;
    noHomePeriod: number;
    dependents: number;
    subscriptionPeriod: number;
    income: number;
  }): Promise<any> {
    // Age score calculation (max 20)
    let ageScore = 0;
    if (data.age >= 40) {
      ageScore = 20; // Maximum score for age 40+
    } else if (data.age >= 35) {
      ageScore = 15;
    } else if (data.age >= 30) {
      ageScore = 10;
    } else if (data.age >= 25) {
      ageScore = 5;
    } else {
      ageScore = 2;
    }
    
    // No home period score calculation (max 20)
    const noHomePeriodScore = Math.min(20, data.noHomePeriod);
    
    // Dependents score calculation (max 30)
    let dependentsScore = 0;
    if (data.dependents >= 3) {
      dependentsScore = 30; // Maximum score for 3+ dependents
    } else if (data.dependents === 2) {
      dependentsScore = 20;
    } else if (data.dependents === 1) {
      dependentsScore = 10;
    }
    
    // Subscription period score calculation (max 20)
    const subscriptionPeriodScore = Math.min(20, data.subscriptionPeriod);
    
    // Income score calculation (max 10)
    let incomeScore = 0;
    if (data.income <= 2000) {
      incomeScore = 10; // Maximum score for income under 20M KRW
    } else if (data.income <= 4000) {
      incomeScore = 5;
    } else if (data.income <= 6000) {
      incomeScore = 2;
    }
    
    // Calculate total score (max 100)
    const totalScore = Math.min(100, ageScore + noHomePeriodScore + dependentsScore + subscriptionPeriodScore + incomeScore);
    
    // Calculate probability based on total score
    // This is a simple linear calculation - in a real app this would be more complex
    const probability = Math.min(100, Math.round(totalScore * 0.9));
    
    // Save the score to the database
    const [savedScore] = await db.insert(subscriptionScores)
      .values({
        userId: 1, // Default user ID for now
        age: data.age,
        noHomePeriod: data.noHomePeriod,
        dependents: data.dependents,
        subscriptionPeriod: data.subscriptionPeriod,
        income: data.income,
        totalScore
      })
      .returning();

    return {
      ageScore,
      noHomePeriodScore,
      dependentsScore,
      subscriptionPeriodScore,
      incomeScore,
      totalScore,
      probability,
      id: savedScore.id
    };
  }

  // Process competition data from Excel
  async processCompetitionData(data: any[]): Promise<any> {
    // Calculate national average competition rate
    const nationalAvg = 12.9; // This would come from a real data source
    
    // Process apartments from the data and save to database
    const processedApartments = [];
    
    for (const row of data) {
      // Extract data from the Excel row
      const name = row['아파트명'] || row[0];
      const location = row['지역'] || row[1];
      const competitionRate = parseFloat(row['경쟁률'] || row[2]);
      const minScore = parseInt(row['최저 당첨 점수'] || row[3]);
      const avgScore = parseInt(row['평균 당첨 점수'] || row[4]);
      const lat = parseFloat(row['위도'] || row[5]);
      const lng = parseFloat(row['경도'] || row[6]);
      
      // Save apartment to database
      const [apartment] = await db.insert(apartments)
        .values({
          name,
          location,
          competitionRate,
          minScore,
          avgScore,
          coordinates: { lat, lng }
        })
        .returning();
      
      // Determine competition level
      let level: 'high' | 'medium' | 'low' = this.getCompetitionLevel(competitionRate);
      
      // Add to processed apartments
      processedApartments.push({
        id: apartment.id,
        name,
        location,
        competitionRate,
        level,
        requiredScore: avgScore,
        coordinates: { lat, lng }
      });
    }
    
    // Calculate the average competition rate
    const avgCompetitionRate = processedApartments.reduce(
      (acc, apt) => acc + apt.competitionRate, 0
    ) / processedApartments.length;
    
    // Store the competition data in the database
    const [competitionDataEntry] = await db.insert(competitionData)
      .values({
        userId: 1, // Default user ID
        fileName: 'uploaded_competition_data.xlsx',
        data: processedApartments
      })
      .returning();
    
    // Return processed data for the frontend
    return {
      apartments: processedApartments,
      averageCompetitionRate: avgCompetitionRate,
      nationalAvgDiff: avgCompetitionRate - nationalAvg,
      winningChance: 3.9, // This would be calculated based on real data
      requiredScore: 72, // Average score needed for winning
      recentApartments: processedApartments.slice(0, 4).map(apt => ({
        id: apt.id,
        name: apt.name,
        location: apt.location,
        competitionRate: apt.competitionRate,
        minScore: apt.requiredScore - 5,
        avgScore: apt.requiredScore
      }))
    };
  }

  // Get all apartments
  async getApartments(): Promise<any[]> {
    const apartmentsList = await db.select().from(apartments);
    
    return apartmentsList.map(apt => ({
      id: apt.id,
      name: apt.name,
      location: apt.location,
      competitionRate: apt.competitionRate,
      level: this.getCompetitionLevel(apt.competitionRate),
      requiredScore: apt.avgScore,
      coordinates: apt.coordinates
    }));
  }

  // Get apartment by ID
  async getApartment(id: number): Promise<any | undefined> {
    const [apartment] = await db.select().from(apartments).where(eq(apartments.id, id));
    
    if (!apartment) return undefined;
    
    return {
      id: apartment.id,
      name: apartment.name,
      location: apartment.location,
      competitionRate: apartment.competitionRate,
      level: this.getCompetitionLevel(apartment.competitionRate),
      requiredScore: apartment.avgScore,
      coordinates: apartment.coordinates
    };
  }

  // Helper to determine competition level
  private getCompetitionLevel(rate: number): 'high' | 'medium' | 'low' {
    if (rate >= 30) return 'high';
    if (rate >= 15) return 'medium';
    return 'low';
  }
  
  // Initialize with sample data if needed
  async initializeWithSampleData(): Promise<void> {
    // Check if there are any apartments
    const apartmentCount = await db.select().from(apartments);
    
    // If there are no apartments, add sample data
    if (apartmentCount.length === 0) {
      const sampleApartments = [
        {
          name: '래미안 아파트',
          location: '서울시 강남구',
          competitionRate: 45,
          minScore: 75,
          avgScore: 82,
          coordinates: { lat: 37.5066, lng: 127.0562 },
        },
        {
          name: '푸르지오 아파트',
          location: '서울시 송파구',
          competitionRate: 32,
          minScore: 70,
          avgScore: 78,
          coordinates: { lat: 37.5145, lng: 127.1059 },
        },
        {
          name: 'e-편한세상',
          location: '인천시 연수구',
          competitionRate: 18,
          minScore: 65,
          avgScore: 72,
          coordinates: { lat: 37.4080, lng: 126.6782 },
        },
        {
          name: '더샵 아파트',
          location: '경기도 성남시',
          competitionRate: 8,
          minScore: 60,
          avgScore: 65,
          coordinates: { lat: 37.4449, lng: 127.1389 },
        }
      ];

      for (const apt of sampleApartments) {
        await db.insert(apartments).values(apt);
      }
    }
  }
}

export const storage = new DatabaseStorage();

// Initialize sample data
(async () => {
  try {
    await (storage as DatabaseStorage).initializeWithSampleData();
    console.log('Database initialized with sample data');
  } catch (error) {
    console.error('Error initializing database with sample data:', error);
  }
})();
