"use client";

import { useState, useEffect } from "react";
import { Users, CheckCircle, Clock, XCircle, Award } from "lucide-react";

export default function AdminReferralsPage() {
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/referrals");
      const data = await res.json();
      if (data.success) {
        setReferrals(data.referrals);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleVerify = async (referralId: string, status: string, rewardAmount?: number) => {
    if (!confirm(`Are you sure you want to mark this as ${status}?`)) return;
    try {
      const res = await fetch("/api/admin/referrals/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referralId, status, rewardAmount })
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
      alert("Error processing verification");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Referral Program Management</h1>
        <p className="text-gray-600">Verify and reward student referrals to prevent fraud</p>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-left font-semibold text-gray-600">Date</th>
              <th className="p-4 text-left font-semibold text-gray-600">Referrer</th>
              <th className="p-4 text-left font-semibold text-gray-600">Referred User</th>
              <th className="p-4 text-center font-semibold text-gray-600">Status</th>
              <th className="p-4 text-right font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading...</td></tr>
            ) : referrals.length > 0 ? (
              referrals.map(r => (
                <tr key={r.id} className="hover:bg-gray-50 transition">
                  <td className="p-4 text-sm text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    <div className="font-bold text-gray-900">{r.referrer.name}</div>
                    <div className="text-xs text-gray-500">{r.referrer.email}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-gray-900">{r.referredUser.name}</div>
                    <div className="text-xs text-gray-500">{r.referredUser.email}</div>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center justify-center gap-1
                      ${r.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                        r.status === 'VERIFIED' ? 'bg-blue-100 text-blue-800' : 
                        r.status === 'REWARDED' ? 'bg-green-100 text-green-800' : 
                        'bg-red-100 text-red-800'}`}
                    >
                      {r.status === 'PENDING' && <Clock className="w-3 h-3"/>}
                      {r.status === 'VERIFIED' && <CheckCircle className="w-3 h-3"/>}
                      {r.status === 'REWARDED' && <CheckCircle className="w-3 h-3"/>}
                      {r.status === 'REJECTED' && <XCircle className="w-3 h-3"/>}
                      {r.status}
                    </span>
                    {r.rewardGiven && <div className="text-xs mt-1 text-green-600 font-bold">+{r.rewardValue} Coins</div>}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    {r.status === 'PENDING' && (
                      <>
                        <button onClick={() => handleVerify(r.id, "VERIFIED")} className="text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition">Verify</button>
                        <button onClick={() => handleVerify(r.id, "REJECTED")} className="text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg transition">Reject</button>
                      </>
                    )}
                    {r.status === 'VERIFIED' && (
                      <button onClick={() => handleVerify(r.id, "REWARDED", 500)} className="text-xs font-bold bg-green-50 text-green-600 hover:bg-green-100 px-3 py-1.5 rounded-lg transition flex items-center gap-1 ml-auto">
                        <Award className="w-3 h-3" /> Reward 500 Coins
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">No referrals found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
