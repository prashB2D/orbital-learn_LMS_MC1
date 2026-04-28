"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Edit2, Trash2, Trophy, Coins, X } from "lucide-react";
import { useState, useEffect } from "react";
import { ConfirmDeleteModal } from "@/components/admin/ConfirmDeleteModal";

export function ContentActions({ courseSlug, contentId, type }: { courseSlug: string, contentId: string, type: 'LESSON' | 'QUIZ' }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  const [awardingTo, setAwardingTo] = useState<any>(null);
  const [awardComment, setAwardComment] = useState("");

  const fetchLeaderboard = async () => {
    setLeaderboardLoading(true);
    try {
      const res = await fetch(`/api/mentor/quiz-leaderboard?quizId=${contentId}`);
      const data = await res.json();
      if (data.success) {
        setLeaderboard(data.leaderboard);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  const handleAwardCoins = async () => {
    if (!awardingTo) return;
    try {
      const res = await fetch("/api/mentor/coins/award", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: awardingTo.userId,
          courseId: awardingTo.courseId,
          quizId: awardingTo.quizId,
          rank: awardingTo.rank,
          amount: awardingTo.rank === 1 ? 10 : awardingTo.rank === 2 ? 7 : 5,
          comment: awardComment || `Awarded for rank #${awardingTo.rank} in quiz`
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(`${awardingTo.rank === 1 ? 10 : awardingTo.rank === 2 ? 7 : 5} coins awarded to ${awardingTo.name}`);
        setAwardingTo(null);
        setAwardComment("");
        fetchLeaderboard(); // refresh
      } else {
        alert(data.error || "Failed to award coins");
      }
    } catch (e) {
      console.error(e);
      alert("Error awarding coins");
    }
  };

  useEffect(() => {
    if (isLeaderboardOpen) {
      fetchLeaderboard();
    }
  }, [isLeaderboardOpen]);

  const handleDelete = async () => {
    setIsModalOpen(false);
    setLoading(true);
    try {
      const res = await fetch(`/api/content/${contentId}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to delete content");
      }
    } catch (e) {
      alert("Error deleting content");
    } finally {
      setLoading(false);
    }
  };

  const editPath = type === 'LESSON' ? 'edit-lesson' : 'edit-quiz';

  return (
    <>
      <div className="flex items-center gap-2 shrink-0">
        {type === 'QUIZ' && (
          <button onClick={() => setIsLeaderboardOpen(true)} className="p-2 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded transition">
            <Trophy className="w-4 h-4" />
          </button>
        )}
        <Link href={`/admin/courses/${courseSlug}/content/${editPath}/${contentId}`} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition">
          <Edit2 className="w-4 h-4" />
        </Link>
        <button disabled={loading} onClick={() => setIsModalOpen(true)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {isLeaderboardOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-500"/> Quiz Leaderboard</h2>
              <button onClick={() => setIsLeaderboardOpen(false)} className="text-gray-500 hover:bg-gray-200 p-1 rounded-full"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6">
              {leaderboardLoading ? (
                <div className="text-center text-gray-500 py-8">Loading...</div>
              ) : leaderboard.length === 0 ? (
                <div className="text-center text-gray-500 py-8">No attempts yet.</div>
              ) : (
                <div className="space-y-4">
                  {leaderboard.map(lb => (
                    <div key={lb.userId} className="flex items-center justify-between border p-4 rounded-xl">
                      <div>
                        <div className="font-bold flex items-center gap-2">
                          {lb.rank === 1 ? "🥇" : lb.rank === 2 ? "🥈" : "🥉"} {lb.name}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">Score: {lb.score}% • Time: {lb.timeTaken}s</div>
                      </div>
                      <button 
                        onClick={() => setAwardingTo(lb)}
                        disabled={lb.alreadyAwarded}
                        className="px-3 py-1.5 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 text-xs font-bold rounded-lg flex items-center gap-1 disabled:opacity-50 transition"
                      >
                        <Coins className="w-3 h-3" /> {lb.alreadyAwarded ? "Awarded" : "Award Coins"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {awardingTo && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Coins className="text-yellow-500 w-5 h-5"/> Award Coins to {awardingTo.name}
            </h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Rank</label>
                  <input type="text" readOnly value={`#${awardingTo.rank}`} className="w-full bg-gray-50 border px-3 py-2 rounded-lg outline-none" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Coins</label>
                  <input type="text" readOnly value={awardingTo.rank === 1 ? "10" : awardingTo.rank === 2 ? "7" : "5"} className="w-full bg-gray-50 border px-3 py-2 rounded-lg outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Comment (Optional)</label>
                <textarea 
                  value={awardComment}
                  onChange={e => setAwardComment(e.target.value)}
                  className="w-full border px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Excellent work!"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setAwardingTo(null)} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleAwardCoins} className="px-4 py-2 font-bold text-white bg-yellow-500 hover:bg-yellow-600 rounded-lg">Confirm Award</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDelete}
        itemName={type === 'LESSON' ? 'Class' : 'Quiz'}
      />
    </>
  );
}
