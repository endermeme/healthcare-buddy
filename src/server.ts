import express, { Request, Response } from 'express';
import cors from 'cors';
import { toZonedTime } from 'date-fns-tz';
import { vi } from 'date-fns/locale';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;
const HOST = '192.168.1.15';

interface HealthLogRequest {
  bpm: number[];
  oxy: number[];
}

// Mock data storage
let healthLogs: any[] = [];

app.get('/log', (_req: Request, res: Response) => {
  // Generate some mock data if no data exists
  if (healthLogs.length === 0) {
    const mockData = {
      heartRate: Math.floor(Math.random() * (100 - 60) + 60),
      bloodOxygen: Math.floor(Math.random() * (100 - 95) + 95),
      timestamp: new Date().toISOString()
    };
    healthLogs.push(mockData);
  }
  return res.json(healthLogs[healthLogs.length - 1]);
});

app.post('/log', (req: Request<{}, {}, HealthLogRequest>, res: Response) => {
  const { bpm, oxy } = req.body;
  
  if (!Array.isArray(bpm) || !Array.isArray(oxy) || bpm.length !== oxy.length) {
    return res.status(400).json({ error: 'Invalid data format' });
  }

  const timeZone = 'Asia/Ho_Chi_Minh'; // UTC+7
  const now = new Date();
  
  const healthData = bpm.map((heartRate, index) => {
    const timestamp = toZonedTime(now, timeZone);
    timestamp.setSeconds(timestamp.getSeconds() + index);
    
    const data = {
      timestamp: timestamp.toISOString(),
      heartRate: Number(heartRate),
      bloodOxygen: Number(oxy[index])
    };
    healthLogs.push(data);
    return data;
  });

  return res.json(healthData);
});

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});