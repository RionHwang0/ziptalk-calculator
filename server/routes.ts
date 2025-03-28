import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { db } from "./db";
import { competitionData, apartments } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  app.post('/api/calculate-score', async (req, res) => {
    const { age, noHomePeriod, dependents, subscriptionPeriod, income } = req.body;
    
    try {
      // Calculate the subscription score
      const result = await storage.calculateScore({
        age, 
        noHomePeriod, 
        dependents, 
        subscriptionPeriod, 
        income
      });
      
      res.json(result);
    } catch (error) {
      console.error('Error calculating score:', error);
      res.status(500).json({ error: 'Failed to calculate score' });
    }
  });

  // Upload competition data (Excel file)
  app.post('/api/competition-data', async (req, res) => {
    try {
      const { data } = req.body;
      
      if (!data || !Array.isArray(data) || data.length === 0) {
        return res.status(400).json({ error: 'Invalid data format' });
      }

      // Process the data
      const processedData = await storage.processCompetitionData(data);
      
      res.json(processedData);
    } catch (error) {
      console.error('Error processing competition data:', error);
      res.status(500).json({ error: 'Failed to process competition data' });
    }
  });

  // Get all competition data entries
  app.get('/api/competition-data/all', async (req, res) => {
    try {
      const entries = await db.select().from(competitionData);
      res.json(entries);
    } catch (error) {
      console.error('Error fetching competition data:', error);
      res.status(500).json({ error: 'Failed to fetch competition data' });
    }
  });

  // Delete competition data by ID
  app.delete('/api/competition-data/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(competitionData).where(eq(competitionData.id, id));
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting competition data:', error);
      res.status(500).json({ error: 'Failed to delete competition data' });
    }
  });

  // Get sample Excel template
  app.get('/api/competition-data/template', (req, res) => {
    try {
      // Create a sample Excel file
      const workbook = XLSX.utils.book_new();
      
      const data = [
        ['아파트명', '지역', '경쟁률', '최저 당첨 점수', '평균 당첨 점수', '위도', '경도'],
        ['래미안 아파트', '서울시 강남구', 45, 75, 82, 37.5066, 127.0562],
        ['푸르지오 아파트', '서울시 송파구', 32, 70, 78, 37.5145, 127.1059],
        ['e-편한세상', '인천시 연수구', 18, 65, 72, 37.4080, 126.6782],
        ['더샵 아파트', '경기도 성남시', 8, 60, 65, 37.4449, 127.1389]
      ];
      
      const worksheet = XLSX.utils.aoa_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, worksheet, '경쟁률 데이터');
      
      // Create a temporary file to send
      const tempFilePath = path.join('/tmp', 'competition_data_template.xlsx');
      XLSX.writeFile(workbook, tempFilePath);
      
      res.download(tempFilePath, '청약_경쟁률_데이터_템플릿.xlsx', (err) => {
        // Delete the temp file after sending
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }
        
        if (err) {
          console.error('Error sending template file:', err);
          res.status(500).end();
        }
      });
    } catch (error) {
      console.error('Error creating template:', error);
      res.status(500).json({ error: 'Failed to create template' });
    }
  });

  // Get apartments list
  app.get('/api/apartments', async (req, res) => {
    try {
      const apartments = await storage.getApartments();
      res.json(apartments);
    } catch (error) {
      console.error('Error fetching apartments:', error);
      res.status(500).json({ error: 'Failed to fetch apartments' });
    }
  });

  // Get apartment by ID
  app.get('/api/apartments/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const apartment = await storage.getApartment(id);
      
      if (!apartment) {
        return res.status(404).json({ error: 'Apartment not found' });
      }
      
      res.json(apartment);
    } catch (error) {
      console.error('Error fetching apartment:', error);
      res.status(500).json({ error: 'Failed to fetch apartment' });
    }
  });
  
  // Delete apartment by ID
  app.delete('/api/apartments/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Delete the apartment from the database
      await db.delete(apartments).where(eq(apartments.id, id));
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting apartment:', error);
      res.status(500).json({ error: 'Failed to delete apartment' });
    }
  });
  
  const httpServer = createServer(app);
  return httpServer;
}
