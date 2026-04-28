"use client";

import { useState, useEffect } from "react";
import { Tag, Plus, Edit, XCircle } from "lucide-react";
import { CourseSelector } from "./CourseSelector";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState(10);
  const [scope, setScope] = useState("UNIVERSAL");
  const [courseId, setCourseId] = useState("");
  const [maxUses, setMaxUses] = useState("");
  
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/coupons");
      const data = await res.json();
      if (data.success) {
        setCoupons(data.coupons);
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          code, 
          discountType, 
          discountValue, 
          scope, 
          courseId: scope === "COURSE_SPECIFIC" ? courseId : null,
          maxUses: maxUses ? Number(maxUses) : null,
          onePerUser: true
        })
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        fetchData();
        setCode("");
        setDiscountValue(10);
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Coupons & Discounts</h1>
          <p className="text-gray-600">Create and manage promotional codes</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition">
          <Plus className="w-4 h-4"/> Create Coupon
        </button>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 text-left font-semibold text-gray-600">Code</th>
              <th className="p-4 text-left font-semibold text-gray-600">Discount</th>
              <th className="p-4 text-left font-semibold text-gray-600">Scope</th>
              <th className="p-4 text-center font-semibold text-gray-600">Uses</th>
              <th className="p-4 text-center font-semibold text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading...</td></tr>
            ) : coupons.length > 0 ? (
              coupons.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 transition">
                  <td className="p-4">
                    <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded border border-indigo-100">{c.code}</span>
                  </td>
                  <td className="p-4 font-bold text-gray-900">
                    {c.discountType === "PERCENTAGE" ? `${c.discountValue}%` : `₹${c.discountValue}`} OFF
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {c.scope === "UNIVERSAL" ? "All Courses" : c.course?.title || "Specific Course"}
                  </td>
                  <td className="p-4 text-center text-sm font-medium">
                    {c.usedCount} {c.maxUses ? `/ ${c.maxUses}` : ""}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${c.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5} className="p-8 text-center text-gray-500">No coupons found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold flex items-center gap-2"><Tag className="w-5 h-5"/> Create Coupon</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:bg-gray-100 p-1 rounded-full"><XCircle className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Coupon Code</label>
                <input required type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())} className="w-full border px-3 py-2 rounded-lg font-mono uppercase" placeholder="e.g. SUMMER50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Discount Type</label>
                  <select value={discountType} onChange={e => setDiscountType(e.target.value)} className="w-full border px-3 py-2 rounded-lg bg-white">
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Value</label>
                  <input required type="number" min="1" value={discountValue} onChange={e => setDiscountValue(Number(e.target.value))} className="w-full border px-3 py-2 rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Scope</label>
                <select value={scope} onChange={e => setScope(e.target.value)} className="w-full border px-3 py-2 rounded-lg bg-white">
                  <option value="UNIVERSAL">All Courses</option>
                  <option value="COURSE_SPECIFIC">Specific Course</option>
                </select>
              </div>
              {scope === "COURSE_SPECIFIC" && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Course</label>
                  <CourseSelector value={courseId} onChange={setCourseId} />
                </div>
              )}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Max Uses (Optional)</label>
                <input type="number" min="1" value={maxUses} onChange={e => setMaxUses(e.target.value)} className="w-full border px-3 py-2 rounded-lg" placeholder="Leave blank for unlimited" />
              </div>
              <div className="pt-4 flex justify-end gap-2 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
