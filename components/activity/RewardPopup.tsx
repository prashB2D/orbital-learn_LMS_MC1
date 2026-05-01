"use client";

import { useEffect, useState, useCallback } from "react";
import confetti from "canvas-confetti";
import { Trophy, Award, Coins, X } from "lucide-react";

export default function RewardPopup() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const fetchUnseen = useCallback(async () => {
    try {
      const res = await fetch("/api/student/notifications/unseen");
      const data = await res.json();
      if (data.success && data.notifications.length > 0) {
        setNotifications(data.notifications);
        setIsOpen(true);
      }
    } catch (e) {
      console.error("Failed to fetch notifications", e);
    }
  }, []);

  useEffect(() => {
    fetchUnseen();
  }, [fetchUnseen]);

  useEffect(() => {
    if (isOpen) {
      // Fire confetti when a new popup opens
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#8b5cf6', '#eab308', '#22c55e']
      });

      // Also fire a second burst
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#8b5cf6', '#eab308', '#22c55e']
        });
      }, 500);
    }
  }, [isOpen, currentIndex]);

  const handleNextOrClose = async () => {
    if (!notifications[currentIndex]) return;
    
    // Mark current as seen
    try {
      await fetch(`/api/student/notifications/${notifications[currentIndex].id}/seen`, {
        method: "PUT"
      });
    } catch (e) {
      console.error(e);
    }

    if (currentIndex < notifications.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsOpen(false);
      // Wait a bit and check if more arrived
      setTimeout(fetchUnseen, 5000);
    }
  };

  if (!isOpen || !notifications[currentIndex]) return null;

  const currentNotification = notifications[currentIndex];
  let Icon = Trophy;
  let colorClass = "bg-blue-500";
  let textColor = "text-blue-500";
  
  if (currentNotification.type === "BADGE") {
    Icon = Award;
    colorClass = "bg-purple-500";
    textColor = "text-purple-600";
  } else if (currentNotification.type === "COIN") {
    Icon = Coins;
    colorClass = "bg-yellow-500";
    textColor = "text-yellow-600";
  } else if (currentNotification.type === "XP") {
    Icon = Trophy;
    colorClass = "bg-blue-500";
    textColor = "text-blue-600";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
      <div 
        className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-sm w-full animate-in fade-in zoom-in-95 duration-300 relative border-4 border-white"
      >
        <button 
          onClick={handleNextOrClose} 
          className="absolute top-4 right-4 text-white hover:bg-white/20 p-1 rounded-full transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className={`${colorClass} pt-12 pb-8 px-6 text-center relative overflow-hidden`}>
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent"></div>
          
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-lg relative z-10 mb-4 animate-bounce">
            <Icon className={`w-10 h-10 ${textColor}`} />
          </div>
          
          <h2 className="text-2xl font-black text-white relative z-10">
            {currentNotification.title}
          </h2>
        </div>

        <div className="p-6 text-center space-y-4">
          <p className="text-gray-700 font-medium">
            {currentNotification.message}
          </p>

          {currentNotification.payload && currentNotification.payload.reason && (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 italic text-gray-600 text-sm">
              "{currentNotification.payload.reason}"
            </div>
          )}

          {currentNotification.payload && currentNotification.payload.awardedBy && (
            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-4">
              From Mentor {currentNotification.payload.awardedBy}
            </div>
          )}

          <button 
            onClick={handleNextOrClose}
            className={`w-full py-3 mt-4 text-white font-bold rounded-xl shadow-md transition-transform active:scale-95 ${colorClass} hover:brightness-110`}
          >
            {currentIndex < notifications.length - 1 ? "Next Reward" : "Awesome!"}
          </button>
        </div>
      </div>
    </div>
  );
}
