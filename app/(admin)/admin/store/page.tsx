"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, CheckCircle, XCircle, Clock, Plus, Edit, Trash } from "lucide-react";

export default function AdminStorePage() {
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"REDEMPTIONS" | "INVENTORY">("REDEMPTIONS");
  const [loading, setLoading] = useState(true);

  // Review Modal state
  const [reviewRedemption, setReviewRedemption] = useState<any>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [reportLoading, setReportLoading] = useState(false);

  // Form for item creation & editing
  const [showItemModal, setShowItemModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [baseCoinPrice, setBaseCoinPrice] = useState(100);
  const [offerEnabled, setOfferEnabled] = useState(false);
  const [offerPercent, setOfferPercent] = useState(0);
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [stock, setStock] = useState(0);
  const [imageUrl, setImageUrl] = useState("");
  const [detailHtmlTop, setDetailHtmlTop] = useState("");
  const [detailHtmlBottom, setDetailHtmlBottom] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [redRes, itemRes] = await Promise.all([
        fetch("/api/admin/coins/redemptions"),
        fetch("/api/store")
      ]);
      const redData = await redRes.json();
      const itemData = await itemRes.json();
      if (redData.success) setRedemptions(redData.redemptions);
      if (itemData.success) setItems(itemData.items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (redemptionId: string, status: string) => {
    if (!confirm(`Are you sure you want to mark this as ${status}?`)) return;
    try {
      const res = await fetch("/api/admin/coins/redemptions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ redemptionId, status })
      });
      const data = await res.json();
      if (data.success) {
        setReviewRedemption(null);
        fetchData();
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openReview = async (redemption: any) => {
    setReviewRedemption(redemption);
    setReportLoading(true);
    try {
      const res = await fetch(`/api/admin/coins/redemptions/${redemption.id}/report`);
      const data = await res.json();
      if (data.success) {
        setReportData(data.report);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setReportLoading(false);
    }
  };

  const openItemModal = (item?: any) => {
    if (item) {
      setEditId(item.id);
      setName(item.name);
      setDescription(item.description);
      setBaseCoinPrice(item.baseCoinPrice || item.costInCoins);
      setOfferPercent(item.offerPercent || 0);
      setOfferEnabled(item.offerPercent > 0);
      setIsUnlimited(item.isUnlimited);
      setStock(item.stockCount);
      setImageUrl(item.imageUrl || "");
      setDetailHtmlTop(item.detailHtmlTop || "");
      setDetailHtmlBottom(item.detailHtmlBottom || "");
    } else {
      setEditId(null);
      setName("");
      setDescription("");
      setBaseCoinPrice(100);
      setOfferEnabled(false);
      setOfferPercent(0);
      setIsUnlimited(false);
      setStock(0);
      setImageUrl("");
      setDetailHtmlTop("");
      setDetailHtmlBottom("");
    }
    setShowItemModal(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      id: editId,
      name,
      description,
      baseCoinPrice,
      offerPercent: offerEnabled ? offerPercent : 0,
      imageUrl,
      isUnlimited,
      stockCount: stock,
      detailHtmlTop,
      detailHtmlBottom
    };

    try {
      const res = await fetch("/api/store", {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setShowItemModal(false);
        fetchData();
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    try {
      await fetch("/api/store", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !current })
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    try {
      await fetch(`/api/store?id=${id}`, { method: "DELETE" });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const liveCalculatedCost = Math.max(0, baseCoinPrice - Math.floor(baseCoinPrice * (offerEnabled ? offerPercent : 0) / 100));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Store & Redemptions</h1>
          <p className="text-gray-600">Manage reward inventory and student coin redemptions</p>
        </div>
        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
          <button onClick={() => setActiveTab("REDEMPTIONS")} className={`px-4 py-2 text-sm font-bold rounded-lg transition ${activeTab === 'REDEMPTIONS' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            Redemptions
          </button>
          <button onClick={() => setActiveTab("INVENTORY")} className={`px-4 py-2 text-sm font-bold rounded-lg transition ${activeTab === 'INVENTORY' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            Inventory
          </button>
        </div>
      </div>

      {activeTab === "REDEMPTIONS" && (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-left font-semibold text-gray-600">Date</th>
                <th className="p-4 text-left font-semibold text-gray-600">Student</th>
                <th className="p-4 text-left font-semibold text-gray-600">Item</th>
                <th className="p-4 text-center font-semibold text-gray-600">Contact</th>
                <th className="p-4 text-center font-semibold text-gray-600">Status</th>
                <th className="p-4 text-right font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">Loading...</td></tr>
              ) : redemptions.length > 0 ? (
                redemptions.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50 transition">
                    <td className="p-4 text-sm text-gray-500">{new Date(r.createdAt).toLocaleString()}</td>
                    <td className="p-4">
                      <div className="font-bold text-gray-900">{r.user.name}</div>
                      <div className="text-xs text-gray-500">{r.user.email}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-gray-900">{r.item.name}</div>
                      <div className="text-xs font-bold text-yellow-600">{r.coinsRedeemed} coins</div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="text-sm font-medium">{r.phoneNumber}</div>
                      {r.notes && (
                        <div className="text-xs text-gray-500 mt-1 italic max-w-[200px] text-left mx-auto bg-gray-50 p-2 rounded border">
                          "{r.notes}"
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center justify-center gap-1 w-max mx-auto
                        ${r.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                          r.status === 'VERIFIED' ? 'bg-blue-100 text-blue-800' : 
                          r.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                          'bg-red-100 text-red-800'}`}
                      >
                        {r.status === 'PENDING' && <Clock className="w-3 h-3"/>}
                        {r.status === 'REVIEWING' && <Clock className="w-3 h-3"/>}
                        {r.status === 'VERIFIED' && <CheckCircle className="w-3 h-3"/>}
                        {r.status === 'DELIVERED' && <CheckCircle className="w-3 h-3"/>}
                        {r.status === 'COMPLETED' && <CheckCircle className="w-3 h-3"/>}
                        {r.status === 'REJECTED' && <XCircle className="w-3 h-3"/>}
                        {r.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {r.status === 'PENDING' && (
                        <>
                          <button onClick={() => openReview(r)} className="text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition">Review</button>
                        </>
                      )}
                      {r.status === 'VERIFIED' && (
                        <button onClick={() => handleUpdateStatus(r.id, "DELIVERED")} className="text-xs font-bold bg-green-50 text-green-600 hover:bg-green-100 px-3 py-1.5 rounded-lg transition">Mark Delivered</button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">No redemptions found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "INVENTORY" && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => openItemModal()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition">
              <Plus className="w-4 h-4"/> Add Item
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-12 text-gray-500">Loading inventory...</div>
            ) : items.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-xl border">No items in store.</div>
            ) : (
              items.map(item => (
                <div key={item.id} className={`bg-white border rounded-xl overflow-hidden shadow-sm flex flex-col group relative ${!item.isActive ? 'opacity-50' : ''}`}>
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition z-10">
                    <button onClick={() => toggleActive(item.id, item.isActive)} className="bg-white/80 backdrop-blur p-1.5 rounded-lg text-gray-600 hover:text-blue-600 shadow-sm text-xs font-bold">{item.isActive ? 'Disable' : 'Enable'}</button>
                    <button onClick={() => openItemModal(item)} className="bg-white/80 backdrop-blur p-1.5 rounded-lg text-green-600 hover:text-green-700 shadow-sm"><Edit className="w-4 h-4"/></button>
                    <button onClick={() => deleteItem(item.id)} className="bg-white/80 backdrop-blur p-1.5 rounded-lg text-red-600 hover:text-red-700 shadow-sm"><Trash className="w-4 h-4"/></button>
                  </div>
                  <div className="h-32 bg-gray-100 flex items-center justify-center text-4xl border-b relative">
                    {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover"/> : "🎁"}
                    {!item.isActive && <div className="absolute inset-0 bg-black/10 flex items-center justify-center font-bold text-white uppercase text-sm">Inactive</div>}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-bold text-gray-900 truncate">{item.name}</h3>
                    <div className="flex justify-between items-center mt-auto pt-4">
                      <span className="font-black text-yellow-600 flex items-center gap-1 text-sm"><ShoppingBag className="w-3 h-3"/> {item.costInCoins}</span>
                      <span className="text-xs font-bold text-gray-500">{item.isUnlimited ? "Unlimited" : `${item.stockCount} in stock`}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewRedemption && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold">Review Redemption: {reviewRedemption.user.name}</h2>
              <button onClick={() => { setReviewRedemption(null); setReportData(null); }} className="text-gray-400 hover:bg-gray-100 p-1 rounded-full"><XCircle className="w-5 h-5"/></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-white">
              {reportLoading ? (
                <p className="text-center py-8 text-gray-500 font-bold">Generating full coin report...</p>
              ) : reportData ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="border rounded-xl p-4 bg-gray-50 text-center">
                      <p className="text-xs font-bold text-gray-500 uppercase">Requested</p>
                      <p className="text-2xl font-black text-gray-900">{reportData.coinsRequested}</p>
                    </div>
                    <div className="border rounded-xl p-4 bg-green-50 text-center">
                      <p className="text-xs font-bold text-green-700 uppercase">Current Balance</p>
                      <p className="text-2xl font-black text-green-700">{reportData.currentBalance}</p>
                    </div>
                    <div className="border rounded-xl p-4 bg-blue-50 text-center">
                      <p className="text-xs font-bold text-blue-700 uppercase">Total Earned</p>
                      <p className="text-2xl font-black text-blue-700">{reportData.totalEarned}</p>
                    </div>
                    <div className="border rounded-xl p-4 bg-yellow-50 text-center">
                      <p className="text-xs font-bold text-yellow-700 uppercase">Prev Redeemed</p>
                      <p className="text-2xl font-black text-yellow-700">{reportData.previouslyRedeemed}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-900 mb-3 text-lg">Transaction History</h3>
                    <div className="border rounded-xl overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="p-3 text-left font-semibold text-gray-600">Date</th>
                            <th className="p-3 text-left font-semibold text-gray-600">Source</th>
                            <th className="p-3 text-left font-semibold text-gray-600">Mentor & Comment</th>
                            <th className="p-3 text-right font-semibold text-gray-600">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {reportData.transactions.map((tx: any) => (
                            <tr key={tx.id} className="hover:bg-gray-50">
                              <td className="p-3 text-gray-500 text-xs whitespace-nowrap">{new Date(tx.awardedAt).toLocaleString()}</td>
                              <td className="p-3 font-medium text-gray-900">{tx.reason} {tx.rank ? `(Rank #${tx.rank})` : ''}</td>
                              <td className="p-3">
                                {tx.awardedBy ? (
                                  <div>
                                    <span className="font-bold text-gray-700">{tx.awardedBy.name}</span>
                                    {tx.mentorComment && (
                                      <div className="mt-1 text-xs text-gray-500 italic bg-gray-100 p-1.5 rounded inline-block">
                                        "{tx.mentorComment}"
                                      </div>
                                    )}
                                  </div>
                                ) : "System"}
                              </td>
                              <td className="p-3 text-right font-bold text-green-600">+{tx.amount}</td>
                            </tr>
                          ))}
                          {reportData.transactions.length === 0 && (
                            <tr><td colSpan={4} className="p-4 text-center text-gray-500">No transactions found.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center py-8 text-red-500">Failed to load report.</p>
              )}
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3 shrink-0">
              <button 
                onClick={() => handleUpdateStatus(reviewRedemption.id, "REJECTED")} 
                disabled={reportLoading}
                className="px-6 py-2.5 font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition disabled:opacity-50"
              >
                Reject Request
              </button>
              <button 
                onClick={() => handleUpdateStatus(reviewRedemption.id, "VERIFIED")} 
                disabled={reportLoading}
                className="px-6 py-2.5 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-sm disabled:opacity-50"
              >
                Approve (Verify)
              </button>
            </div>
          </div>
        </div>
      )}

      {showItemModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold">{editId ? "Edit Store Item" : "Add Store Item"}</h2>
              <button onClick={() => setShowItemModal(false)} className="text-gray-400 hover:bg-gray-100 p-1 rounded-full"><XCircle className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleSaveItem} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Item Name</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border px-3 py-2 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Image URL</label>
                <input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full border px-3 py-2 rounded-lg" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                <textarea required value={description} onChange={e => setDescription(e.target.value)} className="w-full border px-3 py-2 rounded-lg h-20" />
              </div>

              {/* Pricing Section */}
              <div className="bg-gray-50 p-4 rounded-xl border space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-gray-700 mb-1">Base Price (coins)</label>
                    <input required type="number" min="1" value={baseCoinPrice} onChange={e => setBaseCoinPrice(Number(e.target.value))} className="w-full border px-3 py-2 rounded-lg" />
                  </div>
                  <div className="flex items-center gap-2 pt-5">
                    <label className="text-sm font-bold text-gray-700">Enable Offer</label>
                    <input type="checkbox" checked={offerEnabled} onChange={e => setOfferEnabled(e.target.checked)} className="w-5 h-5" />
                  </div>
                  {offerEnabled && (
                    <div className="flex-1">
                      <label className="block text-sm font-bold text-gray-700 mb-1">Offer % (0-100)</label>
                      <input required type="number" min="0" max="100" value={offerPercent} onChange={e => setOfferPercent(Number(e.target.value))} className="w-full border px-3 py-2 rounded-lg" />
                    </div>
                  )}
                </div>

                <div className="p-3 bg-white border rounded-lg flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-500">Live Preview</span>
                  <div className="flex items-center gap-3">
                    {offerEnabled && offerPercent > 0 ? (
                      <>
                        <span className="text-sm font-bold text-red-400 line-through">{baseCoinPrice}</span>
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">{offerPercent}% OFF</span>
                      </>
                    ) : null}
                    <span className="text-lg font-black text-green-600">{liveCalculatedCost} Coins</span>
                  </div>
                </div>
              </div>

              {/* HTML Detail Blocks */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Detail Block — Top Right</label>
                  <p className="text-xs text-gray-500 mb-2">Shown right of image in card detail view. Accepts HTML.</p>
                  <textarea value={detailHtmlTop} onChange={e => setDetailHtmlTop(e.target.value)} maxLength={5000} className="w-full border px-3 py-2 rounded-lg h-32 font-mono text-sm" placeholder="<p>Extra info...</p>" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Detail Block — Bottom Left</label>
                  <p className="text-xs text-gray-500 mb-2">Shown below image in card detail view. Accepts HTML.</p>
                  <textarea value={detailHtmlBottom} onChange={e => setDetailHtmlBottom(e.target.value)} maxLength={5000} className="w-full border px-3 py-2 rounded-lg h-32 font-mono text-sm" placeholder="<p>More details...</p>" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Unlimited Stock?</label>
                  <select value={isUnlimited ? "yes" : "no"} onChange={e => setIsUnlimited(e.target.value === "yes")} className="w-full border px-3 py-2 rounded-lg bg-white">
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
                {!isUnlimited && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Stock Count</label>
                    <input required type="number" min="0" value={stock} onChange={e => setStock(Number(e.target.value))} className="w-full border px-3 py-2 rounded-lg" />
                  </div>
                )}
              </div>
              <div className="pt-4 flex justify-end gap-2 border-t mt-4">
                <button type="button" onClick={() => setShowItemModal(false)} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg">{editId ? "Save Changes" : "Create Item"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
