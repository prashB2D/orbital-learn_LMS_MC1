"use client";

import { useState, useEffect } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { ImagePlus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { ConfirmDeleteModal } from "@/components/admin/ConfirmDeleteModal";

export default function EditCoursePage({ params }: { params: { id: string } }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [offerEnabled, setOfferEnabled] = useState(false);
  const [offerPercent, setOfferPercent] = useState("");
  const [loading, setLoading] = useState(false);
  const [thumbnail, setThumbnail] = useState("");
  const [aboutCourse, setAboutCourse] = useState("");
  const [error, setError] = useState("");
  const [initialFetchDone, setInitialFetchDone] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [role, setRole] = useState("STUDENT");
  const router = useRouter();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const [res, sessionRes] = await Promise.all([
          fetch(`/api/courses/${params.id}`),
          fetch("/api/auth/session")
        ]);
        const sessionData = await sessionRes.json();
        if (sessionData?.user?.role) {
          setRole(sessionData.user.role);
        }

        const data = await res.json();
        if (data.success) {
          setTitle(data.course.title);
          setDescription(data.course.description);
          setCourseCode(data.course.courseCode);
          setBasePrice(data.course.basePrice.toString());
          if (data.course.offerPercent) {
            setOfferEnabled(true);
            setOfferPercent(data.course.offerPercent.toString());
          }
          setThumbnail(data.course.thumbnail);
          setAboutCourse(data.course.aboutCourse || "");
        }
      } catch (err) {
        setError("Failed to fetch course data");
      } finally {
        setInitialFetchDone(true);
      }
    };
    fetchCourse();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/courses/${params.id}`, {
        method: "PATCH",
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
        throw new Error(data.error || "Failed to update course");
      }

      if (courseCode) {
        const codeRes = await fetch(`/api/admin/courses/${params.id}/code`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseCode })
        });
        const codeData = await codeRes.json();
        if (!codeRes.ok) throw new Error(codeData.error || "Failed to update course code");
      }

      router.push(`/admin/courses`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to update course");
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsModalOpen(false);
    setLoading(true);
    try {
      const res = await fetch(`/api/courses/${params.id}`, { method: "DELETE" });
      if (res.ok) {
        window.location.href = "/admin/courses";
      } else {
        alert("Failed to delete course");
        setLoading(false);
      }
    } catch (e) {
      alert("Error deleting course");
      setLoading(false);
    }
  };

  if (!initialFetchDone) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Edit Course</h1>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm font-medium border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border space-y-6">
        <div>
          <label className="block font-semibold mb-2">Course Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
        </div>

        {role !== "MENTOR" && (
          <div>
            <label className="block font-semibold mb-2">Course ID (Code)</label>
            <input type="text" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} className="w-full px-4 py-2 border rounded-lg font-mono uppercase" required />
            <p className="text-xs text-gray-500 mt-1">Used for coupon creation and mentor assignments.</p>
          </div>
        )}

        <div>
          <label className="block font-semibold mb-2">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-2 border rounded-lg h-24" required />
        </div>

        <div>
          <label className="block font-semibold mb-2">About Course (HTML Supported)</label>
          <textarea value={aboutCourse} onChange={(e) => setAboutCourse(e.target.value)} className="w-full px-4 py-2 border rounded-lg h-48 font-mono text-sm" />
        </div>

        {/* Price & Offer */}
        {role !== "MENTOR" && (
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
        )}

        <div>
          <label className="block font-semibold mb-2">Thumbnail Image</label>
          {thumbnail ? (
            <div className="relative w-64 h-36 rounded-lg overflow-hidden border mb-3">
              <img src={thumbnail} alt="Thumbnail" className="object-cover w-full h-full" />
              <button type="button" onClick={() => setThumbnail("")} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow hover:bg-red-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <CldUploadWidget uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "lms_preset"} onSuccess={(result: any) => setThumbnail(result?.info?.secure_url)}>
              {({ open }) => (
                <button type="button" onClick={() => open()} className="w-full flex justify-center items-center gap-2 px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-gray-600 font-medium">
                  <ImagePlus className="w-5 h-5" /> Click to Upload Thumbnail
                </button>
              )}
            </CldUploadWidget>
          )}
        </div>

        <div className="flex gap-4 pt-4 border-t">
          <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 transition shadow-sm">
            {loading ? "Updating..." : "Update Course"}
          </button>
          <button type="button" onClick={() => setIsModalOpen(true)} disabled={loading} className="flex-1 bg-red-50 text-red-600 border border-red-200 py-3 rounded-lg font-bold hover:bg-red-100 disabled:opacity-50 transition shadow-sm">
            Delete Course
          </button>
        </div>
      </form>

      <ConfirmDeleteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleDelete}
        itemName="Course"
      />
    </div>
  );
}
