/**
 * Create Course Page (Admin)
 * Form to create new course
 */

"use client";

import { useState } from "react";

export default function CreateCoursePage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [thumbnail, setThumbnail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title, 
          description, 
          price: parseFloat(price), 
          thumbnail 
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to create course");
      }

      window.location.href = `/admin/courses/${data.slug}/content`;
    } catch (err: any) {
      setError(err.message || "Failed to create course");
      setLoading(false);
    }
  };
  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Create Course</h1>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm font-medium border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border space-y-6">
        {/* Title */}
        <div>
          <label className="block font-semibold mb-2">Course Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="React Masterclass"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block font-semibold mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg h-24"
            placeholder="Course description"
            required
          />
        </div>

        {/* Price */}
        <div>
          <label className="block font-semibold mb-2">Price (₹)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="0"
            required
          />
          <p className="text-xs text-blue-600 font-semibold mt-1">
            Tip: Setting the price to 0 will gracefully make this course completely free and bypass checkout!
          </p>
        </div>

        {/* Thumbnail String Config */}
        <div>
          <label className="block font-semibold mb-2">Thumbnail URL</label>
          <input
            type="url"
            value={thumbnail}
            onChange={(e) => setThumbnail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="https://example.com/image.jpg"
            required
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Course"}
        </button>
      </form>
    </div>
  );
}
