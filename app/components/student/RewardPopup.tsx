"use client";

import { useEffect, useState, useCallback } from "react";
import { Trophy, Coins, X } from "lucide-react";

type RewardNotification = {
  id: string;
  type: "XP" | "BADGE" | "COIN";
  payload: any;
};

export default function RewardPopup() {
  const [queue, setQueue] = useState<RewardNotification[]>([]);
  const [current, setCurrent] = useState<RewardNotification | null>(null);
  const [visible, setVisible] = useState(false);

  const fetchUnseen = useCallback(async () => {
    try {
      const res = await fetch("/api/student/notifications/unseen");
      if (res.ok) {
        const data = await res.json();
        if (data.notifications?.length > 0) {
          setQueue(prev => {
            const newNotifs = data.notifications.filter((n: any) => !prev.some(p => p.id === n.id) && current?.id !== n.id);
            return [...prev, ...newNotifs];
          });
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [current]);

  useEffect(() => {
    fetchUnseen();
    const interval = setInterval(fetchUnseen, 30000); // 30s
    return () => clearInterval(interval);
  }, [fetchUnseen]);

  useEffect(() => {
    if (!current && queue.length > 0) {
      setCurrent(queue[0]);
      setQueue(q => q.slice(1));
      setVisible(true);
    }
  }, [queue, current]);

  const handleDismiss = async () => {
    if (!current) return;
    setVisible(false);
    try {
      await fetch(`/api/student/notifications/${current.id}/seen`, { method: "PUT" });
    } catch (e) {
      console.error(e);
    }
    setTimeout(() => {
      setCurrent(null);
    }, 300); // Wait for exit animation
  };

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [visible, current]);

  if (!current) return null;

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center pointer-events-none transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-0 bg-black/20 pointer-events-auto" onClick={handleDismiss} />
      
      <div className={`relative bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-sm w-full mx-4 pointer-events-auto transform transition-all duration-500 ease-out ${visible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}`}>
        {/* CSS Confetti */}
        {visible && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
            <div className="confetti-piece" style={{left: '10%', animationDelay: '0s'}}></div>
            <div className="confetti-piece" style={{left: '20%', animationDelay: '0.1s'}}></div>
            <div className="confetti-piece" style={{left: '30%', animationDelay: '0.2s'}}></div>
            <div className="confetti-piece" style={{left: '40%', animationDelay: '0.3s'}}></div>
            <div className="confetti-piece" style={{left: '50%', animationDelay: '0s'}}></div>
            <div className="confetti-piece" style={{left: '60%', animationDelay: '0.1s'}}></div>
            <div className="confetti-piece" style={{left: '70%', animationDelay: '0.2s'}}></div>
            <div className="confetti-piece" style={{left: '80%', animationDelay: '0.3s'}}></div>
            <div className="confetti-piece" style={{left: '90%', animationDelay: '0.1s'}}></div>
          </div>
        )}

        <button onClick={handleDismiss} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full p-1 z-10">
          <X className="w-5 h-5" />
        </button>

        <div className="text-center relative z-10">
          {current.type === "XP" && (
            <div className="space-y-4">
              <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto animate-bounce-slow">
                <Trophy className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">XP Earned!</h3>
              <div className="text-4xl font-black text-blue-600 my-2 count-up">+{current.payload?.amount} XP</div>
              <p className="font-bold text-gray-700">Skill: {current.payload?.skillName}</p>
              {current.payload?.leveledUp && (
                <p className="text-sm font-bold text-green-600 bg-green-50 py-1 px-3 rounded-full inline-block mt-1">Level {current.payload?.newLevel} Reached!</p>
              )}
              {current.payload?.reason && (
                <p className="text-sm text-gray-600 italic bg-gray-50 p-2 rounded-lg mt-2">"{current.payload?.reason}"</p>
              )}
            </div>
          )}

          {current.type === "BADGE" && (
            <div className="space-y-4">
              <div className="text-6xl mx-auto flex items-center justify-center animate-[spin_1s_ease-out_1]">
                {current.payload?.badgeIcon || '🏅'}
              </div>
              <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Badge Unlocked!</h3>
              <p className="text-xl font-bold text-purple-600">{current.payload?.badgeName}</p>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500">{current.payload?.rarity} Rarity</p>
              {current.payload?.reason && (
                <p className="text-sm text-gray-600 italic bg-gray-50 p-2 rounded-lg mt-2">"{current.payload?.reason}"</p>
              )}
            </div>
          )}

          {current.type === "COIN" && (
            <div className="space-y-4">
              <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <Coins className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Coins Rewarded!</h3>
              <div className="text-4xl font-black text-yellow-500 my-2">+{current.payload?.amount}</div>
              {current.payload?.quizName && (
                <p className="font-bold text-gray-700">Quiz: {current.payload?.quizName}</p>
              )}
              {current.payload?.rank && (
                <p className="text-sm font-bold text-orange-600 bg-orange-50 py-1 px-3 rounded-full inline-block mt-1">Rank #{current.payload?.rank}</p>
              )}
              {current.payload?.reason && (
                <p className="text-sm text-gray-600 italic bg-gray-50 p-2 rounded-lg mt-2">"{current.payload?.reason}"</p>
              )}
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              From Mentor {current.payload?.mentorName || 'System'}
            </p>
            <button onClick={handleDismiss} className="w-full mt-3 bg-gray-900 text-white font-bold py-3 px-4 rounded-xl hover:bg-black transition transform active:scale-95">
              Awesome!
            </button>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes confetti-fall {
          0% { transform: translateY(-100%) rotate(0deg); opacity: 1; }
          100% { transform: translateY(1000%) rotate(720deg); opacity: 0; }
        }
        .confetti-piece {
          position: absolute;
          width: 10px;
          height: 20px;
          background-color: #facc15;
          top: -20px;
          opacity: 0;
          animation: confetti-fall 1.5s ease-out forwards;
        }
        .confetti-piece:nth-child(2n) { background-color: #3b82f6; width: 12px; height: 12px; border-radius: 50%; }
        .confetti-piece:nth-child(3n) { background-color: #ef4444; width: 15px; height: 5px; }
        .confetti-piece:nth-child(4n) { background-color: #10b981; }
        .animate-bounce-slow { animation: bounce 2s infinite; }
      `}} />
    </div>
  );
}
