import { useNavigate } from 'react-router-dom';
import { ChatContainer } from '@/components/chat/ChatContainer';

export default function Chat() {
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate(-1);
  };

  return <ChatContainer onBack={handleBack} />;
}