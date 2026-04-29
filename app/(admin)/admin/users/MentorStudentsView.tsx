"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Activity, Award, Coins, X, Hexagon, TrendingUp, Presentation, BookOpen } from "lucide-react";
import SkillHexagon from "@/components/skills/SkillHexagon";
import { VALID_SKILLS } from "@/lib/constants";

interface Student {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  courses: { id: string; title: string; completedCount: number }[];
  quizAttempts: any[];
  badges: string[];
  coins: number;
  skills: Record<string, { currentLevel: number; totalXP: number; nextLevelAt: number }>;
}

interface CourseGroup {
  courseId: string;
  courseName: string;
  students: Student[];
}

export default function MentorStudentsView({ mentorCourses }: { mentorCourses: { id: string, title: string }[] }) {
  const [courseGroups, setCourseGroups] = useState<CourseGroup[]>([]);
  const [collapsedCourses, setCollapsedCourses] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [courseId, setCourseId] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [skillRefreshTrigger, setSkillRefreshTrigger] = useState(0);
  const [isUpdatingSkills, setIsUpdatingSkills] = useState(false);
  const [skillUpdates, setSkillUpdates] = useState<{ [skill: string]: { xpAmount: number, reason: string } }>({});
  const [updatingSkillName, setUpdatingSkillName] = useState<string | null>(null);

  const [availableBadges, setAvailableBadges] = useState<any[]>([]);
  const [isAwardingBadge, setIsAwardingBadge] = useState(false);
  const [selectedBadgeId, setSelectedBadgeId] = useState<string>("");
  const [badgeComment, setBadgeComment] = useState("");
  const [successMessages, setSuccessMessages] = useState<Record<string, { text: string; leveledUp: boolean }>>({});

  const [isAwardingCoins, setIsAwardingCoins] = useState(false);
  const [coinAwardAmount, setCoinAwardAmount] = useState<number>(0);
  const [coinAwardReason, setCoinAwardReason] = useState("");
  const [awardMode, setAwardMode] = useState<"LMS" | "EXTERNAL">("LMS");
  const [selectedCoinCourseId, setSelectedCoinCourseId] = useState("");
  const [selectedCoinQuizId, setSelectedCoinQuizId] = useState("");
  const [externalCourseName, setExternalCourseName] = useState("");
  const [externalQuizRef, setExternalQuizRef] = useState("");

  const fetchBadges = async () => {
    try {
      const res = await fetch("/api/badges");
      const data = await res.json();
      if (data.success) {
        setAvailableBadges(data.badges.filter((b: any) => b.type === "MANUAL"));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateSkill = async (skillName: string) => {
    const update = skillUpdates[skillName];
    if (!update || update.xpAmount <= 0 || !update.reason) return;
    
    setUpdatingSkillName(skillName);
    try {
      const res = await fetch("/api/mentor/skills/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudent?.id,
          skillName,
          xpAmount: update.xpAmount,
          reason: update.reason
        })
      });
      const data = await res.json();
      if (data.success) {
        if (selectedStudent) {
          const newSkills = { ...selectedStudent.skills };
          newSkills[skillName] = {
            currentLevel: data.newLevel,
            totalXP: data.newXP,
            nextLevelAt: data.nextLevelAt
          };
          setSelectedStudent({ ...selectedStudent, skills: newSkills });
          setSkillUpdates({ ...skillUpdates, [skillName]: { xpAmount: 0, reason: "" } });
          
          let msgText = `${skillName} updated: ${data.previousXP.toLocaleString()} XP → ${data.newXP.toLocaleString()} XP (Level ${data.previousLevel} → Level ${data.newLevel}).`;
          if (data.newXP < 5500) {
            msgText += ` Next level in ${(data.nextLevelAt - data.newXP).toLocaleString()} XP.`;
          }
          
          setSuccessMessages({
            ...successMessages,
            [skillName]: { text: msgText, leveledUp: data.leveledUp }
          });
          
          setSkillRefreshTrigger(prev => prev + 1);
        }
      } else {
        alert(data.error || "Failed to update skill");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while updating skill");
    } finally {
      setUpdatingSkillName(null);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const url = new URL("/api/mentor/students", window.location.origin);
      if (search) url.searchParams.set("search", search);
      if (courseId) url.searchParams.set("courseId", courseId);
      
      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.success) {
        setCourseGroups(data.courses || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchBadges();
  }, [search, courseId]);

  const handleAwardBadge = async () => {
    if (!selectedBadgeId) return;
    try {
      const res = await fetch("/api/mentor/badges/award", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudent?.id,
          badgeId: selectedBadgeId,
          comment: badgeComment
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("Badge awarded successfully!");
        setIsAwardingBadge(false);
        setSelectedBadgeId("");
        setBadgeComment("");
        // Optionally update the local student badges list
        if (selectedStudent) {
          setSelectedStudent({
            ...selectedStudent,
            badges: [...selectedStudent.badges, data.studentBadge.badge.name]
          });
        }
      } else {
        alert(data.error || "Failed to award badge");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred");
    }
  };

  const handleAwardCoinsSubmit = async () => {
    if (!coinAwardAmount || !coinAwardReason) return;
    
    const payload: any = {
      studentId: selectedStudent?.id,
      amount: coinAwardAmount,
      reason: coinAwardReason
    };

    if (awardMode === "LMS") {
      if (selectedCoinCourseId) payload.courseId = selectedCoinCourseId;
      if (selectedCoinQuizId) payload.quizId = selectedCoinQuizId;
    } else {
      if (externalCourseName) payload.externalCourseName = externalCourseName;
      if (externalQuizRef) payload.externalQuizRef = externalQuizRef;
    }

    try {
      const res = await fetch("/api/mentor/coins/award", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        alert("Coins awarded successfully!");
        setIsAwardingCoins(false);
        setCoinAwardAmount(0);
        setCoinAwardReason("");
        if (selectedStudent) {
          setSelectedStudent({
            ...selectedStudent,
            coins: selectedStudent.coins + coinAwardAmount
          });
        }
      } else {
        alert(data.error || "Failed to award coins");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred");
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search student by name or email..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative w-full md:w-64">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
          >
            <option value="">All Assigned Courses</option>
            {mentorCourses.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grouped Table List */}
      <div className="space-y-6">
        {loading ? (
          <div className="bg-white rounded-xl border p-8 text-center text-gray-500 shadow-sm">Loading students...</div>
        ) : courseGroups.length > 0 ? (
          courseGroups.map((group) => {
            if (group.students.length === 0) return null; // Don't show empty groups
            const isCollapsed = collapsedCourses[group.courseId];
            
            return (
              <div key={group.courseId} className="bg-white rounded-xl border overflow-hidden shadow-sm">
                <div 
                  className="bg-gray-50 p-4 border-b flex justify-between items-center cursor-pointer hover:bg-gray-100 transition"
                  onClick={() => setCollapsedCourses({ ...collapsedCourses, [group.courseId]: !isCollapsed })}
                >
                  <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                    {group.courseName}
                    <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">{group.students.length} students</span>
                  </h3>
                  <button className="text-gray-500 hover:bg-gray-200 p-1 rounded-full transition">
                    <TrendingUp className={`w-5 h-5 transition-transform ${isCollapsed ? '' : 'rotate-180'}`} />
                  </button>
                </div>
                
                {!isCollapsed && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-white border-b">
                        <tr>
                          <th className="p-4 text-left font-semibold text-gray-600">Student Name</th>
                          <th className="p-4 text-left font-semibold text-gray-600">Progress</th>
                          <th className="p-4 text-center font-semibold text-gray-600">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y bg-white">
                        {group.students.map((student) => (
                          <tr key={`${group.courseId}-${student.id}`} className="hover:bg-blue-50/50 transition cursor-pointer" onClick={() => setSelectedStudent(student)}>
                            <td className="p-4">
                              <p className="font-bold text-gray-900">{student.name}</p>
                              <p className="text-sm text-gray-500">{student.email}</p>
                            </td>
                            <td className="p-4">
                              <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                                {(student as any).progress || 0} lessons done
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-3">
                                <button className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200" title="View Profile">
                                  <Activity className="w-4 h-4" />
                                </button>
                                <button className="p-2 bg-yellow-100 text-yellow-600 rounded hover:bg-yellow-200" title="Award Badge">
                                  <Award className="w-4 h-4" />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); setSelectedStudent(student); setIsAwardingCoins(true); }} className="p-2 bg-orange-100 text-orange-600 rounded hover:bg-orange-200" title="Award Coins">
                                  <Coins className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-xl border p-8 text-center text-gray-500 shadow-sm">No students found.</div>
        )}
      </div>

      {/* Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{selectedStudent.name}</h2>
                  <p className="text-gray-500">{selectedStudent.email}</p>
                </div>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column: Stats & Actions */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-yellow-100 to-orange-100 p-6 rounded-xl border border-yellow-200 text-center">
                  <Coins className="w-12 h-12 text-yellow-600 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-yellow-800 uppercase tracking-wider">Total Coins</p>
                  <p className="text-4xl font-black text-yellow-700">{selectedStudent.coins}</p>
                  <button onClick={() => setIsAwardingCoins(true)} className="mt-4 w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg font-bold shadow-sm flex items-center justify-center gap-2 transition">
                    <Coins className="w-4 h-4" /> Award Coins
                  </button>
                </div>
                
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                  <h3 className="font-bold text-blue-900 flex items-center gap-2 mb-4"><Award className="w-5 h-5"/> Badges Earned</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedStudent.badges.map((b, i) => (
                      <span key={i} className="bg-white border-2 border-blue-200 text-blue-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                        {b}
                      </span>
                    ))}
                  </div>
                  <button onClick={() => setIsAwardingBadge(true)} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-bold shadow-sm flex items-center justify-center gap-2 transition">
                    <Award className="w-4 h-4" /> Award Badge
                  </button>
                </div>
              </div>

              {/* Middle Column: Skills */}
              <div className="bg-gray-50 p-6 rounded-xl border">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2"><Hexagon className="w-5 h-5 text-indigo-600"/> Skill Graph</h3>
                  <button onClick={() => setIsUpdatingSkills(true)} className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-100 px-3 py-1 rounded-full">Update Skills</button>
                </div>
                
                {/* Real SkillHexagon component */}
                <SkillHexagon userId={selectedStudent.id} refreshTrigger={skillRefreshTrigger} />
              </div>

              {/* Right Column: Activity */}
              <div className="space-y-6">
                <div className="bg-white border p-5 rounded-xl">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><BookOpen className="w-4 h-4"/> Enrolled Courses</h3>
                  <div className="space-y-3">
                    {selectedStudent.courses.map(c => (
                      <div key={c.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                        <span className="text-sm font-medium">{c.title}</span>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">{c.completedCount} lessons</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border p-5 rounded-xl">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4"/> Recent Quiz Scores</h3>
                  {selectedStudent.quizAttempts.length > 0 ? (
                    <div className="space-y-3">
                      {selectedStudent.quizAttempts.map((q: any) => (
                        <div key={q.id} className="flex justify-between items-center text-sm border-b pb-2 last:border-0">
                          <span className="text-gray-600 truncate max-w-[120px]">{q.quiz.title}</span>
                          <span className="font-black text-gray-900">{q.score}%</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No recent quiz attempts.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Skills Modal */}
      {isUpdatingSkills && selectedStudent && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center z-10">
              <div>
                <h2 className="text-2xl font-bold">Update Skills for {selectedStudent.name}</h2>
                <p className="text-gray-500">Award manual XP and provide reasons</p>
              </div>
              <button onClick={() => setIsUpdatingSkills(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {VALID_SKILLS.map((skill) => {
                const val = selectedStudent.skills[skill] || { currentLevel: 0, totalXP: 0, nextLevelAt: 100 };
                const fillPercent = val.totalXP >= 5500 ? 100 : (val.totalXP / val.nextLevelAt) * 100;
                const successMsg = successMessages[skill];
                
                return (
                <div key={skill} className="bg-gray-50 border p-4 rounded-xl flex flex-col gap-4">
                  <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                    <div className="flex-1 w-full md:w-auto">
                      <h4 className="font-bold text-lg text-gray-900">{skill}</h4>
                      <p className="text-sm font-semibold text-indigo-600 mb-1">Level {val.currentLevel}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1 font-medium">
                        <span>{val.totalXP.toLocaleString()} XP</span>
                        <span>{val.totalXP >= 5500 ? "MAX LEVEL" : `${val.nextLevelAt.toLocaleString()} XP`}</span>
                      </div>
                      <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 transition-all duration-1000 ease-out" 
                          style={{ width: `${fillPercent}%` }}
                        />
                      </div>
                      {val.totalXP < 5500 && (
                        <p className="text-xs text-gray-500 mt-1">{val.nextLevelAt - val.totalXP} more needed for next level</p>
                      )}
                    </div>
                    <div className="flex-1 w-full space-y-2">
                      <input 
                        type="number" 
                        placeholder="Bonus XP Amount" 
                        className="w-full px-3 py-2 border rounded-md text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        value={skillUpdates[skill]?.xpAmount || ""}
                        onChange={(e) => setSkillUpdates({
                          ...skillUpdates,
                          [skill]: { ...skillUpdates[skill], xpAmount: Number(e.target.value) }
                        })}
                      />
                      <textarea 
                        placeholder="Reason for awarding..." 
                        className="w-full px-3 py-2 border rounded-md text-sm h-16 outline-none focus:ring-2 focus:ring-indigo-500"
                        value={skillUpdates[skill]?.reason || ""}
                        onChange={(e) => setSkillUpdates({
                          ...skillUpdates,
                          [skill]: { ...skillUpdates[skill], reason: e.target.value }
                        })}
                      />
                    </div>
                    <div className="w-full md:w-auto">
                      <button 
                        onClick={() => handleUpdateSkill(skill)}
                        disabled={updatingSkillName === skill || !skillUpdates[skill]?.xpAmount || !skillUpdates[skill]?.reason}
                        className="w-full md:w-auto bg-indigo-600 text-white px-5 py-3 rounded-lg font-bold disabled:opacity-50 hover:bg-indigo-700 transition shadow-sm whitespace-nowrap"
                      >
                        {updatingSkillName === skill ? "Awarding..." : "Award XP"}
                      </button>
                    </div>
                  </div>
                  
                  {successMsg && (
                    <div className={`p-3 rounded-lg border text-sm font-medium animate-in fade-in slide-in-from-top-2 ${successMsg.leveledUp ? "bg-green-50 border-green-200 text-green-800" : "bg-blue-50 border-blue-200 text-blue-800"}`}>
                      {successMsg.leveledUp && <div className="font-bold text-green-600 mb-1 flex items-center gap-1">🎉 Level up! {skill} is now Level {val.currentLevel}</div>}
                      {successMsg.text}
                    </div>
                  )}
                </div>
              )})}
            </div>
          </div>
        </div>
      )}

      {/* Award Badge Modal */}
      {isAwardingBadge && selectedStudent && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Award Badge to {selectedStudent.name}</h2>
                <p className="text-gray-500 text-sm">Select a manual badge to award</p>
              </div>
              <button onClick={() => setIsAwardingBadge(false)} className="text-gray-500 hover:bg-gray-100 p-1 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-64 overflow-y-auto p-1">
                {availableBadges.length > 0 ? availableBadges.map(b => (
                  <div 
                    key={b.id} 
                    onClick={() => setSelectedBadgeId(b.id)}
                    className={`border-2 rounded-xl p-4 text-center cursor-pointer transition ${selectedBadgeId === b.id ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                  >
                    <div className="text-4xl mb-2">{b.icon}</div>
                    <div className="font-bold text-sm text-gray-900">{b.name}</div>
                    <div className="text-xs text-gray-500 mt-1 line-clamp-2">{b.description}</div>
                  </div>
                )) : (
                  <div className="col-span-full text-center text-gray-500 italic py-8">No manual badges available. Admins need to create them first.</div>
                )}
              </div>
              
              {selectedBadgeId && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Comment / Reason (Optional)</label>
                  <textarea 
                    value={badgeComment}
                    onChange={(e) => setBadgeComment(e.target.value)}
                    placeholder="Great job on..."
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-20"
                  />
                </div>
              )}

              <div className="flex justify-end pt-4 border-t gap-2">
                <button onClick={() => setIsAwardingBadge(false)} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancel</button>
                <button 
                  onClick={handleAwardBadge}
                  disabled={!selectedBadgeId}
                  className="px-4 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50"
                >
                  Award Badge
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Award Coins Modal */}
      {isAwardingCoins && selectedStudent && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Award Coins to {selectedStudent.name}</h2>
              </div>
              <button onClick={() => setIsAwardingCoins(false)} className="text-gray-500 hover:bg-gray-100 p-1 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex gap-4 mb-4 bg-gray-100 p-1 rounded-lg">
                <button 
                  onClick={() => setAwardMode("LMS")}
                  className={`flex-1 py-1.5 text-sm font-bold rounded-md transition ${awardMode === "LMS" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}
                >LMS Quiz</button>
                <button 
                  onClick={() => setAwardMode("EXTERNAL")}
                  className={`flex-1 py-1.5 text-sm font-bold rounded-md transition ${awardMode === "EXTERNAL" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}
                >Live / External Quiz</button>
              </div>

              {awardMode === "LMS" ? (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Course (Optional)</label>
                    <select
                      value={selectedCoinCourseId}
                      onChange={(e) => setSelectedCoinCourseId(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                    >
                      <option value="">None</option>
                      {selectedStudent?.courses.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Quiz (Optional)</label>
                    <select
                      value={selectedCoinQuizId}
                      onChange={(e) => setSelectedCoinQuizId(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                    >
                      <option value="">None</option>
                      {selectedStudent?.quizAttempts
                        .filter((qa: any) => !selectedCoinCourseId || qa.courseId === selectedCoinCourseId)
                        .map((qa: any) => ({ id: qa.quiz?.id || qa.quizId, title: qa.quiz?.title || 'Unknown' }))
                        .filter((v: any, i: any, a: any) => a.findIndex((t: any) => t.id === v.id) === i)
                        .map((quiz: any) => (
                          <option key={quiz.id} value={quiz.id}>{quiz.title}</option>
                        ))
                      }
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Course Name</label>
                    <input 
                      type="text"
                      value={externalCourseName}
                      onChange={(e) => setExternalCourseName(e.target.value)}
                      placeholder="e.g. Full Stack Development"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Quiz / Session Reference</label>
                    <input 
                      type="text"
                      value={externalQuizRef}
                      onChange={(e) => setExternalQuizRef(e.target.value)}
                      placeholder="e.g. LIVE-2026-04-29 or React Hooks Session"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Amount</label>
                <input 
                  type="number"
                  value={coinAwardAmount || ""}
                  onChange={(e) => setCoinAwardAmount(Number(e.target.value))}
                  placeholder="e.g. 100"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Reason</label>
                <textarea 
                  value={coinAwardReason}
                  onChange={(e) => setCoinAwardReason(e.target.value)}
                  placeholder="Great job on the final project!"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none h-20"
                />
              </div>
              <div className="flex justify-end pt-4 border-t gap-2">
                <button onClick={() => setIsAwardingCoins(false)} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition">Cancel</button>
                <button 
                  onClick={handleAwardCoinsSubmit}
                  disabled={!coinAwardAmount || !coinAwardReason}
                  className="px-4 py-2 font-bold text-white bg-yellow-500 hover:bg-yellow-600 rounded-lg transition disabled:opacity-50"
                >
                  Award Coins
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
