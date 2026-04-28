"use client";

import { useState, useEffect } from "react";
import { Coins, Gift, ShoppingBag, Phone } from "lucide-react";

export default function StorePage() {
  const [items, setItems] = useState<any[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const fetchData = async () => {
    try {
      const [itemsRes, balRes] = await Promise.all([
        fetch("/api/store"),
        fetch("/api/student/coins/balance")
      ]);
      const itemsData = await itemsRes.json();
      const balData = await balRes.json();
      
      if (itemsData.success) setItems(itemsData.items);
      if (balData.success) setBalance(balData.coinBalance || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !phone) return;
    
    try {
      const res = await fetch("/api/student/coins/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: selectedItem.id, phoneNumber: phone, notes })
      });
      const data = await res.json();
      
      if (data.success) {
        alert("Redemption request submitted! You will be contacted soon.");
        setSelectedItem(null);
        setPhone("");
        setNotes("");
        fetchData(); // Refresh balance and stock
      } else {
        alert(data.error || "Failed to redeem item");
      }
    } catch (e) {
      console.error(e);
      alert("Error processing redemption");
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-500">Loading store...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-8 text-white shadow-lg">
        <div>
          <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
            <ShoppingBag className="w-8 h-8" /> Rewards Store
          </h1>
          <p className="opacity-90 font-medium">Redeem your hard-earned coins for real-world rewards and exclusive perks!</p>
        </div>
        <div className="bg-white/20 backdrop-blur-md px-6 py-4 rounded-xl text-center border border-white/30">
          <p className="text-sm uppercase tracking-wider font-bold opacity-80 mb-1">Your Balance</p>
          <p className="text-4xl font-black flex items-center justify-center gap-2">
            <Coins className="w-8 h-8 text-yellow-200" /> {balance.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map(item => {
          const outOfStock = !item.isUnlimited && item.stockCount <= 0;
          const affordable = balance >= item.costInCoins;
          
          return (
            <div key={item.id} className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col">
              <div className="h-40 bg-gray-100 flex items-center justify-center text-4xl border-b">
                {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" /> : "🎁"}
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-lg text-gray-900 mb-1">{item.name}</h3>
                <p className="text-sm text-gray-500 mb-4 flex-1">{item.description}</p>
                <div className="flex justify-between items-center mb-4">
                  <span className="font-black text-yellow-600 flex items-center gap-1">
                    <Coins className="w-4 h-4" /> {item.costInCoins}
                  </span>
                  <span className="text-xs font-bold text-gray-400">
                    {item.isUnlimited ? "∞ in stock" : `${item.stockCount} left`}
                  </span>
                </div>
                <button 
                  disabled={outOfStock || !affordable}
                  onClick={() => setSelectedItem(item)}
                  className={`w-full py-2 rounded-lg font-bold transition flex items-center justify-center gap-2
                    ${outOfStock ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 
                      !affordable ? 'bg-gray-100 text-gray-400 cursor-not-allowed border' : 
                      'bg-yellow-500 hover:bg-yellow-600 text-white shadow-sm'}`}
                >
                  {outOfStock ? "Out of Stock" : !affordable ? "Need more coins" : "Redeem"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b bg-gray-50">
              <h2 className="text-xl font-bold flex items-center gap-2"><Gift className="text-yellow-500"/> Redeem Reward</h2>
            </div>
            <form onSubmit={handleRedeem} className="p-6 space-y-4">
              <div className="flex justify-between items-center bg-yellow-50 p-4 rounded-xl border border-yellow-200 mb-6">
                <div>
                  <h4 className="font-bold text-gray-900">{selectedItem.name}</h4>
                  <p className="text-xs text-gray-500">Balance after: {balance - selectedItem.costInCoins}</p>
                </div>
                <span className="font-black text-yellow-600 flex items-center gap-1"><Coins className="w-4 h-4"/> {selectedItem.costInCoins}</span>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-1"><Phone className="w-4 h-4 text-gray-400"/> Phone Number</label>
                <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full border px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-yellow-500" placeholder="+1 234 567 8900" />
                <p className="text-xs text-gray-500 mt-1">Admin will call this number to verify your identity and arrange delivery.</p>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Additional Notes (Optional)</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full border px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-yellow-500 h-20" placeholder="e.g. Size M for t-shirts, preferred delivery time, etc." />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t">
                <button type="button" onClick={() => setSelectedItem(null)} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 font-bold text-white bg-yellow-500 hover:bg-yellow-600 rounded-lg shadow-sm">Confirm Redemption</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
