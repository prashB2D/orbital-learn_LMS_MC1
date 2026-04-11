/**
 * Add Quiz Page (Admin)
 * Form to add quiz with multiple questions
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";

interface QuestionFormValue {
  questionText: string;
  options: string[];
  correctAnswer: string; // radio buttons use string value
  order: number;
}

interface QuizFormValues {
  title: string;
  order: number;
  questions: QuestionFormValue[];
}

export default function AddQuizPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { register, control, handleSubmit, formState: { errors } } = useForm<QuizFormValues>({
    defaultValues: {
      title: "",
      order: 1,
      questions: [
        {
          questionText: "",
          options: ["", "", "", ""],
          correctAnswer: "0",
          order: 1,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions",
  });

  const handleAddQuestion = () => {
    append({
      questionText: "",
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
        courseId: params.id,
        title: data.title,
        order: Number(data.order),
        questions: data.questions.map((q, i) => ({
          questionText: q.questionText,
          options: q.options,
          correctAnswer: Number(q.correctAnswer),
          order: i + 1,
        })),
      };

      const response = await fetch("/api/content/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to add quiz");
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
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Add Quiz</h1>

      {error && (
        <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Quiz Title & Order */}
        <div className="bg-white p-6 rounded-lg border space-y-4 shadow-sm">
          <div>
            <label className="block font-semibold mb-2">Quiz Title</label>
            <input
              {...register("title", { required: "Title is required" })}
              type="text"
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="React Basics Quiz"
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
          </div>

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
        </div>

        {/* Questions */}
        {fields.map((field, qIndex) => (
          <div key={field.id} className="bg-white p-6 rounded-lg border space-y-4 shadow-sm relative">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">Question {qIndex + 1}</h3>
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(qIndex)}
                  className="text-red-500 text-sm hover:underline"
                >
                  Remove Question
                </button>
              )}
            </div>

            {/* Question Text */}
            <div>
              <label className="block font-semibold mb-2">Question Text</label>
              <textarea
                {...register(`questions.${qIndex}.questionText` as const, { required: "Question text is required" })}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Enter question..."
                rows={2}
              />
              {errors.questions?.[qIndex]?.questionText && (
                <p className="text-red-500 text-sm mt-1">{errors.questions[qIndex]?.questionText?.message}</p>
              )}
            </div>

            {/* Options */}
            <div>
              <label className="block font-semibold mb-2">Options</label>
              <div className="space-y-2">
                {[0, 1, 2, 3].map((oIndex) => (
                  <div key={oIndex} className="flex items-center gap-2">
                    <input
                      {...register(`questions.${qIndex}.correctAnswer` as const, { required: "Select correct answer" })}
                      type="radio"
                      value={oIndex.toString()}
                      className="w-4 h-4 text-blue-600 cursor-pointer"
                    />
                    <input
                      {...register(`questions.${qIndex}.options.${oIndex}` as const, { required: "Option is required" })}
                      type="text"
                      className="flex-1 px-4 py-2 border rounded-lg"
                      placeholder={`Option ${oIndex + 1}`}
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">Select the radio button next to the correct option.</p>
              {errors.questions?.[qIndex]?.options && (
                <p className="text-red-500 text-sm mt-1">All 4 options must be filled.</p>
              )}
              {errors.questions?.[qIndex]?.correctAnswer && (
                <p className="text-red-500 text-sm mt-1">{errors.questions[qIndex]?.correctAnswer?.message}</p>
              )}
            </div>
          </div>
        ))}

        {/* Add Question Button */}
        <button
          type="button"
          onClick={handleAddQuestion}
          className="px-4 py-2 border-2 border-dashed border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50 transition w-full font-semibold"
        >
          + Add Question
        </button>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition shadow-sm"
        >
          {loading ? "Creating Quiz..." : "Create Quiz"}
        </button>
      </form>
    </div>
  );
}
