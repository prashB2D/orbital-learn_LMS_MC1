/**
 * Create Course Page (Admin)
 * Form to create new course
 */

"use client";

import { useState } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { ImagePlus, X } from "lucide-react";

export default function CreateCoursePage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [offerEnabled, setOfferEnabled] = useState(false);
  const [offerPercent, setOfferPercent] = useState("");
  const [loading, setLoading] = useState(false);
  const [thumbnail, setThumbnail] = useState("");
  const [aboutCourse, setAboutCourse] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!thumbnail) {
      setError("Please upload a thumbnail image first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title, 
          description, 
          basePrice: parseFloat(basePrice) || 0,
          offerPercent: offerEnabled && offerPercent ? parseInt(offerPercent) : null,
          thumbnail,
          aboutCourse
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

        {/* About Course */}
        <div>
          <label className="block font-semibold mb-2">About Course (HTML Supported)</label>
          <textarea
            value={aboutCourse}
            onChange={(e) => setAboutCourse(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg h-48 font-mono text-sm"
            placeholder={`<h3>Course Essentials</h3>\n<ul>\n  <li><b>Start Date:</b> 11th May</li>\n  <li><mark>Live Class:</mark> 9 PM</li>\n</ul>\n<img src="IMAGE_URL" />\n\n<h3>FAQ Section</h3>`}
          />
          <p className="text-xs text-gray-500 mt-1">
            You can write simple HTML here. This will be displayed on the course detail page just below the main section.
          </p>
        </div>

        {/* Price & Offer */}
        <div className="space-y-4 border p-4 rounded-lg bg-gray-50">
          <div>
            <label className="block font-semibold mb-2">Base price (₹)</label>
            <input
              type="number"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="0"
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="offerEnabled"
              checked={offerEnabled}
              onChange={(e) => setOfferEnabled(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="offerEnabled" className="font-semibold cursor-pointer">Enable offer</label>
          </div>

          {offerEnabled && (
            <div>
              <label className="block font-semibold mb-2">Offer %</label>
              <input
                type="number"
                min="0"
                max="100"
                value={offerPercent}
                onChange={(e) => setOfferPercent(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="10"
              />
            </div>
          )}

          {/* Live Preview */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-2">Student sees:</p>
            <div className="flex flex-col gap-1">
              {offerEnabled && parseInt(offerPercent) > 0 ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-red-500 line-through">
                      ₹{parseFloat(basePrice || "0").toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      {offerPercent}% off
                    </span>
                  </div>
                  <p className="text-xl font-bold text-green-600">
                    ₹{(parseFloat(basePrice || "0") * (1 - parseInt(offerPercent) / 100)).toLocaleString("en-IN")}
                  </p>
                </>
              ) : (
                <p className="text-xl font-bold text-gray-900">
                  ₹{parseFloat(basePrice || "0").toLocaleString("en-IN")}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Thumbnail via Cloudinary */}
        <div>
          <label className="block font-semibold mb-2">Thumbnail Image</label>
          {thumbnail ? (
            <div className="relative w-64 h-36 rounded-lg overflow-hidden border mb-3">
              {/* Using standard img to avoid Next.js domain config strictly in admin */}
              <img src={thumbnail} alt="Thumbnail" className="object-cover w-full h-full" />
              <button 
                type="button" 
                onClick={() => setThumbnail("")}
                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <CldUploadWidget 
              uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "lms_preset"} 
              onSuccess={(result: any) => {
                setThumbnail(result?.info?.secure_url);
              }}
            >
              {({ open }) => (
                <button
                  type="button"
                  onClick={() => open()}
                  className="w-full flex justify-center items-center gap-2 px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-gray-600 font-medium"
                >
                  <ImagePlus className="w-5 h-5" /> Click to Upload Thumbnail
                </button>
              )}
            </CldUploadWidget>
          )}
          <input type="hidden" value={thumbnail} required />
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
