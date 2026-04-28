/**
 * Add Lesson Page (Admin)
 * Form to add video lesson to course
 */

"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";

interface LessonFormValues {
  title: string;
  youtubeUrl: string;
  duration: number;
  attachments: string;
  order: number;
  skill: string;
  xpReward: number;
}

export default function AddLessonPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const moduleId = searchParams.get("moduleId") || undefined;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, formState: { errors } } = useForm<LessonFormValues>({
    defaultValues: {
      title: "",
      youtubeUrl: "",
      duration: 0,
      attachments: "",
      order: 1,
      skill: "",
      xpReward: 10,
    }
  });

  const onSubmit = async (data: LessonFormValues) => {
    setLoading(true);
    setError("");

    try {
      // Extract videoId from YouTube URL
      const videoId = data.youtubeUrl.split('v=')[1]?.split('&')[0] || data.youtubeUrl.split('/').pop();
      
      // Parse attachments (split by newline and remove empty)
      const parsedAttachments = data.attachments
        .split('\n')
        .map(link => link.trim())
        .filter(Boolean);

      const payload = {
        courseId: params.id,
        moduleId,
        title: data.title,
        videoId,
        duration: Math.round(Number(data.duration) * 60), // Convert minutes to absolute integer seconds
        attachments: parsedAttachments,
        order: Number(data.order),
        skill: data.skill || undefined,
        xpReward: Number(data.xpReward),
      };

      const response = await fetch("/api/content/lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to add lesson");
      }

      router.push(`/admin/courses/${params.id}/content`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Add Lesson</h1>

      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-lg border space-y-6">
        {/* Title */}
        <div>
          <label className="block font-semibold mb-2">Lesson Title</label>
          <input
            {...register("title", { required: "Title is required" })}
            type="text"
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Introduction to React"
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
        </div>

        {/* YouTube Video URL */}
        <div>
          <label className="block font-semibold mb-2">YouTube URL</label>
          <input
            {...register("youtubeUrl", { required: "YouTube URL is required" })}
            type="text"
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter the full YouTube URL. The video ID will be extracted automatically.
          </p>
          {errors.youtubeUrl && <p className="text-red-500 text-sm mt-1">{errors.youtubeUrl.message}</p>}
        </div>

        {/* Duration */}
        <div>
          <label className="block font-semibold mb-2">Duration (minutes)</label>
          <input
            {...register("duration", { required: "Duration is required", min: 1 })}
            type="number"
            step="0.5"
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="60"
          />
          <p className="text-xs text-gray-500 mt-1">
            Example: Enter 60 for 1 hour, or 45.5 for 45 and a half minutes
          </p>
          {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration.message}</p>}
        </div>

        {/* Attachments */}
        <div>
          <label className="block font-semibold mb-2">
            Notes Link (Drive URL) (Optional)
          </label>
          <textarea
            {...register("attachments")}
            className="w-full px-4 py-2 border rounded-lg h-24 font-mono text-xs"
            placeholder="https://drive.google.com/file/d/1abc/view&#10;https://drive.google.com/file/d/2xyz/view"
          />
        </div>

        {/* Order */}
        <div>
          <label className="block font-semibold mb-2">Order</label>
          <input
            {...register("order", { required: "Order is required", min: 1 })}
            type="number"
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="1"
          />
          {errors.order && <p className="text-red-500 text-sm mt-1">{errors.order.message}</p>}
        </div>

        {/* Skill */}
        <div>
          <label className="block font-semibold mb-2">Related Skill (Optional)</label>
          <input
            {...register("skill")}
            type="text"
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="e.g. React, UI Design, Communication"
          />
        </div>

        {/* XP Reward */}
        <div>
          <label className="block font-semibold mb-2">XP Reward</label>
          <input
            {...register("xpReward", { required: "XP Reward is required", min: 0 })}
            type="number"
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="10"
          />
          <p className="text-xs text-gray-500 mt-1">
            Points awarded to student for completing this lesson.
          </p>
          {errors.xpReward && <p className="text-red-500 text-sm mt-1">{errors.xpReward.message}</p>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add Lesson"}
        </button>
      </form>
    </div>
  );
}
