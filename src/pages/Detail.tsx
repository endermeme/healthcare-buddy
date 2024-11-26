import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';
import { HealthChart } from '@/components/HealthChart';
import { useHealthData } from '@/hooks/useHealthData';

const Detail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { history } = useHealthData('1h');
  
  if (!history.length) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => navigate('/history')}
        className="mb-4"
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>

      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Chi tiết theo dõi</h1>
        <HealthChart data={history} />
      </div>
    </div>
  );
};

export default Detail;