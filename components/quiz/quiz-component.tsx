"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Trophy, History, ArrowRight } from "lucide-react";

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

  const { register, handleSubmit, reset } = useForm();

  // Fetch past attempts on mount
  useEffect(() => {
    fetchHistory();
  }, [quiz.id]);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`/api/quiz/attempts/${quiz.id}`);
      const data = await res.json();
      if (data.attempts) {
        setHistory(data.attempts);
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

      const res = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: quiz.id,
          answers: formattedAnswers,
        }),
      });

      const parsed = await res.json();

      if (parsed.success) {
        setResult(parsed);
        fetchHistory(); // Refresh history table natively
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
  };

  if (result) {
    return (
      <div className="bg-white rounded-lg border p-8 flex flex-col items-center justify-center space-y-6">
        <div className="p-4 bg-yellow-100 text-yellow-800 rounded-full">
          <Trophy className="w-16 h-16" />
        </div>
        <h2 className="text-3xl font-bold">Quiz Completed!</h2>

        <div className="grid grid-cols-3 gap-6 w-full max-w-md text-center">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Score</p>
            <p className="text-2xl font-bold text-gray-900">{result.score}%</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-xs text-green-600 font-bold uppercase tracking-wider">Rank</p>
            <p className="text-2xl font-bold text-gray-900">#{result.rank}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-xs text-purple-600 font-bold uppercase tracking-wider">Attempt</p>
            <p className="text-2xl font-bold text-gray-900">{result.attemptNumber}</p>
          </div>
        </div>

        <button
          onClick={handleRetry}
          className="mt-4 px-8 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition"
        >
          Try Again
        </button>
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
