import { Link, useLocation } from "react-router-dom";
import { Home, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export const BottomNav = () => {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
      <div className="container mx-auto px-4">
        <div className="flex justify-around py-2">
          <Link
            to="/"
            className={cn(
              "flex flex-col items-center p-2 text-gray-600",
              location.pathname === "/" && "text-primary"
            )}
          >
            <Home className="h-6 w-6" />
            <span className="text-xs mt-1">Home</span>
          </Link>

          <Link
            to="/chat"
            className={cn(
              "flex flex-col items-center p-2 text-gray-600",
              location.pathname === "/chat" && "text-primary"
            )}
          >
            <MessageCircle className="h-6 w-6" />
            <span className="text-xs mt-1">Chat</span>
          </Link>
        </div>
      </div>
    </div>
  );
};