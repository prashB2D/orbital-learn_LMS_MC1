"use client";

import { useState, useEffect } from "react";
import { Coins, Gift, ShoppingBag, Phone, XCircle } from "lucide-react";
import { PhoneInput } from "@/components/PhoneInput";
import DOMPurify from "isomorphic-dompurify";

export default function StorePage() {
  const [items, setItems] = useState<any[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [selectedItem, setSelectedItem] = useState<any>(null); // For details modal
  const [redeemItem, setRedeemItem] = useState<any>(null);     // For actual redemption form
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
    if (!redeemItem || !phone) return;
    
    try {
      const res = await fetch("/api/student/coins/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: redeemItem.id, phoneNumber: phone, notes })
      });
      const data = await res.json();
      
      if (data.success) {
        alert("Redemption request submitted! You will be contacted soon.");
        setRedeemItem(null);
        setSelectedItem(null); // Close details modal too
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
          
          return (
            <div 
              key={item.id} 
              className={`bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col cursor-pointer ${outOfStock ? 'opacity-70' : ''}`}
              onClick={() => setSelectedItem(item)}
            >
              <div className="h-40 bg-gray-100 flex items-center justify-center text-4xl border-b relative">
                {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" /> : "🎁"}
                {outOfStock && <div className="absolute inset-0 bg-black/40 flex items-center justify-center font-bold text-white">OUT OF STOCK</div>}
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1">{item.name}</h3>
                <p className="text-sm text-gray-500 mb-4 flex-1 line-clamp-2">{item.description}</p>
                <div className="flex justify-between items-center mt-auto">
                  <div className="flex flex-col">
                    {item.offerPercent > 0 && (
                      <span className="text-xs text-red-400 line-through mb-0.5">{item.baseCoinPrice} Coins</span>
                    )}
                    <span className="font-black text-yellow-600 flex items-center gap-1 text-lg">
                      <Coins className="w-4 h-4" /> {item.costInCoins}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-gray-400">
                    {item.isUnlimited ? "∞ in stock" : `${item.stockCount} left`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Item Detail Modal */}
      {selectedItem && !redeemItem && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            <div className="p-4 border-b flex justify-end sticky top-0 bg-white z-10">
               <button onClick={() => setSelectedItem(null)} className="text-gray-400 hover:bg-gray-100 p-1 rounded-full"><XCircle className="w-6 h-6"/></button>
            </div>
            
            <div className="p-6 md:p-8 space-y-8 flex-1">
              {/* Top Section */}
              <div className="flex flex-col md:flex-row gap-8">
                {/* Image */}
                <div className="w-full md:w-1/2 rounded-xl overflow-hidden border bg-gray-50 flex items-center justify-center min-h-[300px]">
                  {selectedItem.imageUrl ? (
                     <img src={selectedItem.imageUrl} alt={selectedItem.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-8xl">🎁</span>
                  )}
                </div>

                {/* Info */}
                <div className="w-full md:w-1/2 flex flex-col">
                  <h2 className="text-3xl font-black text-gray-900 mb-4">{selectedItem.name}</h2>
                  
                  {/* Pricing Block */}
                  <div className="bg-gray-50 border p-4 rounded-xl mb-6">
                    {selectedItem.offerPercent > 0 && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-red-500 line-through">{selectedItem.baseCoinPrice} Coins</span>
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">{selectedItem.offerPercent}% OFF</span>
                      </div>
                    )}
                    <div className="text-3xl font-black text-yellow-600 flex items-center gap-2">
                      <Coins className="w-8 h-8" /> {selectedItem.costInCoins}
                    </div>
                  </div>

                  <p className="text-gray-600 text-lg mb-6 leading-relaxed">{selectedItem.description}</p>

                  {/* HTML Top Block */}
                  {selectedItem.detailHtmlTop && (
                    <div 
                      className="prose prose-sm max-w-none text-gray-700" 
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedItem.detailHtmlTop) }} 
                    />
                  )}
                </div>
              </div>

              {/* Bottom Section */}
              <div className="flex flex-col md:flex-row justify-between items-end gap-6 pt-6 border-t">
                <div className="w-full md:w-2/3">
                  {/* HTML Bottom Block */}
                  {selectedItem.detailHtmlBottom && (
                    <div 
                      className="prose prose-sm max-w-none text-gray-700" 
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedItem.detailHtmlBottom) }} 
                    />
                  )}
                </div>
                
                <div className="w-full md:w-auto shrink-0 flex flex-col items-end gap-2">
                   {!selectedItem.isUnlimited && selectedItem.stockCount <= 0 ? (
                      <button disabled className="w-full md:w-48 py-3 bg-gray-200 text-gray-500 font-bold rounded-xl cursor-not-allowed">
                        Out of Stock
                      </button>
                   ) : balance < selectedItem.costInCoins ? (
                      <button disabled className="w-full md:w-48 py-3 bg-gray-100 text-gray-400 font-bold rounded-xl border cursor-not-allowed">
                        Need {selectedItem.costInCoins - balance} more coins
                      </button>
                   ) : (
                      <button 
                        onClick={() => setRedeemItem(selectedItem)} 
                        className="w-full md:w-48 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl shadow-md transition transform hover:-translate-y-0.5"
                      >
                        Redeem Now
                      </button>
                   )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Actual Redemption Modal */}
      {redeemItem && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b bg-gray-50">
              <h2 className="text-xl font-bold flex items-center gap-2"><Gift className="text-yellow-500"/> Redeem Reward</h2>
            </div>
            <form onSubmit={handleRedeem} className="p-6 space-y-4">
              <div className="flex justify-between items-center bg-yellow-50 p-4 rounded-xl border border-yellow-200 mb-6">
                <div>
                  <h4 className="font-bold text-gray-900">{redeemItem.name}</h4>
                  <p className="text-xs text-gray-500">Balance after: {balance - redeemItem.costInCoins}</p>
                </div>
                <span className="font-black text-yellow-600 flex items-center gap-1"><Coins className="w-4 h-4"/> {redeemItem.costInCoins}</span>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-1"><Phone className="w-4 h-4 text-gray-400"/> Phone Number</label>
                <PhoneInput value={phone} onChange={setPhone} className="w-full" />
                <p className="text-xs text-gray-500 mt-1">Admin will call this number to verify your identity and arrange delivery.</p>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Additional Notes (Optional)</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full border px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-yellow-500 h-20" placeholder="e.g. Size M for t-shirts, preferred delivery time, etc." />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t">
                <button type="button" onClick={() => setRedeemItem(null)} className="px-4 py-2 font-bold text-gray-600 hover:bg-gray-100 rounded-lg">Back to Details</button>
                <button type="submit" className="px-4 py-2 font-bold text-white bg-yellow-500 hover:bg-yellow-600 rounded-lg shadow-sm">Confirm Redemption</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
