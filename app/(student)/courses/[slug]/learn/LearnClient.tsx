"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import VideoPlayer from "@/components/video/video-player";
import { QuizComponent } from "@/components/quiz/quiz-component";
import { CheckCircle2, Circle, PlayCircle, FileQuestion, Link as LinkIcon } from "lucide-react";

interface Content {
  id: string;
  type: string;
  title: string;
  videoId?: string | null;
  duration?: number | null;
  attachments?: string[];
  completed: boolean;
}

interface LearnClientProps {
  course: any;
  contents: Content[];
  enrollmentId: string;
}

export default function LearnClient({ course, contents, enrollmentId }: LearnClientProps) {
  const router = useRouter();
  const [activeContentId, setActiveContentId] = useState<string | null>(
    contents[0]?.id || null
  );

  const activeContent = contents.find((c) => c.id === activeContentId);

  const handleComplete = async (contentId: string) => {
    try {
      const res = await fetch(`/api/content/${contentId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId, enrollmentId }),
      });

      if (res.ok) {
        router.refresh(); // Refresh DB states inside the Server Component
      }
    } catch (error) {
      console.error("Failed to mark complete:", error);
    }
  };

  if (!contents.length) {
    return (
      <div className="py-12 text-center text-gray-500">
        No content available for this course yet.
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-4 gap-6 max-w-7xl mx-auto py-8 px-4">
      {/* LEFT: Main Watch / Read Area */}
      <div className="md:col-span-3 space-y-6">
        {/* MEDIA DISPLAY */}
        {activeContent?.type === "LESSON" && activeContent.videoId ? (
          <VideoPlayer
            videoId={activeContent.videoId}
            onComplete={() => handleComplete(activeContent.id)}
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
            
            {/* Manual Completion Toggle */}
            <button
              onClick={() => activeContent && handleComplete(activeContent.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
                activeContent?.completed
                  ? "bg-green-100 text-green-700"
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
          </div>

          {/* ATTACHMENTS */}
          {activeContent?.attachments && activeContent.attachments.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 border-b pb-2">
                Course Materials
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
        <div className="p-4 border-b">
          <h3 className="font-bold text-gray-900 text-lg">Course Progress</h3>
          {/* Simple progress bar calculation */}
          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${Math.round(
                  (contents.filter((c) => c.completed).length / contents.length) * 100
                )}%`,
              }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-right mb-4">
            {contents.filter((c) => c.completed).length} / {contents.length}{" "}
            completed
          </p>
          <button 
             onClick={() => router.push(`/courses/${course.slug}/leaderboard`)}
             className="w-full py-2 bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100 transition rounded-lg font-bold text-sm tracking-wide shadow-sm"
          >
             View Leaderboard & Report
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-2 space-y-1">
          {contents.map((content, index) => {
            const isActive = activeContentId === content.id;
            return (
              <button
                key={content.id}
                onClick={() => setActiveContentId(content.id)}
                className={`w-full text-left p-3 rounded-lg flex gap-3 transition ${
                  isActive
                    ? "bg-blue-50 border border-blue-200"
                    : "hover:bg-gray-50 border border-transparent"
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {content.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : content.type === "LESSON" ? (
                    <PlayCircle className="w-5 h-5 text-gray-400" />
                  ) : (
                    <FileQuestion className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className={`font-semibold text-sm line-clamp-2 ${
                      isActive ? "text-blue-700" : "text-gray-700"
                    }`}
                  >
                    {index + 1}. {content.title}
                  </p>
                  {content.duration ? (
                    <p className="text-xs text-gray-500 font-mono mt-1">
                      {Math.floor(content.duration / 60)}:
                      {(content.duration % 60).toString().padStart(2, "0")} MIN
                    </p>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
