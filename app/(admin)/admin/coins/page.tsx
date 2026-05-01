"use client";

import { useState, useEffect, useCallback } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import {
  Coins, Users, TrendingUp, AlertTriangle, ChevronDown, ChevronRight,
  Eye, X, Activity, Award, BarChart3
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface StudentRow {
  id: string; name: string; email: string;
  coinBalance: number; totalEarned: number; totalRedeemed: number; lastReceived: string | null;
}

interface MentorRow {
  id: string; name: string; email: string;
  coinAwardLimit: number; coinsThisMonth: number; coinsAllTime: number;
  lastAward: string | null; inactive: boolean;
}

interface TxRow {
  id: string; amount: number; reason: string; awardedAt: string; isWithdrawal: boolean;
  awardedBy: { name: string } | null;
  course: { title: string } | null;
  quiz: { title: string } | null;
  externalCourseName: string | null;
  externalQuizRef: string | null;
}

interface RedemptionRow {
  id: string; coinsRedeemed: number; status: string; createdAt: string;
  item: { name: string };
}

interface GraphPoint { date: string; totalCoinsAwarded: number; }

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: any; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <div className={`${color} rounded-2xl p-5 flex items-center gap-4 shadow-sm border`}>
      <div className="p-3 bg-white/60 rounded-xl">
        <Icon className="w-7 h-7" />
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider opacity-70">{label}</p>
        <p className="text-3xl font-black">{value}</p>
        {sub && <p className="text-xs opacity-60 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function CoinFlowChart() {
  const [period, setPeriod] = useState<"day" | "week" | "month">("week");
  const [data, setData] = useState<GraphPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/coins/graph?period=${period}`)
      .then(r => r.json())
      .then(d => { if (d.success) setData(d.graph); })
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <div className="bg-white rounded-2xl border shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-500" /> Coin Flow Over Time
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">Platform-wide coins awarded per period</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg gap-1">
          {(["day", "week", "month"] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-sm font-bold rounded-md capitalize transition ${period === p ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
            >{p}</button>
          ))}
        </div>
      </div>
      {loading ? (
        <div className="h-64 flex items-center justify-center text-gray-400">Loading chart...</div>
      ) : data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-400 italic">No coin data yet.</div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb", fontSize: 13 }}
              labelStyle={{ fontWeight: 700 }}
            />
            <Line
              type="monotone" dataKey="totalCoinsAwarded" name="Coins Awarded"
              stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3, fill: "#6366f1" }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

function StudentTimeline({ student, onClose }: { student: StudentRow; onClose: () => void }) {
  const [data, setData] = useState<{ transactions: TxRow[]; redemptions: RedemptionRow[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/coins/student/${student.id}`)
      .then(r => r.json())
      .then(d => { if (d.success) setData(d); })
      .finally(() => setLoading(false));
  }, [student.id]);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 border-b flex justify-between items-center shrink-0 bg-gray-50">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{student.name} — Coin Timeline</h3>
            <p className="text-sm text-gray-500">{student.email} · Balance: <span className="font-bold text-indigo-600">{student.coinBalance} coins</span></p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 p-8">Loading...</div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Transactions */}
            <div>
              <h4 className="font-bold text-gray-700 uppercase text-xs tracking-wider mb-3">Coin Transactions</h4>
              {data?.transactions.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No transactions.</p>
              ) : (
                <div className="border rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="p-3 text-left font-semibold text-gray-600">Date</th>
                        <th className="p-3 text-left font-semibold text-gray-600">Amount</th>
                        <th className="p-3 text-left font-semibold text-gray-600">Source</th>
                        <th className="p-3 text-left font-semibold text-gray-600">Mentor</th>
                        <th className="p-3 text-left font-semibold text-gray-600">Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {data?.transactions.map((tx) => {
                        const source = tx.quiz?.title || tx.externalQuizRef ||
                          tx.course?.title || tx.externalCourseName || "—";
                        const isNeg = tx.amount < 0 || tx.isWithdrawal;
                        return (
                          <tr key={tx.id} className="hover:bg-gray-50">
                            <td className="p-3 text-gray-500 whitespace-nowrap">
                              {new Date(tx.awardedAt).toLocaleDateString()}
                            </td>
                            <td className={`p-3 font-bold ${isNeg ? "text-red-600" : "text-green-600"}`}>
                              {isNeg ? "" : "+"}{tx.amount}
                            </td>
                            <td className="p-3 text-gray-700 max-w-[160px] truncate">{source}</td>
                            <td className="p-3 text-gray-700">{tx.awardedBy?.name || "System"}</td>
                            <td className="p-3 text-gray-500 max-w-[200px] truncate" title={tx.reason}>{tx.reason || "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Redemptions */}
            <div>
              <h4 className="font-bold text-gray-700 uppercase text-xs tracking-wider mb-3">Store Redemptions</h4>
              {data?.redemptions.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No redemptions.</p>
              ) : (
                <div className="border rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="p-3 text-left font-semibold text-gray-600">Date</th>
                        <th className="p-3 text-left font-semibold text-gray-600">Item</th>
                        <th className="p-3 text-left font-semibold text-gray-600">Coins</th>
                        <th className="p-3 text-left font-semibold text-gray-600">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {data?.redemptions.map((r) => (
                        <tr key={r.id} className="hover:bg-gray-50">
                          <td className="p-3 text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                          <td className="p-3 font-semibold text-gray-800">{r.item.name}</td>
                          <td className="p-3 font-bold text-orange-600">-{r.coinsRedeemed}</td>
                          <td className="p-3">
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                              r.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                              r.status === "DELIVERED" ? "bg-blue-100 text-blue-700" :
                              r.status === "REJECTED" ? "bg-red-100 text-red-700" :
                              "bg-yellow-100 text-yellow-700"
                            }`}>{r.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MentorHistory({ mentor, onClose }: { mentor: MentorRow; onClose: () => void }) {
  const [txs, setTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/coins/mentor/${mentor.id}`)
      .then(r => r.json())
      .then(d => { if (d.success) setTxs(d.transactions); })
      .finally(() => setLoading(false));
  }, [mentor.id]);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 border-b flex justify-between items-center shrink-0 bg-gray-50">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{mentor.name} — Award History</h3>
            <p className="text-sm text-gray-500">{mentor.email} · Limit: {mentor.coinAwardLimit}/mo · This month: {mentor.coinsThisMonth}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-gray-400">Loading...</div>
        ) : txs.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 italic">No awards given yet.</div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b sticky top-0">
                <tr>
                  <th className="p-3 text-left font-semibold text-gray-600">Date</th>
                  <th className="p-3 text-left font-semibold text-gray-600">Student</th>
                  <th className="p-3 text-left font-semibold text-gray-600">Amount</th>
                  <th className="p-3 text-left font-semibold text-gray-600">Source</th>
                  <th className="p-3 text-left font-semibold text-gray-600">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {txs.map((tx: any) => {
                  const source = tx.quiz?.title || tx.externalQuizRef ||
                    tx.course?.title || tx.externalCourseName || "—";
                  return (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="p-3 text-gray-500 whitespace-nowrap">{new Date(tx.awardedAt).toLocaleDateString()}</td>
                      <td className="p-3 font-semibold text-gray-800">{tx.user?.name || "—"}</td>
                      <td className="p-3 font-bold text-green-600">+{tx.amount}</td>
                      <td className="p-3 text-gray-600 max-w-[150px] truncate">{source}</td>
                      <td className="p-3 text-gray-500 max-w-[200px] truncate" title={tx.reason}>{tx.reason || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminCoinsPage() {
  const [tab, setTab] = useState<"students" | "mentors">("students");
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [mentors, setMentors] = useState<MentorRow[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingMentors, setLoadingMentors] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<StudentRow | null>(null);
  const [selectedMentor, setSelectedMentor] = useState<MentorRow | null>(null);

  const fetchStudents = useCallback(async () => {
    setLoadingStudents(true);
    try {
      const res = await fetch("/api/admin/coins/overview");
      const data = await res.json();
      if (data.success) setStudents(data.students);
    } finally { setLoadingStudents(false); }
  }, []);

  const fetchMentors = useCallback(async () => {
    setLoadingMentors(true);
    try {
      const res = await fetch("/api/admin/coins/mentors");
      const data = await res.json();
      if (data.success) setMentors(data.mentors);
    } finally { setLoadingMentors(false); }
  }, []);

  useEffect(() => { fetchStudents(); fetchMentors(); }, [fetchStudents, fetchMentors]);

  // Summary stats
  const totalCirculating = students.reduce((s, st) => s + st.coinBalance, 0);
  const totalEverAwarded = students.reduce((s, st) => s + st.totalEarned, 0);
  const inactiveMentors = mentors.filter(m => m.inactive).length;
  const topStudent = students[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Coin Oversight</h1>
        <p className="text-gray-500 mt-1">Full audit trail for all coin transactions, mentor activity, and student balances.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Coins} label="Total Circulating" value={totalCirculating.toLocaleString()} sub="across all students" color="bg-yellow-50 text-yellow-800 border-yellow-200" />
        <StatCard icon={TrendingUp} label="Total Ever Awarded" value={totalEverAwarded.toLocaleString()} sub="all time" color="bg-green-50 text-green-800 border-green-200" />
        <StatCard icon={Users} label="Total Students" value={students.length} sub="with accounts" color="bg-blue-50 text-blue-800 border-blue-200" />
        <StatCard icon={AlertTriangle} label="Inactive Mentors" value={inactiveMentors} sub="no awards in 30 days" color={inactiveMentors > 0 ? "bg-red-50 text-red-800 border-red-200" : "bg-gray-50 text-gray-700 border-gray-200"} />
      </div>

      {/* Chart */}
      <CoinFlowChart />

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setTab("students")}
          className={`px-5 py-2 text-sm font-bold rounded-lg transition flex items-center gap-2 ${tab === "students" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-800"}`}
        >
          <Users className="w-4 h-4" /> Students
        </button>
        <button
          onClick={() => setTab("mentors")}
          className={`px-5 py-2 text-sm font-bold rounded-lg transition flex items-center gap-2 ${tab === "mentors" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-800"}`}
        >
          <Award className="w-4 h-4" /> Mentors
        </button>
      </div>

      {/* Students table */}
      {tab === "students" && (
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="p-5 border-b bg-gray-50">
            <h2 className="font-bold text-lg text-gray-900">Student Coin Balances</h2>
            <p className="text-sm text-gray-500">Sorted by current balance. Click a row for full timeline.</p>
          </div>
          {loadingStudents ? (
            <div className="p-12 text-center text-gray-400">Loading students...</div>
          ) : students.length === 0 ? (
            <div className="p-12 text-center text-gray-400 italic">No students found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-white">
                  <tr>
                    <th className="p-4 text-left font-semibold text-gray-600">Student</th>
                    <th className="p-4 text-right font-semibold text-gray-600">Balance</th>
                    <th className="p-4 text-right font-semibold text-gray-600">Total Earned</th>
                    <th className="p-4 text-right font-semibold text-gray-600">Total Redeemed</th>
                    <th className="p-4 text-right font-semibold text-gray-600">Last Received</th>
                    <th className="p-4 text-center font-semibold text-gray-600">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {students.map((s, i) => (
                    <tr key={s.id} className="hover:bg-indigo-50/40 transition cursor-pointer" onClick={() => setSelectedStudent(s)}>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
                            {s.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{s.name}</p>
                            <p className="text-xs text-gray-500">{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <span className={`text-lg font-black ${i === 0 ? "text-indigo-600" : "text-gray-900"}`}>
                          {s.coinBalance.toLocaleString()}
                        </span>
                      </td>
                      <td className="p-4 text-right font-semibold text-green-600">{s.totalEarned.toLocaleString()}</td>
                      <td className="p-4 text-right font-semibold text-orange-600">{s.totalRedeemed.toLocaleString()}</td>
                      <td className="p-4 text-right text-gray-500 text-xs">
                        {s.lastReceived ? new Date(s.lastReceived).toLocaleDateString() : "Never"}
                      </td>
                      <td className="p-4 text-center">
                        <button className="p-2 hover:bg-indigo-100 rounded-lg transition text-indigo-600">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Mentors table */}
      {tab === "mentors" && (
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="p-5 border-b bg-gray-50">
            <h2 className="font-bold text-lg text-gray-900">Mentor Coin Activity</h2>
            <p className="text-sm text-gray-500">Red highlight = no awards in 30+ days. Click for full award history.</p>
          </div>
          {loadingMentors ? (
            <div className="p-12 text-center text-gray-400">Loading mentors...</div>
          ) : mentors.length === 0 ? (
            <div className="p-12 text-center text-gray-400 italic">No mentors found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-white">
                  <tr>
                    <th className="p-4 text-left font-semibold text-gray-600">Mentor</th>
                    <th className="p-4 text-right font-semibold text-gray-600">This Month</th>
                    <th className="p-4 text-right font-semibold text-gray-600">All Time</th>
                    <th className="p-4 text-right font-semibold text-gray-600">Last Award</th>
                    <th className="p-4 text-right font-semibold text-gray-600">Limit/mo</th>
                    <th className="p-4 text-center font-semibold text-gray-600">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {mentors.map(m => (
                    <tr
                      key={m.id}
                      className={`transition cursor-pointer ${m.inactive ? "bg-red-50 hover:bg-red-100" : "hover:bg-gray-50"}`}
                      onClick={() => setSelectedMentor(m)}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {m.inactive && (
                            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                          )}
                          <div>
                            <p className="font-semibold text-gray-900">{m.name}</p>
                            <p className="text-xs text-gray-500">{m.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-right font-bold text-indigo-600">{m.coinsThisMonth}</td>
                      <td className="p-4 text-right font-semibold text-gray-700">{m.coinsAllTime}</td>
                      <td className="p-4 text-right text-xs text-gray-500">
                        {m.lastAward ? new Date(m.lastAward).toLocaleDateString() : <span className="text-red-500 font-bold">Never</span>}
                      </td>
                      <td className="p-4 text-right text-gray-700">{m.coinAwardLimit}</td>
                      <td className="p-4 text-center">
                        <button className="p-2 hover:bg-indigo-100 rounded-lg transition text-indigo-600">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Drill-down panels */}
      {selectedStudent && <StudentTimeline student={selectedStudent} onClose={() => setSelectedStudent(null)} />}
      {selectedMentor && <MentorHistory mentor={selectedMentor} onClose={() => setSelectedMentor(null)} />}
    </div>
  );
}
