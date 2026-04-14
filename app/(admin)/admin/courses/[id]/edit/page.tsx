"use client";

import { useState, useEffect } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { ImagePlus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { ConfirmDeleteModal } from "@/components/admin/ConfirmDeleteModal";

export default function EditCoursePage({ params }: { params: { id: string } }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [thumbnail, setThumbnail] = useState("");
  const [aboutCourse, setAboutCourse] = useState("");
  const [error, setError] = useState("");
  const [initialFetchDone, setInitialFetchDone] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await fetch(`/api/courses/${params.id}`);
        const data = await res.json();
        if (data.success) {
          setTitle(data.course.title);
          setDescription(data.course.description);
          setPrice(data.course.price.toString());
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
          price: parseFloat(price), 
          thumbnail,
          aboutCourse
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to update course");
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

        <div>
          <label className="block font-semibold mb-2">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-2 border rounded-lg h-24" required />
        </div>

        <div>
          <label className="block font-semibold mb-2">About Course (HTML Supported)</label>
          <textarea value={aboutCourse} onChange={(e) => setAboutCourse(e.target.value)} className="w-full px-4 py-2 border rounded-lg h-48 font-mono text-sm" />
        </div>

        <div>
           <label className="block font-semibold mb-2">Price (₹)</label>
           <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
        </div>

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
