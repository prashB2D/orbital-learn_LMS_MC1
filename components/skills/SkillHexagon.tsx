"use client";

import { useState, useEffect } from "react";
import { Hexagon, Lock, X, ChevronRight } from "lucide-react";

interface SkillData {
  skillName: string;
  totalXP: number;
  currentLevel: number;
  isUnlocked: boolean;
}

interface SkillHexagonProps {
  userId?: string; // If empty, fetches for current user
  onSkillClick?: (skillName: string) => void;
  refreshTrigger?: number; // Pass a number to trigger re-fetch
}

export default function SkillHexagon({ userId, onSkillClick, refreshTrigger = 0 }: SkillHexagonProps) {
  const [skills, setSkills] = useState<SkillData[]>([]);
  const [hexagonData, setHexagonData] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  
  const [selectedSkill, setSelectedSkill] = useState<SkillData | null>(null);
  const [logs, setLogs] = useState<any[]>([]);

  const fetchSkills = async () => {
    try {
      const ts = Date.now();
      const url = userId ? `/api/admin/students/${userId}/skills?t=${ts}` : `/api/student/skills?t=${ts}`;
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();
      if (data.success) {
        setSkills(data.skills);
        setHexagonData(data.hexagonData);
      }
    } catch (err) {
      console.error("Failed to fetch skills", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, [userId, refreshTrigger]);

  const handleSkillClick = async (skill: SkillData) => {
    if (onSkillClick) {
      onSkillClick(skill.skillName);
    }
    setSelectedSkill(skill);
    // Fetch logs
    try {
      const url = userId 
        ? `/api/student/skills/logs?skillName=${skill.skillName}&userId=${userId}` 
        : `/api/student/skills/logs?skillName=${skill.skillName}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getLevelColor = (level: number) => {
    // 0-30 red, 31-60 yellow, 61-85 blue, 86-100 green
    // Mapping to Level: 0-3 red, 4-6 yellow, 7-8 blue, 9-10 green
    if (level <= 3) return "text-red-500 fill-red-500/20 stroke-red-500";
    if (level <= 6) return "text-yellow-500 fill-yellow-500/20 stroke-yellow-500";
    if (level <= 8) return "text-blue-500 fill-blue-500/20 stroke-blue-500";
    return "text-green-500 fill-green-500/20 stroke-green-500";
  };

  if (loading) return <div className="h-64 flex items-center justify-center">Loading skills...</div>;

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="relative w-64 h-64 mx-auto my-12 flex items-center justify-center">
        {/* SVG Spider Chart Base */}
        <svg width={256} height={256} className="absolute inset-0 overflow-visible z-0 pointer-events-none">
          {(() => {
            const numAxis = skills.length || 6;
            const cx = 128;
            const cy = 128;
            const radius = 128;

            // 1. Rings (Layer 1)
            const ringPercents = [0.2, 0.4, 0.6, 0.8, 1.0];
            const rings = ringPercents.map(pct => {
              return Array.from({ length: numAxis }).map((_, idx) => {
                const angle = (idx / numAxis) * Math.PI * 2 - Math.PI / 2;
                const r = radius * pct;
                return `${cx + Math.cos(angle) * r},${cy + Math.sin(angle) * r}`;
              }).join(" ");
            });

            // 2. Axis lines (Layer 2)
            const axisLines = Array.from({ length: numAxis }).map((_, idx) => {
                const angle = (idx / numAxis) * Math.PI * 2 - Math.PI / 2;
                return {
                    x2: cx + Math.cos(angle) * radius,
                    y2: cy + Math.sin(angle) * radius
                };
            });

            // 3. Data Polygon (Layer 3)
            let maxLevel = 0;
            const dataPoints = skills.map((skill, idx, arr) => {
              const angle = (idx / arr.length) * Math.PI * 2 - Math.PI / 2;
              const mapVal = skill.isUnlocked ? (hexagonData[skill.skillName] || 0) : 0;
              const valRadius = (mapVal / 100) * radius;
              if (skill.isUnlocked && skill.currentLevel > maxLevel) maxLevel = skill.currentLevel;
              return `${cx + Math.cos(angle) * valRadius},${cy + Math.sin(angle) * valRadius}`;
            }).join(" ");

            const getLevelColors = (level: number) => {
              if (level <= 3) return { fill: "rgba(239, 68, 68, 0.25)", stroke: "rgba(239, 68, 68, 1)" };
              if (level <= 6) return { fill: "rgba(234, 179, 8, 0.25)", stroke: "rgba(234, 179, 8, 1)" };
              if (level <= 8) return { fill: "rgba(59, 130, 246, 0.25)", stroke: "rgba(59, 130, 246, 1)" };
              return { fill: "rgba(34, 197, 94, 0.25)", stroke: "rgba(34, 197, 94, 1)" };
            };
            const theme = maxLevel > 0 ? getLevelColors(maxLevel) : { fill: "rgba(128,128,128,0.25)", stroke: "rgba(128,128,128,1)" };

            return (
              <>
                {rings.map((pts, i) => (
                  <polygon key={`ring-${i}`} points={pts} fill="none" stroke="rgba(128,128,128,0.2)" strokeWidth="0.5" />
                ))}
                {axisLines.map((line, i) => (
                  <line key={`axis-${i}`} x1={cx} y1={cy} x2={line.x2} y2={line.y2} stroke="rgba(128,128,128,0.3)" strokeWidth="0.5" />
                ))}
                {skills.length > 0 && (
                  <polygon points={dataPoints} fill={theme.fill} stroke={theme.stroke} strokeWidth="1.5" className="transition-all duration-1000" />
                )}
              </>
            );
          })()}
        </svg>

        {/* Render Dots and Labels (Layers 4 & 5) */}
        {skills.map((skill, idx, arr) => {
          const angle = (idx / arr.length) * Math.PI * 2 - Math.PI / 2;
          const radius = 128; // Outer radius
          
          const isUnlocked = skill.isUnlocked;
          const mapVal = hexagonData[skill.skillName] || 0;
          const valRadius = isUnlocked ? (mapVal / 100) * radius : 0;
          
          const labelX = Math.cos(angle) * (radius + 24);
          const labelY = Math.sin(angle) * (radius + 24);
          
          const dotX = Math.cos(angle) * valRadius;
          const dotY = Math.sin(angle) * valRadius;

          const colorClass = isUnlocked ? getLevelColor(skill.currentLevel) : "text-gray-400";

          return (
            <div key={skill.skillName} className="absolute inset-0 flex items-center justify-center z-10">
              {/* Plot dot */}
              {isUnlocked && (
                <div 
                  className={`absolute w-3 h-3 rounded-full z-10 transition-all duration-1000 shadow-sm ${colorClass.split(" ")[0].replace("text-", "bg-")}`} 
                  style={{ transform: `translate(${dotX}px, ${dotY}px)` }} 
                  title={`${skill.skillName}: Level ${skill.currentLevel} (${mapVal}%)`}
                />
              )}
              
              {/* Label */}
              <button 
                onClick={() => handleSkillClick(skill)}
                className={`absolute text-xs font-bold w-24 text-center cursor-pointer hover:scale-110 transition flex flex-col items-center justify-center gap-1 ${isUnlocked ? "text-gray-800" : "text-gray-400"}`} 
                style={{ transform: `translate(${labelX}px, ${labelY}px)` }}
              >
                {!isUnlocked && <Lock className="w-3 h-3" />}
                {skill.skillName}
                {isUnlocked && <span className={`text-[10px] ${colorClass.split(" ")[0]}`}>Lvl {skill.currentLevel}</span>}
              </button>
            </div>
          );
        })}
      </div>

      {/* Selected Skill Modal */}
      {selectedSkill && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className={`p-6 text-white ${selectedSkill.isUnlocked ? "bg-indigo-600" : "bg-gray-600"} flex justify-between items-start`}>
              <div>
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  {!selectedSkill.isUnlocked && <Lock className="w-5 h-5" />}
                  {selectedSkill.skillName}
                </h3>
                <p className="opacity-90">Level {selectedSkill.currentLevel} • {selectedSkill.totalXP} XP</p>
              </div>
              <button onClick={() => setSelectedSkill(null)} className="p-1 hover:bg-white/20 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-indigo-600"/> Recent Activity
              </h4>
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {logs.length > 0 ? logs.map(log => (
                  <div key={log.id} className="flex gap-3 text-sm border-b pb-3 last:border-0">
                    <div className="font-bold text-green-600 whitespace-nowrap">+{log.xpGained} XP</div>
                    <div className="text-gray-600">{log.reason}</div>
                  </div>
                )) : (
                  <p className="text-gray-500 italic text-sm">No recent activity for this skill.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
