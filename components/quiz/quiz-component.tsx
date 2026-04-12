"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Trophy, History, ArrowRight, CheckCircle2, Circle, Eye, RotateCcw } from "lucide-react";

interface Question {
  id: string;
  questionText: string;
  options: string[];
}

interface QuizProps {
  quiz: {
    id: string;
    title: string;
    questions?: Question[];
  };
  enrollmentId: string;
  onComplete: () => void;
}

export function QuizComponent({ quiz, enrollmentId, onComplete }: QuizProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [courseContext, setCourseContext] = useState<any>(null);
  const [startTime, setStartTime] = useState<number>(0);

  const { register, handleSubmit, reset } = useForm();

  // Fetch past attempts and record start time on mount
  useEffect(() => {
    fetchHistoryAndContext();
    setStartTime(Date.now());
  }, [quiz.id]);

  const fetchHistoryAndContext = async (isManualSubmit = false) => {
    try {
      const [histRes, ctxRes] = await Promise.all([
        fetch(`/api/quiz/attempts/${quiz.id}`),
        fetch(`/api/quiz/course-context/${quiz.id}`)
      ]);
      const histData = await histRes.json();
      const ctxData = await ctxRes.json();
      
      if (ctxData.success) {
        setCourseContext(ctxData);
      }
      
      if (histData.attempts && histData.attempts.length > 0) {
        setHistory(histData.attempts);
        // Automatically mount success screen if they have existing history
        if (!isManualSubmit) {
          setResult(histData.attempts[0]); 
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const onSubmit = async (data: Record<string, string>) => {
    setLoading(true);
    try {
      // Map form output (strings) to numbers
      const formattedAnswers: Record<string, number> = {};
      Object.keys(data).forEach((qId) => {
        formattedAnswers[qId] = Number(data[qId]);
      });

      const timeTakenSeconds = Math.floor((Date.now() - startTime) / 1000);

      const res = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: quiz.id,
          answers: formattedAnswers,
          timeTaken: timeTakenSeconds,
        }),
      });

      const parsed = await res.json();

      if (parsed.success) {
        setResult(parsed);
        fetchHistoryAndContext(true); // Refresh state natively
        onComplete();   // Trigger standard LMS content completion
      } else {
        alert(parsed.error || "Quiz failed to submit.");
      }
    } catch (error) {
      console.error("Quiz submission error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setResult(null);
    reset(); // Clear previous form
    setStartTime(Date.now()); // Restart timer
  };

  if (result) {
    return (
      <div className="bg-white rounded-lg border flex flex-col items-center justify-center space-y-8 p-0 overflow-hidden shadow-sm">
        
        {/* SUCCESS BANNER */}
        <div className="w-full bg-blue-600 p-8 text-center text-white relative">
          <Trophy className="w-24 h-24 absolute -top-4 -right-4 text-white/10" />
          <h2 className="text-3xl font-bold mb-2">Quiz Completed!</h2>
          <p className="text-blue-100 font-medium">Your score has automatically been recorded into the course rankings.</p>
        </div>

        {/* IPL STYLE COURSE TIMELINE */}
        {courseContext && (
          <div className="w-full px-8 pb-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center justify-between">
              <span>Course Timeline</span>
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{courseContext.myCompletedCount} / {courseContext.courseQuizzes} Quizzes</span>
            </h3>
            <div className="flex items-center gap-2 overflow-x-auto pb-4">
              {Array.from({ length: courseContext.courseQuizzes }).map((_, idx) => {
                const isFinished = idx < courseContext.myCompletedCount;
                return (
                  <div key={idx} className="flex-1 min-w-[40px] flex flex-col items-center gap-2 group">
                    <div className={`w-full h-2 rounded-full transition-all ${isFinished ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                    {isFinished ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-300 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-8 px-8 pb-8">
          {/* STATS AREA */}
          <div className="grid grid-cols-2 gap-4 h-fit">
            <div className="bg-blue-50 p-4 border border-blue-100 rounded-lg">
              <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mb-1">Highest Score</p>
              <p className="text-3xl font-black text-gray-900">{Math.floor(result.score)}%</p>
            </div>
            <div className="bg-green-50 p-4 border border-green-100 rounded-lg">
              <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider mb-1">Base Points</p>
              <p className="text-3xl font-black text-gray-900">{Math.floor(result.pointsEarned || 0)}</p>
            </div>
            <div className="bg-purple-50 p-4 border border-purple-100 rounded-lg col-span-2">
              <p className="text-[10px] text-purple-600 font-bold uppercase tracking-wider mb-1">Quiz Attempts</p>
              <p className="text-lg font-bold text-gray-900">{result.attemptNumber || history.length || 1} <span className="text-xs text-gray-500 font-medium">total submissions</span></p>
            </div>
          </div>

          {/* LIVE MINI LEADERBOARD */}
          <div className="border border-gray-200 rounded-lg overflow-hidden flex flex-col bg-gray-50">
            <div className="bg-gray-800 text-white p-3 text-xs font-bold tracking-wider uppercase flex justify-between items-center">
              <span>Top Competitors</span>
              <Trophy className="w-4 h-4 text-yellow-400" />
            </div>
            <div className="divide-y divide-gray-200">
               {courseContext?.miniLeaderboard?.map((entry: any) => (
                  <div key={entry.userId} className={`p-3 flex items-center justify-between text-sm ${entry.userId === (courseContext as any)?.currentUserId ? 'bg-blue-100' : 'bg-white'}`}>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-400 w-5">{entry.rank}</span>
                      <span className={`font-semibold ${entry.userName === 'You' ? 'text-blue-700' : 'text-gray-900'}`}>{entry.userName}</span>
                    </div>
                    <span className="font-bold text-gray-900">{entry.total_points}</span>
                  </div>
               ))}
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="w-full flex flex-col sm:flex-row gap-3 px-8 pb-8 border-t pt-6 bg-gray-50">
          <button
            onClick={handleRetry}
            className="flex-1 py-3 bg-white border-2 border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 hover:border-gray-400 transition flex justify-center items-center gap-2"
          >
            <RotateCcw className="w-5 h-5" /> Retake Quiz
          </button>
          
          {courseContext?.courseSlug && (
            <button
               onClick={() => window.location.href = `/courses/${courseContext.courseSlug}/leaderboard`}
               className="flex-1 py-3 bg-gray-900 text-white font-bold rounded-lg hover:bg-black transition flex justify-center items-center gap-2 shadow-md"
            >
               <Eye className="w-5 h-5" /> View Full Report
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border">
      <div className="p-6 border-b flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{quiz.title}</h2>
        {history.length > 0 && (
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            <History className="w-4 h-4" /> {history.length} Previous Attempts
          </div>
        )}
      </div>

      <div className="p-6">
        {quiz.questions && quiz.questions.length > 0 ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {quiz.questions.map((q, index) => (
              <div key={q.id} className="space-y-4">
                <h3 className="font-semibold text-lg text-gray-900">
                  {index + 1}. {q.questionText}
                </h3>
                <div className="space-y-3">
                  {q.options.map((opt, optIndex) => (
                    <label
                      key={optIndex}
                      className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-blue-50 transition peer-checked:bg-blue-50 peer-checked:border-blue-500"
                    >
                      <input
                        type="radio"
                        value={optIndex.toString()}
                        {...register(q.id, { required: true })}
                        className="w-4 h-4 text-blue-600 cursor-pointer"
                      />
                      <span className="text-gray-700 font-medium">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div className="pt-6 border-t">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit Quiz"} <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-12 text-gray-500 italic">
            This quiz has no questions setup yet. Check back later!
          </div>
        )}
      </div>
    </div>
  );
}
