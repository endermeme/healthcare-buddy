import { Heart, Activity, BookOpen, HeartPulse, Home, User, Plus, Menu } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const Index = () => {
  const handleClick = (feature: string) => {
    toast.info(`${feature} feature coming soon!`);
  };

  const stats = {
    steps: "8k",
    water: "2.1",
    calories: "1.2k",
    pulse: "78",
    weight: "64"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200"></div>
          <span className="font-medium">Jillian Hanson</span>
        </div>
        <Button variant="ghost" size="icon">
          <Menu className="h-6 w-6" />
        </Button>
      </header>

      {/* Main Content */}
      <main className="p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Health Overview</h1>
          <p className="text-gray-500 text-sm">Your Daily Health Statistics</p>
        </div>

        <div className="grid gap-4">
          {/* Steps Card */}
          <div className="bg-white p-4 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div>
                <span className="text-3xl font-bold">{stats.steps}</span>
                <p className="text-sm text-gray-500">Steps</p>
              </div>
              <div className="text-xs text-gray-500">Out of 10,000</div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Water */}
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <h3 className="text-gray-500 mb-2">Water</h3>
              <div className="flex items-baseline">
                <span className="text-2xl font-bold">{stats.water}</span>
                <span className="text-sm text-gray-500 ml-1">Liters</span>
              </div>
            </div>

            {/* Calories */}
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <h3 className="text-gray-500 mb-2">Calories</h3>
              <div className="flex items-baseline">
                <span className="text-2xl font-bold">{stats.calories}</span>
                <span className="text-sm text-gray-500 ml-1">kCal</span>
              </div>
            </div>

            {/* Pulse & Weight */}
            <div className="col-span-2 bg-primary-light p-4 rounded-xl">
              <div className="flex justify-between">
                <div>
                  <h3 className="text-gray-600 mb-2">Pulse</h3>
                  <div className="flex items-baseline">
                    <span className="text-2xl font-bold">{stats.pulse}</span>
                    <span className="text-sm text-gray-500 ml-1">BPM</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-gray-600 mb-2">Weight</h3>
                  <div className="flex items-baseline">
                    <span className="text-2xl font-bold">{stats.weight}</span>
                    <span className="text-sm text-gray-500 ml-1">KG</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around items-center p-3">
        <Button variant="ghost" size="icon" onClick={() => handleClick("Home")}>
          <Home className="h-6 w-6" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => handleClick("Activity")}>
          <Activity className="h-6 w-6" />
        </Button>
        <Button 
          className="rounded-full bg-primary text-white -mt-8 p-4 shadow-lg"
          size="icon"
          onClick={() => handleClick("Add")}
        >
          <Plus className="h-6 w-6" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => handleClick("Health Articles")}>
          <BookOpen className="h-6 w-6" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => handleClick("Profile")}>
          <User className="h-6 w-6" />
        </Button>
      </nav>
    </div>
  );
};

export default Index;