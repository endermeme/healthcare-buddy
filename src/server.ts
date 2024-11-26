import express, { Request, Response } from 'express';
import cors from 'cors';
import { toZonedTime } from 'date-fns-tz';
import { vi } from 'date-fns/locale';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;

interface HealthLogRequest {
  bpm: number[];
  oxy: number[];
}

app.post('/api/health-log', (req: Request<{}, {}, HealthLogRequest>, res: Response) => {
  const { bpm, oxy } = req.body;
  
  if (!Array.isArray(bpm) || !Array.isArray(oxy) || bpm.length !== oxy.length) {
    return res.status(400).json({ error: 'Invalid data format' });
  }

  const timeZone = 'Asia/Ho_Chi_Minh'; // UTC+7
  const now = new Date();
  
  const healthData = bpm.map((heartRate, index) => {
    const timestamp = toZonedTime(now, timeZone);
    timestamp.setSeconds(timestamp.getSeconds() + index);
    
    return {
      timestamp: timestamp.toISOString(),
      heartRate: Number(heartRate),
      bloodOxygen: Number(oxy[index])
    };
  });

  return res.json(healthData);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});