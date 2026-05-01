"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { Trophy, History, ArrowRight, CheckCircle2, Circle, Eye, RotateCcw, AlertTriangle, ChevronRight, ChevronLeft, Maximize2, PauseCircle } from "lucide-react";

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

  const [hasStarted, setHasStarted] = useState(false);
  const [hasAcceptedWarning, setHasAcceptedWarning] = useState(false);
  
  // Overhaul states
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionTimes, setQuestionTimes] = useState<{questionId: string, timeSpentSeconds: number}[]>([]);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [isPaused, setIsPaused] = useState(false);
  const [pauseStartTime, setPauseStartTime] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const { register, handleSubmit, reset, watch } = useForm();
  
  const formValues = watch();

  useEffect(() => {
    fetchHistoryAndContext();
  }, [quiz.id]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && hasStarted && !result && !isPaused) {
         setIsPaused(true);
         setPauseStartTime(Date.now());
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, [hasStarted, result, isPaused]);

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
        if (!isManualSubmit) {
          setResult(histData.attempts[0]); 
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleStartQuiz = async () => {
    if (!hasAcceptedWarning) return;
    
    setLoading(true);
    try {
      const res = await fetch("/api/quiz/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId: quiz.id })
      });
      const data = await res.json();
      
      if (data.success) {
        setAttemptId(data.attemptId);
        setHasStarted(true);
        setCurrentQuestionIndex(0);
        setQuestionTimes([]);
        
        const now = Date.now();
        setStartTime(now);
        setQuestionStartTime(now);
        
        if (containerRef.current && containerRef.current.requestFullscreen) {
          containerRef.current.requestFullscreen().catch(err => console.log("Fullscreen blocked", err));
        }
      } else {
        alert(data.error || "Failed to start quiz");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleResume = () => {
    const pausedDuration = Date.now() - pauseStartTime;
    setStartTime(prev => prev + pausedDuration);
    setQuestionStartTime(prev => prev + pausedDuration);
    setIsPaused(false);
    
    if (containerRef.current && containerRef.current.requestFullscreen) {
      containerRef.current.requestFullscreen().catch(err => console.log("Fullscreen blocked", err));
    }
  };

  const recordQuestionTime = () => {
    if (!quiz.questions) return;
    const currentQ = quiz.questions[currentQuestionIndex];
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    
    setQuestionTimes(prev => {
      const existingIndex = prev.findIndex(t => t.questionId === currentQ.id);
      if (existingIndex >= 0) {
        const newTimes = [...prev];
        newTimes[existingIndex].timeSpentSeconds += timeSpent;
        return newTimes;
      }
      return [...prev, { questionId: currentQ.id, timeSpentSeconds: timeSpent }];
    });
    setQuestionStartTime(Date.now());
  };

  const handleNext = () => {
    recordQuestionTime();
    setCurrentQuestionIndex(prev => prev + 1);
  };

  const handlePrev = () => {
    recordQuestionTime();
    setCurrentQuestionIndex(prev => Math.max(0, prev - 1));
  };

  const onSubmit = async (data: Record<string, string>) => {
    setLoading(true);
    try {
      const finalQ = quiz.questions![currentQuestionIndex];
      const finalTimeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
      const finalQuestionTimes = [...questionTimes];
      const existingIndex = finalQuestionTimes.findIndex(t => t.questionId === finalQ.id);
      if (existingIndex >= 0) {
        finalQuestionTimes[existingIndex].timeSpentSeconds += finalTimeSpent;
      } else {
        finalQuestionTimes.push({ questionId: finalQ.id, timeSpentSeconds: finalTimeSpent });
      }

      const formattedAnswers: Record<string, number> = {};
      Object.keys(data).forEach((qId) => {
        if (data[qId] !== undefined && data[qId] !== null) {
           formattedAnswers[qId] = Number(data[qId]);
        }
      });

      const timeTakenSeconds = Math.floor((Date.now() - startTime) / 1000);

      const res = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId,
          answers: formattedAnswers,
          timeTaken: timeTakenSeconds,
          questionTimes: finalQuestionTimes
        }),
      });

      const parsed = await res.json();

      if (parsed.success) {
        setResult(parsed);
        if (document.fullscreenElement) {
           document.exitFullscreen().catch(e => console.log(e));
        }
        fetchHistoryAndContext(true); 
        
        // Progress trigger
        if (parsed.score >= 60) {
           onComplete();
        }
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
    reset(); 
    setHasStarted(false); 
    setHasAcceptedWarning(false);
    setCurrentQuestionIndex(0);
    setAttemptId(null);
  };

  if (result) {
    const isPass = result.score >= 60;
    
    return (
      <div className="bg-white rounded-lg border flex flex-col items-center justify-center space-y-8 p-0 overflow-hidden shadow-sm">
        
        <div className={`w-full p-8 text-center text-white relative ${isPass ? 'bg-green-600' : 'bg-red-600'}`}>
          <Trophy className="w-24 h-24 absolute -top-4 -right-4 text-white/10" />
          <h2 className="text-3xl font-bold mb-2">Quiz {isPass ? 'Passed!' : 'Failed'}</h2>
          <p className="text-white/80 font-medium">
            {isPass ? 'Your score has automatically been recorded into the course rankings.' : 'You must score at least 60% to pass and complete this module.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-8 px-8 pb-8">
          <div className="grid grid-cols-2 gap-4 h-fit">
            <div className="bg-gray-50 p-4 border border-gray-100 rounded-lg col-span-2">
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Score Achieved</p>
              <p className={`text-4xl font-black ${isPass ? 'text-green-600' : 'text-red-600'}`}>{Math.floor(result.score)}%</p>
            </div>
            <div className="bg-blue-50 p-4 border border-blue-100 rounded-lg">
              <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mb-1">Highest Score</p>
              <p className="text-2xl font-black text-gray-900">{Math.floor(result.score)}%</p>
            </div>
            <div className="bg-purple-50 p-4 border border-purple-100 rounded-lg">
              <p className="text-[10px] text-purple-600 font-bold uppercase tracking-wider mb-1">Base Points</p>
              <p className="text-2xl font-black text-gray-900">{Math.floor(result.pointsEarned || 0)}</p>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden flex flex-col bg-gray-50">
            <div className="bg-gray-800 text-white p-3 text-xs font-bold tracking-wider uppercase">
              Time Breakdown
            </div>
            <div className="divide-y divide-gray-200 h-48 overflow-y-auto">
               {result.questionTimes ? (
                 result.questionTimes.map((qt: any, i: number) => (
                   <div key={qt.questionId} className="p-3 flex items-center justify-between text-sm bg-white">
                     <span className="font-medium text-gray-700">Question {i + 1}</span>
                     <span className="font-bold text-gray-900">{qt.timeSpentSeconds}s</span>
                   </div>
                 ))
               ) : (
                 <div className="p-4 text-center text-sm text-gray-500">No time data available</div>
               )}
            </div>
          </div>
        </div>

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

  const currentQ = quiz.questions ? quiz.questions[currentQuestionIndex] : null;

  return (
    <div ref={containerRef} className="bg-white rounded-lg border flex flex-col h-full w-full">
      {hasStarted && isPaused && (
        <div className="absolute inset-0 z-50 bg-gray-900/90 flex flex-col items-center justify-center text-white p-6">
          <PauseCircle className="w-20 h-20 text-yellow-500 mb-6" />
          <h2 className="text-3xl font-black mb-4">Quiz Paused</h2>
          <p className="text-gray-300 text-center max-w-md mb-8">
            You exited fullscreen mode. The timer has been paused. Please resume to continue the quiz in fullscreen.
          </p>
          <button 
            onClick={handleResume}
            className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition flex items-center gap-2 shadow-lg"
          >
            <Maximize2 className="w-5 h-5" /> Resume Quiz
          </button>
        </div>
      )}

      <div className="p-6 border-b flex justify-between items-center bg-gray-50 shrink-0">
        <h2 className="text-2xl font-bold text-gray-900">{quiz.title}</h2>
        {hasStarted && quiz.questions ? (
           <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 bg-white px-3 py-1 rounded-full border">
             Question {currentQuestionIndex + 1} of {quiz.questions.length}
           </div>
        ) : history.length > 0 && (
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 bg-white px-3 py-1 rounded-full border">
            <History className="w-4 h-4" /> {history.length} Previous Attempts
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50/50 relative">
        {!hasStarted ? (
          <div className="max-w-2xl mx-auto py-8 px-4 h-full flex flex-col justify-center">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 mb-6 relative overflow-hidden">
              <AlertTriangle className="absolute -top-6 -right-6 w-32 h-32 text-amber-200/50 -z-0" />
              <div className="relative z-10 flex items-start gap-4">
                <div className="bg-amber-100 p-3 rounded-full shrink-0">
                  <AlertTriangle className="w-8 h-8 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-amber-900 mb-2">
                    {history.length === 0 ? "Read Before You Start" : "Practice Mode"}
                  </h3>
                  
                  {history.length === 0 ? (
                    <div className="space-y-4 text-amber-800">
                      <p className="font-bold text-lg">Only your FIRST attempt will count.</p>
                      <p>
                        Your 1st attempt score goes on the leaderboard and earns you XP and coins. 2nd and further attempts are for learning only — they will not change your score or rank.
                      </p>
                      <p className="font-bold">You must score at least 60% to pass.</p>
                    </div>
                  ) : (
                    <div className="space-y-4 text-amber-800">
                      <p className="font-bold text-lg">This attempt will not affect your score.</p>
                      <p>
                        Because you have already taken this quiz, you are now in practice mode. You can retake this as many times as you want to improve your understanding.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white border rounded-xl p-6 shadow-sm">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="pt-1">
                  <input 
                    type="checkbox" 
                    checked={hasAcceptedWarning}
                    onChange={(e) => setHasAcceptedWarning(e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                  />
                </div>
                <div className="text-gray-700 font-medium select-none group-hover:text-gray-900 transition">
                  {history.length === 0 ? (
                    "I understand. My 2nd and further attempts will only be for my understanding — only my 1st attempt will count for the leaderboard and points."
                  ) : (
                    "I understand that this is a practice attempt and will not affect my score."
                  )}
                </div>
              </label>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleStartQuiz}
                  disabled={!hasAcceptedWarning || loading}
                  className="px-8 py-4 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  {loading ? "Starting..." : "Start Quiz"} <Maximize2 className="w-5 h-5 ml-1" />
                </button>
              </div>
            </div>
          </div>
        ) : currentQ ? (
          <form onSubmit={(e) => e.preventDefault()} className="h-full flex flex-col">
            <div className="flex-1 p-6 md:p-12 flex flex-col justify-center max-w-4xl mx-auto w-full">
              <div className="space-y-8 bg-white border p-8 rounded-2xl shadow-sm">
                <h3 className="font-bold text-2xl text-gray-900 leading-relaxed">
                  {currentQuestionIndex + 1}. {currentQ.questionText}
                </h3>
                <div className="space-y-4">
                  {currentQ.options.map((opt, optIndex) => (
                    <label
                      key={optIndex}
                      className="flex items-center gap-4 p-5 border-2 rounded-xl cursor-pointer hover:bg-blue-50 transition peer-checked:bg-blue-50 focus-within:border-blue-500 focus-within:bg-blue-50"
                    >
                      <input
                        type="radio"
                        value={optIndex.toString()}
                        {...register(currentQ.id, { required: true })}
                        className="w-5 h-5 text-blue-600 cursor-pointer border-gray-300 focus:ring-blue-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (currentQuestionIndex < (quiz.questions?.length || 0) - 1) {
                              handleNext();
                            } else {
                              handleSubmit(onSubmit)();
                            }
                          }
                        }}
                      />
                      <span className="text-gray-700 font-semibold text-lg">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-white flex justify-between items-center shrink-0">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentQuestionIndex === 0}
                className="px-6 py-3 border-2 border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <ChevronLeft className="w-5 h-5" /> Previous
              </button>
              
              {currentQuestionIndex < (quiz.questions?.length || 0) - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-8 py-3 bg-gray-900 text-white font-bold rounded-lg hover:bg-black transition flex items-center gap-2"
                >
                  Next Question <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit(onSubmit)}
                  disabled={loading}
                  className="px-8 py-3 bg-blue-600 text-white font-black rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50 shadow-md"
                >
                  {loading ? "Submitting..." : "Submit Quiz"} <CheckCircle2 className="w-5 h-5" />
                </button>
              )}
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
