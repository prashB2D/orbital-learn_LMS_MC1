"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PlayCircle, Trophy, Award, Download, Clock, BarChart3, Hexagon, Coins, TrendingUp, ShoppingBag, CheckCircle } from "lucide-react";
import SkillHexagon from "@/components/skills/SkillHexagon";
import StreakHeatmap from "@/components/activity/StreakHeatmap";

export default function DashboardClient({ user, coursesWithProgress, quizPerformance, badges }: any) {
  const [activeTab, setActiveTab] = useState<"LEARNING" | "ANALYTICS" | "ACHIEVEMENTS" | "ORDERS">("LEARNING");
  
  const [liveCoinBalance, setLiveCoinBalance] = useState<number>(0);
  const [liveCoinHistory, setLiveCoinHistory] = useState<any[]>([]);
  const [coinsLoading, setCoinsLoading] = useState(true);

  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const fetchCoinsData = async () => {
    try {
      setCoinsLoading(true);
      const [balanceRes, historyRes] = await Promise.all([
        fetch("/api/student/coins/balance").then(r => r.json()),
        fetch("/api/student/coins/history").then(r => r.json())
      ]);
      
      if (balanceRes.success) setLiveCoinBalance(balanceRes.coinBalance);
      if (historyRes.success) setLiveCoinHistory(historyRes.transactions);
    } catch (e) {
      console.error(e);
    } finally {
      setCoinsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoinsData();
    fetchOrders();
    
    // Add event listener for redemption to trigger refresh
    const handleRedemption = () => {
      fetchCoinsData();
      fetchOrders();
    };
    window.addEventListener('coin_redemption', handleRedemption);
    return () => window.removeEventListener('coin_redemption', handleRedemption);
  }, []);

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const res = await fetch("/api/student/orders").then(r => r.json());
      if (res.success) setOrders(res.orders);
    } catch (e) {
      console.error(e);
    } finally {
      setOrdersLoading(false);
    }
  };

  const markAsDelivered = async (orderId: string) => {
    if (!confirm("Are you sure you want to mark this as delivered?")) return;
    try {
      const res = await fetch(`/api/student/orders/${orderId}/delivered`, { method: "PUT" });
      const data = await res.json();
      if (data.success) {
        fetchOrders();
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const totalWatchTime = coursesWithProgress.reduce((sum: number, c: any) => sum + (c.watchTime || 0), 0);
  const watchTimeHours = Math.floor(totalWatchTime / 3600);
  
  return (
    <div className="space-y-8 max-w-7xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user.name}!</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-yellow-50 text-yellow-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2 border border-yellow-200">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span>{coinsLoading ? '...' : liveCoinBalance.toLocaleString()} Coins</span>
            <Link href="/store" className="ml-2 text-xs bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition">Store</Link>
            <Link href="/refer-and-earn" className="ml-1 text-xs bg-indigo-500 text-white px-2 py-1 rounded hover:bg-indigo-600 transition">Refer & Earn</Link>
          </div>
        </div>
      </div>

      <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-max">
        <button onClick={() => setActiveTab("LEARNING")} className={`px-4 py-2 text-sm font-bold rounded-lg transition ${activeTab === 'LEARNING' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Learning</button>
        <button onClick={() => setActiveTab("ANALYTICS")} className={`px-4 py-2 text-sm font-bold rounded-lg transition ${activeTab === 'ANALYTICS' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Analytics</button>
        <button onClick={() => setActiveTab("ACHIEVEMENTS")} className={`px-4 py-2 text-sm font-bold rounded-lg transition ${activeTab === 'ACHIEVEMENTS' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Achievements</button>
        <button onClick={() => setActiveTab("ORDERS")} className={`px-4 py-2 text-sm font-bold rounded-lg transition ${activeTab === 'ORDERS' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>My Orders</button>
      </div>

      {activeTab === "LEARNING" && (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <PlayCircle className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">My Learning Path</h2>
            </div>
            {coursesWithProgress.length > 0 ? (
              <div className="space-y-4">
                {coursesWithProgress.map((course: any) => (
                  <div key={course.id} className="bg-white rounded-xl border p-5 shadow-sm hover:shadow-md transition">
                    <div className="flex gap-4">
                      <img src={course.thumbnail} alt={course.title} className="w-24 h-24 object-cover rounded-lg border bg-gray-100" />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg line-clamp-1">{course.title}</h3>
                          <div className="flex items-center justify-between mt-2 text-sm">
                            <span className="font-medium text-blue-600">{course.progressPercentage}% Complete</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1.5 overflow-hidden">
                            <div className={`h-2 rounded-full transition-all duration-1000 ${course.progressPercentage === 100 ? "bg-green-500" : "bg-blue-600"}`} style={{ width: `${course.progressPercentage}%` }} />
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          {course.progressPercentage < 100 ? (
                            <Link href={`/courses/${course.slug}/learn`} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition">Continue Learning</Link>
                          ) : (
                            <div className="flex gap-2">
                              <Link href={`/courses/${course.slug}/learn`} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition">Review Material</Link>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border p-8 text-center text-gray-500">
                <p>You haven't enrolled in any courses yet.</p>
                <Link href="/courses" className="text-blue-600 hover:underline mt-2 inline-block font-medium">Browse Catalog</Link>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <StreakHeatmap />
          </div>
        </div>
      )}

      {activeTab === "ANALYTICS" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center"><Clock className="w-6 h-6" /></div>
              <div><p className="text-sm font-bold text-gray-500 uppercase">Total Watch Time</p><p className="text-3xl font-black text-gray-900">{watchTimeHours}h</p></div>
            </div>
            <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center"><BarChart3 className="w-6 h-6" /></div>
              <div><p className="text-sm font-bold text-gray-500 uppercase">Quizzes Taken</p><p className="text-3xl font-black text-gray-900">{quizPerformance.length}</p></div>
            </div>
            <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center"><TrendingUp className="w-6 h-6" /></div>
              <div><p className="text-sm font-bold text-gray-500 uppercase">Avg Quiz Score</p><p className="text-3xl font-black text-gray-900">
                {quizPerformance.length > 0 ? Math.round(quizPerformance.reduce((s: any, q: any) => s + q.bestScore, 0) / quizPerformance.length) : 0}%
              </p></div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mt-8">
            <div className="bg-white rounded-xl border p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Hexagon className="w-5 h-5 text-indigo-600" /> Skill Progress</h2>
              <SkillHexagon />
            </div>
            <div className="bg-white rounded-xl border p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quiz Performance</h2>
              {quizPerformance.length > 0 ? (
                <div className="space-y-4">
                  {quizPerformance.map((quiz: any) => (
                    <div key={quiz.quizId} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <p className="font-bold">{quiz.quizTitle}</p>
                        <p className="text-xs text-gray-500">Rank: #{quiz.yourRank}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-blue-600">{quiz.bestScore}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No quizzes taken yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "ACHIEVEMENTS" && (
        <div className="space-y-8">
          <div className="bg-white rounded-2xl border shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2"><Award className="w-6 h-6 text-purple-600" /> Badges Gallery</h2>
            {badges.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {badges.map((sb: any) => (
                  <div key={sb.badge.id} className="border rounded-xl p-4 flex flex-col items-center text-center hover:bg-gray-50 transition" title={sb.comment || sb.badge.description}>
                    <div className="text-4xl mb-2">{sb.badge.icon}</div>
                    <p className="font-bold text-xs text-gray-900">{sb.badge.name}</p>
                    <span className="text-[10px] mt-1 bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{sb.badge.type === "AUTOMATED" ? "System" : "Mentor"}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No badges earned yet.</p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Download className="w-5 h-5 text-green-600" /> Certificates</h2>
              <div className="space-y-3">
                {coursesWithProgress.filter((c: any) => c.certificateUrl).length > 0 ? (
                  coursesWithProgress.filter((c: any) => c.certificateUrl).map((c: any) => (
                    <div key={c.id} className="flex justify-between items-center border p-3 rounded-xl bg-gray-50">
                      <p className="font-bold text-sm text-gray-900">{c.title}</p>
                      <a href={c.certificateUrl} target="_blank" rel="noreferrer" className="text-xs font-bold bg-green-100 text-green-700 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-green-200 transition">
                        Download
                      </a>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm italic">Complete courses to earn certificates.</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
              <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Coins className="w-5 h-5 text-yellow-500" /> Coin History</h2>
                <Link href="/store" className="text-sm font-bold text-blue-600 hover:underline">Redeem</Link>
              </div>
              <div className="p-0">
                {coinsLoading ? (
                  <p className="text-gray-500 text-sm p-6 text-center">Loading transactions...</p>
                ) : liveCoinHistory.length > 0 ? (
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                        <tr>
                          <th className="p-3 text-left">Date</th>
                          <th className="p-3 text-left">Source</th>
                          <th className="p-3 text-left">Mentor</th>
                          <th className="p-3 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {liveCoinHistory.map((tx: any) => (
                          <tr key={tx.id} className="hover:bg-gray-50">
                            <td className="p-3 text-gray-500 text-xs whitespace-nowrap">{new Date(tx.date).toLocaleDateString()}</td>
                            <td className="p-3 font-medium text-gray-900">
                              <div>{tx.source}</div>
                              {tx.rank && <div className="text-xs text-yellow-600">Rank #{tx.rank}</div>}
                            </td>
                            <td className="p-3 text-gray-600">{tx.awardedBy}</td>
                            <td className={`p-3 text-right font-bold ${tx.type === 'EARNED' ? 'text-yellow-600' : 'text-red-500'}`}>
                              {tx.type === 'EARNED' ? '+' : '-'}{tx.amount}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm p-6 text-center">No coin transactions yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "ORDERS" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2"><ShoppingBag className="w-6 h-6 text-blue-600" /> My Orders</h2>
            {ordersLoading ? (
              <p className="text-gray-500 text-center py-8">Loading orders...</p>
            ) : orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((order: any) => {
                  const statusIdx = ["PENDING", "REVIEWING", "VERIFIED", "DELIVERED"].indexOf(order.status);
                  // Treat PENDING as visually filling both 1 and 2
                  const displayIdx = order.status === "PENDING" ? 1 : statusIdx;
                  
                  return (
                    <div key={order.id} className="border rounded-xl p-6 bg-white shadow-sm flex flex-col md:flex-row gap-6 items-center">
                      <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center text-4xl overflow-hidden shrink-0">
                        {order.item.imageUrl ? <img src={order.item.imageUrl} className="w-full h-full object-cover"/> : "🎁"}
                      </div>
                      <div className="flex-1 space-y-4 w-full">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-xl text-gray-900">{order.item.name}</h3>
                            <p className="text-sm text-gray-500">Requested on {new Date(order.createdAt).toLocaleDateString()}</p>
                          </div>
                          <span className="font-bold text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full text-sm">{order.coinsRedeemed} coins</span>
                        </div>
                        
                        {order.status === "REJECTED" ? (
                          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold border border-red-100">
                            Order Rejected. Coins have been refunded.
                          </div>
                        ) : (
                          <div className="relative pt-4 w-full max-w-2xl">
                            {/* Tracker Line */}
                            <div className="absolute top-6 left-0 w-full h-1 bg-gray-200 rounded-full -z-10"></div>
                            <div className="absolute top-6 left-0 h-1 bg-blue-600 rounded-full -z-10 transition-all duration-500" 
                                 style={{ width: `${(Math.max(0, displayIdx) / 3) * 100}%` }}></div>
                            
                            <div className="flex justify-between relative">
                              {["Requested", "Admin reviewing", "Verified & sent", "Delivered"].map((step, idx) => {
                                const isCompleted = displayIdx >= idx;
                                const isCurrent = displayIdx === idx;
                                return (
                                  <div key={step} className="flex flex-col items-center gap-2">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isCompleted ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}>
                                      {isCompleted && <CheckCircle className="w-3 h-3 text-white" />}
                                    </div>
                                    <span className={`text-xs font-bold text-center max-w-[80px] ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>{step}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                      {order.status === "VERIFIED" && (
                        <div className="shrink-0">
                          <button onClick={() => markAsDelivered(order.id)} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold shadow-sm transition whitespace-nowrap">
                            Mark as Delivered
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No orders found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
