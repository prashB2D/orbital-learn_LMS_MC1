"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

interface LessonFormValues {
  title: string;
  youtubeUrl: string;
  duration: number;
  attachments: string;
  order: number;
  moduleId: string | null;
  skill: string;
  xpReward: number;
}

export default function EditLessonPage({ params }: { params: { id: string; contentId: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [initialFetchDone, setInitialFetchDone] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<LessonFormValues>();

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch(`/api/content/${params.contentId}`);
        const data = await res.json();
        if (data.success) {
          const c = data.content;
          reset({
            title: c.title,
            youtubeUrl: c.videoId ? `https://youtube.com/watch?v=${c.videoId}` : "",
            duration: c.duration ? c.duration / 60 : 0,
            attachments: c.attachments ? c.attachments.join("\\n") : "",
            order: c.order,
            moduleId: c.moduleId || null,
            skill: c.skill || "",
            xpReward: c.xpReward || 0,
          });
        }
      } catch (err) {
        setError("Failed to fetch class info");
      } finally {
        setInitialFetchDone(true);
      }
    };
    fetchContent();
  }, [params.contentId, reset]);

  const onSubmit = async (data: LessonFormValues) => {
    setLoading(true);
    setError("");

    try {
      const videoId = data.youtubeUrl.split('v=')[1]?.split('&')[0] || data.youtubeUrl.split('/').pop();
      const parsedAttachments = data.attachments.split('\\n').map(link => link.trim()).filter(Boolean);

      const payload = {
        title: data.title,
        videoId,
        duration: Math.round(Number(data.duration) * 60),
        attachments: parsedAttachments,
        order: Number(data.order),
        moduleId: data.moduleId,
        skill: data.skill || undefined,
        xpReward: Number(data.xpReward),
      };

      const response = await fetch(`/api/content/${params.contentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to update class");

      router.push(`/admin/courses/${params.id}/content`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!initialFetchDone) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Edit Class</h1>

      {error && <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-lg">{error}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg border space-y-6">
        <div>
          <label className="block font-semibold mb-2">Lesson Title</label>
          <input {...register("title", { required: "Title is required" })} type="text" className="w-full px-4 py-2 border rounded-lg" required />
        </div>

        <div>
           <label className="block font-semibold mb-2">YouTube URL</label>
           <input {...register("youtubeUrl", { required: "YouTube URL is required" })} type="text" className="w-full px-4 py-2 border rounded-lg" required />
        </div>

        <div>
           <label className="block font-semibold mb-2">Duration (minutes)</label>
           <input {...register("duration", { required: "Duration is required", min: 1 })} type="number" step="0.5" className="w-full px-4 py-2 border rounded-lg" required />
        </div>

        <div>
           <label className="block font-semibold mb-2">Notes Link (Drive URL) (Optional)</label>
           <textarea {...register("attachments")} className="w-full px-4 py-2 border rounded-lg h-24 font-mono text-xs" />
        </div>

        <div>
           <label className="block font-semibold mb-2">Order</label>
           <input {...register("order", { required: "Order is required", min: 1 })} type="number" className="w-full px-4 py-2 border rounded-lg" required />
        </div>

        <div>
           <label className="block font-semibold mb-2">Related Skill (Optional)</label>
           <input {...register("skill")} type="text" className="w-full px-4 py-2 border rounded-lg" placeholder="e.g. React" />
        </div>

        <div>
           <label className="block font-semibold mb-2">XP Reward</label>
           <input {...register("xpReward", { required: "XP Reward is required", min: 0 })} type="number" className="w-full px-4 py-2 border rounded-lg" required />
        </div>

        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
          {loading ? "Updating..." : "Update Class"}
        </button>
      </form>
    </div>
  );
}
