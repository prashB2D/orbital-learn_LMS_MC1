/**
 * Course Content Management (Admin)
 * Add and reorder lessons + quizzes
 */

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { MoveRight, Play, LayoutList, Trophy } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ContentManagementPage({
  params,
}: {
  params: { id: string };
}) {
  const course = await prisma.course.findFirst({
    where: {
      OR: [
        { id: params.id },
        { slug: params.id }
      ]
    },
    include: {
      contents: {
        orderBy: { order: "asc" },
      }
    }
  });

  if (!course) {
    redirect("/admin/courses");
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-8">
      <div className="bg-white p-6 border rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded inline-block mb-2">Build Scope</span>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">{course.title} Content</h1>
          <p className="text-gray-500 font-medium">Manage dynamic modular structure for this environment</p>
        </div>
        <div className="space-x-3 flex shrink-0">
          <Link
            href={`/admin/courses/${course.slug}/content/add-lesson`}
            className="bg-gray-100 text-gray-900 px-5 py-2.5 rounded-lg border font-bold hover:bg-gray-200 transition flex items-center gap-2"
          >
            <Play className="w-4 h-4" /> Add Lesson
          </Link>
          <Link
            href={`/admin/courses/${course.slug}/content/add-quiz`}
            className="bg-gray-900 text-white px-5 py-2.5 rounded-lg border font-bold hover:bg-gray-800 transition flex items-center gap-2"
          >
            <Trophy className="w-4 h-4" /> Add Quiz
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        {course.contents.length > 0 ? (
          course.contents.map((content) => (
             <div key={content.id} className="bg-white border p-4 rounded-xl shadow-sm flex items-center gap-4 group hover:border-blue-300 transition">
                <div className="w-10 h-10 rounded bg-gray-100 text-gray-400 font-bold flex items-center justify-center shrink-0">
                  {content.order}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                     <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded ${content.type === 'LESSON' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                        {content.type}
                     </span>
                     <h3 className="text-lg font-bold text-gray-900 truncate tracking-tight">{content.title}</h3>
                  </div>
                  <div className="text-xs text-gray-500 font-medium flex gap-4">
                    {content.type === 'LESSON' && content.duration && (
                      <span>Duration: {Math.floor(content.duration / 60)} minutes</span>
                    )}
                    <span>ID: {content.id.split('-')[0]}</span>
                  </div>
                </div>
             </div>
          ))
        ) : (
          <div className="text-center py-20 bg-white border border-dashed rounded-xl">
             <LayoutList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
             <h3 className="text-xl font-bold text-gray-600">No Content Modules</h3>
             <p className="text-gray-400">Click the buttons above to inject lessons or quizzes.</p>
          </div>
        )}
      </div>
    </div>
  );
}
