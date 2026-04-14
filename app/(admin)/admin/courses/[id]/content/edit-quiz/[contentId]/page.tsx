"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";

interface QuestionFormValue {
  questionText: string;
  optionType: "2_options" | "4_options";
  options: string[];
  correctAnswer: string;
  order: number;
}

interface QuizFormValues {
  title: string;
  order: number;
  moduleId: string | null;
  questions: QuestionFormValue[];
}

export default function EditQuizPage({ params }: { params: { id: string; contentId: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [initialFetchDone, setInitialFetchDone] = useState(false);

  const { register, control, handleSubmit, watch, reset, formState: { errors } } = useForm<QuizFormValues>();
  const watchedQuestions = watch("questions");

  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions",
  });

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch(`/api/content/${params.contentId}`);
        const data = await res.json();
        if (data.success) {
          const c = data.content;
          reset({
            title: c.title,
            order: c.order,
            moduleId: c.moduleId || null,
            questions: c.questions && c.questions.length > 0 ? c.questions.map((q: any) => ({
              questionText: q.questionText,
              optionType: q.optionType,
              options: q.optionType === "2_options" ? [...q.options, "", ""] : q.options,
              correctAnswer: q.correctAnswer.toString(),
              order: q.order,
            })) : [
              { questionText: "", optionType: "4_options", options: ["", "", "", ""], correctAnswer: "0", order: 1 }
            ],
          });
        }
      } catch (err) {
        setError("Failed to fetch quiz info");
      } finally {
        setInitialFetchDone(true);
      }
    };
    fetchContent();
  }, [params.contentId, reset]);

  const handleAddQuestion = () => {
    append({
      questionText: "",
      optionType: "4_options",
      options: ["", "", "", ""],
      correctAnswer: "0",
      order: fields.length + 1,
    });
  };

  const onSubmit = async (data: QuizFormValues) => {
    setLoading(true);
    setError("");

    try {
      const payload = {
        title: data.title,
        order: Number(data.order),
        moduleId: data.moduleId,
        questions: data.questions.map((q, i) => ({
          questionText: q.questionText,
          optionType: q.optionType,
          options: q.optionType === "2_options" ? q.options.slice(0, 2) : q.options,
          correctAnswer: Number(q.correctAnswer),
          order: i + 1,
        })),
      };

      const response = await fetch(`/api/content/${params.contentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to update quiz");

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
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Edit Quiz</h1>

      {error && <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-lg">{error}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white p-6 rounded-lg border space-y-4 shadow-sm">
          <div>
            <label className="block font-semibold mb-2">Quiz Title</label>
            <input {...register("title", { required: "Title is required" })} type="text" className="w-full px-4 py-2 border rounded-lg" required />
          </div>
          <div>
            <label className="block font-semibold mb-2">Order</label>
            <input {...register("order", { required: "Order is required", min: 1 })} type="number" className="w-full px-4 py-2 border rounded-lg" required />
          </div>
        </div>

        {fields.map((field, qIndex) => (
          <div key={field.id} className="bg-white p-6 rounded-lg border space-y-4 shadow-sm relative">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">Question {qIndex + 1}</h3>
              {fields.length > 1 && (
                <button type="button" onClick={() => remove(qIndex)} className="text-red-500 text-sm hover:underline">Remove</button>
              )}
            </div>

            <div>
              <label className="block font-semibold mb-2">Question Text</label>
              <textarea {...register(`questions.${qIndex}.questionText` as const, { required: "Question text is required" })} className="w-full px-4 py-2 border rounded-lg" rows={2} required />
            </div>

            <div>
              <label className="block font-semibold mb-2">Option Type</label>
              <select {...register(`questions.${qIndex}.optionType` as const)} className="w-full px-4 py-2 border rounded-lg">
                <option value="4_options">4 Options (MCQ)</option>
                <option value="2_options">2 Options (True/False type)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-2">Options</label>
              <div className="space-y-2">
                {[...Array(watchedQuestions?.[qIndex]?.optionType === "2_options" ? 2 : 4)].map((_, oIndex) => (
                  <div key={oIndex} className="flex items-center gap-2">
                    <input {...register(`questions.${qIndex}.correctAnswer` as const, { required: "Select correct answer" })} type="radio" value={oIndex.toString()} className="w-4 h-4 text-blue-600 cursor-pointer" />
                    <input {...register(`questions.${qIndex}.options.${oIndex}` as const, { required: "Option is required" })} type="text" className="flex-1 px-4 py-2 border rounded-lg" placeholder={`Option ${oIndex + 1}`} required />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        <button type="button" onClick={handleAddQuestion} className="px-4 py-2 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50 transition w-full font-semibold">
          + Add Question
        </button>

        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition shadow-sm">
          {loading ? "Updating Quiz..." : "Update Quiz"}
        </button>
      </form>
    </div>
  );
}
