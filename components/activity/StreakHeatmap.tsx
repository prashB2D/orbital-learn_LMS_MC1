"use client";

import { useState, useEffect } from "react";
import { Flame, Info } from "lucide-react";

export default function StreakHeatmap() {
  const [data, setData] = useState<{ currentStreak: number, longestStreak: number, heatmap: any[] } | null>(null);

  useEffect(() => {
    fetch("/api/student/activity/streak")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setData(data);
        }
      });
  }, []);

  if (!data) return <div className="h-40 flex items-center justify-center">Loading streak...</div>;

  const getIntensityColor = (intensity: number) => {
    switch (intensity) {
      case 0: return "bg-gray-100 border-gray-200";
      case 1: return "bg-green-200 border-green-300";
      case 2: return "bg-green-400 border-green-500";
      case 3: return "bg-green-600 border-green-700";
      default: return "bg-gray-100 border-gray-200";
    }
  };

  const handleActionClick = async (actionType: string) => {
    // Quick mock action to keep streak alive
    try {
      const res = await fetch("/api/student/activity/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ actionType })
      });
      const resData = await res.json();
      if (resData.success) {
        // Refetch to update heatmap immediately
        const fetchRes = await fetch("/api/student/activity/streak");
        const freshData = await fetchRes.json();
        if (freshData.success) setData(freshData);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-white rounded-xl border p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Flame className="w-6 h-6 text-orange-500" />
          Daily Streak
        </h2>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <span className="block text-2xl font-black text-orange-600">{data.currentStreak} <span className="text-sm font-bold">Days</span></span>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Current</span>
          </div>
          <div className="w-px h-8 bg-gray-200"></div>
          <div className="text-center">
            <span className="block text-2xl font-black text-gray-900">{data.longestStreak} <span className="text-sm font-bold">Days</span></span>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Longest</span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid (365 days) */}
      <div className="w-full overflow-x-auto pb-4">
        <div 
          className="grid gap-1 min-w-max"
          style={{ 
            gridTemplateRows: 'repeat(7, 1fr)', 
            gridAutoFlow: 'column',
            gridTemplateColumns: 'repeat(53, 1fr)' 
          }}
        >
          {data.heatmap.map((day: any, i: number) => (
            <div 
              key={i} 
              className={`w-3 h-3 md:w-4 md:h-4 rounded-sm border relative group cursor-pointer ${getIntensityColor(day.intensity)}`}
            >
              {/* Tooltip */}
              <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-10 hidden md:block">
                {new Date(day.date).toLocaleDateString()}: {day.videosWatched} videos, {day.quizzesTaken} quizzes
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-sm font-bold text-gray-700 mb-3">Keep Your Streak Alive!</h3>
        <p className="text-sm text-gray-500">Complete quizzes to maintain your daily streak and earn XP.</p>
      </div>
    </div>
  );
}
