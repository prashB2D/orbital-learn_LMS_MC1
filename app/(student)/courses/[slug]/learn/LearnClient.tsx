"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import VideoPlayer from "@/components/video/video-player";
import { QuizComponent } from "@/components/quiz/quiz-component";
import { CheckCircle2, Circle, PlayCircle, FileQuestion, Link as LinkIcon, ChevronDown, ChevronRight, FolderOpen } from "lucide-react";

interface Content {
  id: string;
  type: string;
  title: string;
  videoId?: string | null;
  duration?: number | null;
  attachments?: string[];
  completed: boolean;
  lastWatchedTime?: number;
  isAccessible?: boolean;
  isFreeTrial?: boolean;
}

interface Module {
  id: string;
  title: string;
  contents: Content[];
}

interface LearnClientProps {
  course: any;
  modules: Module[];
  unassignedContents: Content[];
  enrollmentId: string;
  isEnrolled: boolean;
}

export default function LearnClient({ course, modules, unassignedContents, enrollmentId, isEnrolled }: LearnClientProps) {
  const router = useRouter();
  
  // Flatten contents for active lookup and total progress count
  const allContents = [
    ...modules.flatMap(m => m.contents),
    ...unassignedContents
  ];
  
  const [activeContentId, setActiveContentId] = useState<string | null>(
    allContents[0]?.id || null
  );

  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>(
    modules.reduce((acc, m) => ({ ...acc, [m.id]: true }), {})
  );
  
  const [canComplete, setCanComplete] = useState<boolean>(false);
  const handleReadyToComplete = useCallback((ready: boolean) => {
    setCanComplete(ready);
  }, []);

  const toggleModule = (id: string) => {
    setExpandedModules(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const activeContent = allContents.find((c) => c.id === activeContentId);

  const handleComplete = async (contentId: string) => {
    try {
      const res = await fetch(`/api/content/${contentId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId, enrollmentId }),
      });

      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Failed to mark complete:", error);
    }
  };

  if (!allContents.length) {
    return (
      <div className="py-12 text-center text-gray-500">
        No content available for this course yet.
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-4 gap-6 max-w-7xl mx-auto py-8 px-4">
      <div className="md:col-span-3 space-y-6">
        {/* MEDIA DISPLAY */}
        {!activeContent?.isAccessible ? (
          <div className="relative w-full aspect-video bg-gray-900 rounded-xl overflow-hidden flex flex-col items-center justify-center border shadow-lg group">
             <div className="absolute inset-0 opacity-40 mix-blend-overlay pointer-events-none">
                {course.thumbnail && <img src={course.thumbnail} className="w-full h-full object-cover blur-sm" alt="course background" />}
             </div>
             <div className="z-10 bg-black/60 backdrop-blur-md p-8 rounded-2xl border border-white/10 text-center max-w-md w-full mx-4 shadow-2xl transform transition-transform group-hover:scale-105">
                <div className="mb-4">
                  <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm tracking-wider uppercase">
                    Premium Content
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{course.title}</h3>
                <p className="text-gray-300 text-sm mb-6 line-clamp-2">Enroll now to unlock this lesson and the entire course.</p>
                <div className="flex flex-col gap-2 items-center mb-6">
                   {course.offerPercent && course.offerPercent > 0 ? (
                      <div className="flex items-center gap-3">
                         <span className="text-gray-400 line-through text-lg">₹{(course.basePrice || 0).toLocaleString("en-IN")}</span>
                         <span className="text-3xl font-extrabold text-green-400">₹{(course.finalPrice || course.basePrice || 0).toLocaleString("en-IN")}</span>
                      </div>
                   ) : (
                      <span className="text-3xl font-extrabold text-white">₹{(course.basePrice || 0).toLocaleString("en-IN")}</span>
                   )}
                </div>
                <button
                   onClick={() => router.push(`/courses/${course.slug}`)}
                   className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-blue-500/50 transition duration-300 flex items-center justify-center gap-2"
                >
                   Enroll Now
                </button>
             </div>
          </div>
        ) : activeContent?.type === "LESSON" && activeContent.videoId ? (
          <VideoPlayer
            contentId={activeContent.id}
            enrollmentId={enrollmentId}
            videoId={activeContent.videoId}
            duration={activeContent.duration || 0}
            lastWatchedTime={activeContent.lastWatchedTime || 0}
            onComplete={() => handleComplete(activeContent.id)}
            onReadyToComplete={handleReadyToComplete}
          />
        ) : activeContent?.type === "QUIZ" ? (
          <QuizComponent 
            quiz={activeContent as any} 
            enrollmentId={enrollmentId} 
            onComplete={() => handleComplete(activeContent.id)} 
          />
        ) : (
          <div className="bg-black rounded-lg aspect-video flex items-center justify-center text-white">
            <p>Select a lesson from the menu</p>
          </div>
        )}

        {/* CONTENT DETAILS OVERVIEW */}
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {activeContent?.title}
              </h2>
              <div className="flex items-center gap-2">
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                  {activeContent?.type}
                </span>
                {activeContent?.duration && (
                  <span className="text-sm font-mono text-gray-500">
                    {Math.floor(activeContent.duration / 60)}:
                    {(activeContent.duration % 60).toString().padStart(2, "0")}{" "}
                    MIN
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-1">
              <button
                disabled={
                  !isEnrolled ||
                  (activeContent?.type === "LESSON" && !activeContent?.completed && !canComplete) ||
                  (activeContent?.type === "QUIZ" && !activeContent?.completed)
                }
                onClick={() => activeContent && handleComplete(activeContent.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
                  activeContent?.completed
                    ? "bg-green-100 text-green-700"
                    : !isEnrolled
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed border outline-none"
                      : (activeContent?.type === "LESSON" && !canComplete) || (activeContent?.type === "QUIZ" && !activeContent?.completed)
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed border outline-none"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {activeContent?.completed ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" /> Completed
                  </>
                ) : (
                  <>
                    <Circle className="w-5 h-5" /> Mark as Complete
                  </>
                )}
              </button>
              {!isEnrolled && (
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Enroll to track progress</span>
              )}
              {isEnrolled && activeContent?.type === "LESSON" && !activeContent?.completed && !canComplete && (
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Watch 80% to complete</span>
              )}
              {isEnrolled && activeContent?.type === "QUIZ" && !activeContent?.completed && (
                <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider" title="Pass the quiz first (60% required)">Pass the quiz first (60% required)</span>
              )}
            </div>
          </div>

          {/* ATTACHMENTS */}
          {activeContent?.attachments && activeContent.attachments.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 border-b pb-2">
                Notes & Attachments
              </h3>
              <ul className="space-y-3">
                {activeContent.attachments.map((link, idx) => (
                  <li key={idx}>
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition group"
                    >
                      <div className="bg-gray-100 p-2 rounded group-hover:bg-blue-100 transition">
                        <LinkIcon className="w-4 h-4 text-gray-500 group-hover:text-blue-600" />
                      </div>
                      <span className="text-blue-600 hover:underline max-w-full truncate">
                        {link}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: COURSE CONTENT MENU */}
      <div className="bg-white rounded-lg border shadow-sm flex flex-col h-[calc(100vh-100px)] sticky top-6">
        <div className="p-4 border-b bg-gray-50 rounded-t-lg">
          <h3 className="font-bold text-gray-900 text-lg">Course Progress</h3>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${Math.round(
                  (allContents.filter((c) => c.completed).length / Math.max(allContents.length, 1)) * 100
                )}%`,
              }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-right mb-4">
            {allContents.filter((c) => c.completed).length} / {allContents.length}{" "}
            completed
          </p>
          <button 
             onClick={() => router.push(`/courses/${course.slug}/leaderboard`)}
             className="w-full py-2 bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100 transition rounded-lg font-bold text-sm tracking-wide shadow-sm"
          >
             View Leaderboard & Report
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-3 space-y-3">
          {/* Grouped Modules */}
          {modules.map((module) => (
            <div key={module.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <button 
                 onClick={() => toggleModule(module.id)}
                 className="w-full bg-gray-50 px-3 py-2.5 flex items-center justify-between hover:bg-gray-100 transition"
              >
                 <div className="flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-gray-800 text-sm">{module.title}</span>
                 </div>
                 {expandedModules[module.id] ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
              </button>
              
              {expandedModules[module.id] && (
                 <div className="p-2 flex flex-col gap-1 bg-white">
                    {module.contents.length === 0 ? (
                       <div className="text-xs text-gray-400 p-2 text-center">Empty module</div>
                    ) : (
                       module.contents.map((content) => {
                          const isActive = activeContentId === content.id;
                          return (
                             <button
                                 key={content.id}
                                 onClick={() => setActiveContentId(content.id)}
                                 className={`w-full text-left p-2 rounded-md flex gap-3 transition ${
                                   isActive
                                     ? "bg-blue-50 border border-blue-200"
                                     : "hover:bg-gray-50 border border-transparent"
                                 } ${!content.isAccessible ? "opacity-70" : ""}`}
                               >
                                 <div className="mt-0.5 shrink-0 relative">
                                   {content.completed ? (
                                     <CheckCircle2 className="w-4 h-4 text-green-500" />
                                   ) : !content.isAccessible ? (
                                     <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center">
                                       <span className="text-[8px]">🔒</span>
                                     </div>
                                   ) : content.type === "LESSON" ? (
                                     <PlayCircle className="w-4 h-4 text-gray-400" />
                                   ) : (
                                     <FileQuestion className="w-4 h-4 text-gray-400" />
                                   )}
                                 </div>
                                 <div className="flex-1 min-w-0 flex items-center justify-between">
                                   <p className={`font-semibold text-xs truncate ${isActive ? "text-blue-700" : "text-gray-700"}`}>
                                     {content.title}
                                   </p>
                                   {!isEnrolled && content.isFreeTrial && (
                                     <span className="ml-2 text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shrink-0">
                                       Free
                                     </span>
                                   )}
                                 </div>
                               </button>
                          );
                       })
                    )}
                 </div>
              )}
            </div>
          ))}

          {/* Unassigned Contents (legacy support) */}
          {unassignedContents.length > 0 && (
             <div className="pt-2">
               <h4 className="text-xs font-bold text-gray-400 uppercase mb-2 px-1">Other Content</h4>
               <div className="space-y-1">
                 {unassignedContents.map((content) => {
                    const isActive = activeContentId === content.id;
                    return (
                       <button
                          key={content.id}
                          onClick={() => setActiveContentId(content.id)}
                          className={`w-full text-left p-2.5 rounded-lg flex gap-3 transition ${
                            isActive
                              ? "bg-blue-50 border border-blue-200"
                              : "hover:bg-gray-50 border border-transparent"
                          } ${!content.isAccessible ? "opacity-70" : ""}`}
                        >
                          <div className="mt-0.5 shrink-0 relative">
                            {content.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : !content.isAccessible ? (
                              <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-[10px]">🔒</span>
                              </div>
                            ) : content.type === "LESSON" ? (
                              <PlayCircle className="w-5 h-5 text-gray-400" />
                            ) : (
                              <FileQuestion className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0 flex items-center justify-between">
                            <p className={`font-semibold text-sm line-clamp-2 ${isActive ? "text-blue-700" : "text-gray-700"}`}>
                              {content.title}
                            </p>
                            {!isEnrolled && content.isFreeTrial && (
                              <span className="ml-2 text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shrink-0">
                                Free
                              </span>
                            )}
                          </div>
                        </button>
                    );
                 })}
               </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
