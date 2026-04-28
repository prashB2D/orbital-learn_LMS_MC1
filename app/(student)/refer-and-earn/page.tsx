"use client";

import { useState, useEffect } from "react";
import { Users, Copy, Share2, CheckCircle, Clock } from "lucide-react";

export default function ReferAndEarnPage() {
  const [code, setCode] = useState("");
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchReferralData = async () => {
    try {
      const res = await fetch("/api/student/referral-code");
      const data = await res.json();
      if (data.success) {
        setCode(data.referralCode);
        setReferrals(data.referrals || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferralData();
  }, []);

  const shareLink = typeof window !== "undefined" ? `${window.location.origin}/register?ref=${code}` : "";
  const whatsappMsg = `Join this amazing platform and let's learn together! Use my referral code ${code} or click the link to sign up: ${shareLink}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalEarned = referrals.filter(r => r.rewardGiven).reduce((sum, r) => sum + (r.rewardValue || 0), 0);

  if (loading) return <div className="text-center py-20 text-gray-500">Loading referral program...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-8 text-white shadow-xl text-center">
        <Users className="w-16 h-16 mx-auto mb-4 text-indigo-200" />
        <h1 className="text-4xl font-black mb-2 tracking-tight">Refer & Earn</h1>
        <p className="text-lg opacity-90 font-medium max-w-lg mx-auto">Invite your friends to learn with you. You both earn 500 coins when they sign up and verify their account!</p>
      </div>

      <div className="bg-white p-8 rounded-3xl border shadow-sm flex flex-col items-center">
        <p className="text-sm uppercase tracking-widest font-bold text-gray-500 mb-4">Your Unique Code</p>
        <div className="flex items-center gap-4 bg-gray-50 border-2 border-dashed border-gray-300 p-4 rounded-xl">
          <span className="text-3xl font-mono font-bold tracking-widest text-indigo-600">{code}</span>
          <button 
            onClick={() => copyToClipboard(code)}
            className="p-3 bg-white hover:bg-gray-100 rounded-lg shadow-sm border transition text-gray-700 font-bold flex items-center gap-2"
          >
            {copied ? <CheckCircle className="w-5 h-5 text-green-500"/> : <Copy className="w-5 h-5"/>}
          </button>
        </div>

        <div className="w-full mt-8 max-w-lg">
          <label className="block text-sm font-bold text-gray-700 mb-2">Shareable Link</label>
          <div className="flex gap-2">
            <input type="text" readOnly value={shareLink} className="flex-1 bg-gray-50 border px-4 py-3 rounded-xl outline-none font-medium text-gray-600" />
            <button onClick={() => copyToClipboard(shareLink)} className="px-6 bg-gray-900 hover:bg-black text-white font-bold rounded-xl transition">Copy Link</button>
          </div>
        </div>

        <div className="mt-8 flex gap-4 w-full justify-center">
          <a 
            href={`https://wa.me/?text=${encodeURIComponent(whatsappMsg)}`} 
            target="_blank" rel="noreferrer"
            className="px-6 py-3 bg-[#25D366] hover:bg-[#1DA851] text-white font-bold rounded-xl shadow-sm transition flex items-center gap-2"
          >
            <Share2 className="w-5 h-5"/> Share on WhatsApp
          </a>
        </div>
      </div>

      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900">Your Referrals</h2>
          <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg font-bold">
            Total Earned: {totalEarned} Coins
          </div>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50/50 border-b">
            <tr>
              <th className="p-4 text-left font-semibold text-gray-600">Friend</th>
              <th className="p-4 text-left font-semibold text-gray-600">Date</th>
              <th className="p-4 text-center font-semibold text-gray-600">Status</th>
              <th className="p-4 text-right font-semibold text-gray-600">Reward</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {referrals.length > 0 ? (
              referrals.map(r => (
                <tr key={r.id} className="hover:bg-gray-50 transition">
                  <td className="p-4 font-bold text-gray-900">{r.referredUser.name}</td>
                  <td className="p-4 text-sm text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1
                      ${r.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                        r.status === 'VERIFIED' ? 'bg-blue-100 text-blue-800' : 
                        r.status === 'REWARDED' ? 'bg-green-100 text-green-800' : 
                        'bg-red-100 text-red-800'}`}
                    >
                      {r.status === 'PENDING' && <Clock className="w-3 h-3"/>}
                      {r.status === 'VERIFIED' && <CheckCircle className="w-3 h-3"/>}
                      {r.status === 'REWARDED' && <CheckCircle className="w-3 h-3"/>}
                      {r.status}
                    </span>
                  </td>
                  <td className="p-4 text-right font-bold text-yellow-600">
                    {r.rewardGiven ? `+${r.rewardValue} Coins` : "-"}
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={4} className="p-8 text-center text-gray-500">You haven't referred anyone yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
