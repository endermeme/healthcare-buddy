import { Heart, Activity, BookOpen, HeartPulse } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  const handleClick = (feature: string) => {
    toast.info(`${feature} feature coming soon!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 px-4 py-12">
      <div className="mx-auto max-w-6xl animate-fade-in">
        <header className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">Health Assistant</h1>
          <p className="text-lg text-gray-600">Your personal health companion</p>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Main Health Assistant Card */}
          <div 
            className="health-card col-span-full bg-primary text-white lg:col-span-2"
            onClick={() => handleClick("Health Assistant")}
          >
            <Heart className="health-icon !bg-white/20 !text-white" size={32} />
            <h2 className="mb-2 text-2xl font-semibold">Health Assistant</h2>
            <p className="mb-4 text-white/90">Get personalized health advice and recommendations</p>
            <div className="absolute bottom-6 right-6">
              <HeartPulse className="animate-pulse" size={24} />
            </div>
          </div>

          {/* Health Monitoring Card */}
          <div 
            className="health-card bg-white"
            onClick={() => handleClick("Health Monitoring")}
          >
            <Activity className="health-icon" size={32} />
            <h2 className="mb-2 text-xl font-semibold text-gray-900">Health Monitoring</h2>
            <p className="text-gray-600">Track and analyze your health metrics</p>
          </div>

          {/* Health Articles Card */}
          <div 
            className="health-card bg-white"
            onClick={() => handleClick("Health Articles")}
          >
            <BookOpen className="health-icon" size={32} />
            <h2 className="mb-2 text-xl font-semibold text-gray-900">Health Articles</h2>
            <p className="text-gray-600">Read expert health tips and advice</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;