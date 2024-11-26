import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Heart, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchHealthData, HealthData } from '@/services/healthData';
import { LogViewer } from '@/components/LogViewer';

const History = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-2xl font-bold mb-6">Lịch sử theo dõi</h1>
      <LogViewer />
    </div>
  );
};

export default History;