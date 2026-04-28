"use client";

import { useState } from "react";
import { User as UserIcon, Phone, MapPin, Calendar, BookOpen, Clock, Flame, Coins, Camera } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";

export default function ProfileClient({ user, stats }: { user: any, stats: any }) {
  const [profile, setProfile] = useState(user);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (field: string, overrideValue?: string) => {
    setLoading(true);
    const valueToUpdate = overrideValue !== undefined ? overrideValue : editValue;
    try {
      const res = await fetch("/api/student/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: valueToUpdate })
      });
      const data = await res.json();
      if (data.success) {
        setProfile({ ...profile, [field]: data.user[field] });
        setEditingField(null);
      } else {
        alert(data.error);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (field: string, currentVal: string) => {
    setEditingField(field);
    setEditValue(currentVal || "");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border shadow-sm p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
        
        <div className="relative mt-12 flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className="relative w-32 h-32 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center overflow-hidden shrink-0">
            {profile.profilePicture ? (
              <img src={profile.profilePicture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-16 h-16 text-gray-300" />
            )}
            <CldUploadWidget
              uploadPreset="orbital-learn_LMS_MC1"
              onSuccess={(result: any) => {
                if (result?.info?.secure_url) {
                  handleUpdate("profilePicture", result.info.secure_url);
                }
              }}
            >
              {({ open }) => (
                <button 
                  onClick={(e) => { e.preventDefault(); open(); }}
                  className="absolute bottom-0 w-full bg-black/50 text-white py-1 flex justify-center hover:bg-black/70 transition"
                  disabled={loading}
                >
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </CldUploadWidget>
          </div>
          
          <div className="flex-1">
            <h1 className="text-3xl font-black text-gray-900">{profile.name}</h1>
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-gray-500 font-medium">
              <span>{profile.email}</span>
              <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded text-gray-700 font-mono text-sm">
                ID: {profile.studentId}
              </span>
              <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3">
            <BookOpen className="w-6 h-6" />
          </div>
          <p className="text-2xl font-black text-gray-900">{stats.coursesEnrolled}</p>
          <p className="text-sm font-bold text-gray-500 uppercase">Courses</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-3">
            <Clock className="w-6 h-6" />
          </div>
          <p className="text-2xl font-black text-gray-900">{stats.watchTimeMinutes}m</p>
          <p className="text-sm font-bold text-gray-500 uppercase">Watch Time</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-3">
            <Flame className="w-6 h-6" />
          </div>
          <p className="text-2xl font-black text-gray-900">{stats.currentStreak}</p>
          <p className="text-sm font-bold text-gray-500 uppercase">Day Streak</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-3">
            <Coins className="w-6 h-6" />
          </div>
          <p className="text-2xl font-black text-gray-900">{stats.coinBalance}</p>
          <p className="text-sm font-bold text-gray-500 uppercase">Coins</p>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
        <div className="p-6 border-b bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
        </div>
        <div className="p-6 space-y-6">
          {/* Bio */}
          <div>
            <label className="text-sm font-bold text-gray-500 uppercase flex justify-between items-center mb-2">
              About Me
              {profile.bio && <button onClick={() => startEdit("bio", profile.bio)} className="text-blue-600 hover:underline text-xs capitalize">Edit</button>}
            </label>
            {editingField === "bio" ? (
              <div className="flex gap-2 items-start">
                <textarea value={editValue} onChange={e => setEditValue(e.target.value)} className="flex-1 border px-3 py-2 rounded-lg h-24" />
                <div className="flex flex-col gap-2">
                  <button onClick={() => handleUpdate("bio")} disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm">Save</button>
                  <button onClick={() => setEditingField(null)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-bold text-sm">Cancel</button>
                </div>
              </div>
            ) : profile.bio ? (
              <p className="text-gray-800">{profile.bio}</p>
            ) : (
              <button onClick={() => startEdit("bio", "")} className="border-2 border-dashed border-gray-300 rounded-xl w-full py-4 text-gray-500 font-bold hover:bg-gray-50 hover:text-blue-600 transition flex items-center justify-center gap-2">
                + Add Bio
              </button>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Phone */}
            <div>
              <label className="text-sm font-bold text-gray-500 uppercase flex justify-between items-center mb-2">
                <span className="flex items-center gap-1"><Phone className="w-4 h-4"/> Phone Number</span>
                {profile.phoneNumber && <button onClick={() => startEdit("phoneNumber", profile.phoneNumber)} className="text-blue-600 hover:underline text-xs capitalize">Edit</button>}
              </label>
              {editingField === "phoneNumber" ? (
                <div className="flex gap-2">
                  <input type="tel" value={editValue} onChange={e => setEditValue(e.target.value)} className="flex-1 border px-3 py-2 rounded-lg" />
                  <button onClick={() => handleUpdate("phoneNumber")} disabled={loading} className="bg-blue-600 text-white px-3 py-2 rounded-lg font-bold text-sm">Save</button>
                </div>
              ) : profile.phoneNumber ? (
                <p className="text-gray-900 font-medium bg-gray-50 p-3 rounded-xl border">{profile.phoneNumber}</p>
              ) : (
                <button onClick={() => startEdit("phoneNumber", "")} className="border-2 border-dashed border-gray-300 rounded-xl w-full p-3 text-gray-500 font-bold hover:bg-gray-50 hover:text-blue-600 transition flex items-center justify-center gap-2">
                  + Add Phone Number
                </button>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="text-sm font-bold text-gray-500 uppercase flex justify-between items-center mb-2">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4"/> Location</span>
                {profile.location && <button onClick={() => startEdit("location", profile.location)} className="text-blue-600 hover:underline text-xs capitalize">Edit</button>}
              </label>
              {editingField === "location" ? (
                <div className="flex gap-2">
                  <input type="text" value={editValue} onChange={e => setEditValue(e.target.value)} className="flex-1 border px-3 py-2 rounded-lg" placeholder="City, Country" />
                  <button onClick={() => handleUpdate("location")} disabled={loading} className="bg-blue-600 text-white px-3 py-2 rounded-lg font-bold text-sm">Save</button>
                </div>
              ) : profile.location ? (
                <p className="text-gray-900 font-medium bg-gray-50 p-3 rounded-xl border">{profile.location}</p>
              ) : (
                <button onClick={() => startEdit("location", "")} className="border-2 border-dashed border-gray-300 rounded-xl w-full p-3 text-gray-500 font-bold hover:bg-gray-50 hover:text-blue-600 transition flex items-center justify-center gap-2">
                  + Add Location
                </button>
              )}
            </div>

            {/* DOB */}
            <div>
              <label className="text-sm font-bold text-gray-500 uppercase flex justify-between items-center mb-2">
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4"/> Date of Birth</span>
                {profile.dateOfBirth && <button onClick={() => startEdit("dateOfBirth", profile.dateOfBirth.split('T')[0])} className="text-blue-600 hover:underline text-xs capitalize">Edit</button>}
              </label>
              {editingField === "dateOfBirth" ? (
                <div className="flex gap-2">
                  <input type="date" value={editValue} onChange={e => setEditValue(e.target.value)} className="flex-1 border px-3 py-2 rounded-lg" />
                  <button onClick={() => handleUpdate("dateOfBirth")} disabled={loading} className="bg-blue-600 text-white px-3 py-2 rounded-lg font-bold text-sm">Save</button>
                </div>
              ) : profile.dateOfBirth ? (
                <p className="text-gray-900 font-medium bg-gray-50 p-3 rounded-xl border">{new Date(profile.dateOfBirth).toLocaleDateString()}</p>
              ) : (
                <button onClick={() => startEdit("dateOfBirth", "")} className="border-2 border-dashed border-gray-300 rounded-xl w-full p-3 text-gray-500 font-bold hover:bg-gray-50 hover:text-blue-600 transition flex items-center justify-center gap-2">
                  + Add Date of Birth
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
