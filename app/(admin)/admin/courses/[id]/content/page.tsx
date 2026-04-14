/**
 * Course Content Management (Admin)
 * Add and reorder lessons + quizzes inside Modules
 */

import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Play, Trophy, FolderOpen, AlertTriangle } from "lucide-react";
import { redirect } from "next/navigation";
import { AddModuleForm } from "@/components/admin/AddModuleForm";
import { ContentActions } from "./ContentActions";

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
      modules: {
        orderBy: { order: "asc" },
        include: {
          contents: {
            orderBy: { order: "asc" },
          }
        }
      },
      contents: {
        where: { moduleId: null },
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
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">{course.title} Structure</h1>
          <p className="text-gray-500 font-medium">Manage modules, classes, and quizzes</p>
        </div>
      </div>

      <div className="space-y-6">
        {course.modules.length > 0 ? (
          course.modules.map((module) => (
            <div key={module.id} className="bg-white border rounded-xl shadow-sm overflow-hidden">
              {/* Module Header */}
              <div className="bg-gray-50 border-b p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FolderOpen className="text-blue-600 w-6 h-6" />
                  <h2 className="text-xl font-bold text-gray-900">{module.title}</h2>
                </div>
                <div className="space-x-3 flex shrink-0">
                  <Link
                    href={`/admin/courses/${course.slug}/content/add-lesson?moduleId=${module.id}`}
                    className="bg-white text-gray-900 px-4 py-2 rounded-lg border font-semibold hover:bg-gray-100 transition flex items-center gap-2 text-sm"
                  >
                    <Play className="w-3.5 h-3.5" /> Add Class
                  </Link>
                  <Link
                    href={`/admin/courses/${course.slug}/content/add-quiz?moduleId=${module.id}`}
                    className="bg-gray-900 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-800 transition flex items-center gap-2 text-sm"
                  >
                    <Trophy className="w-3.5 h-3.5" /> Add Quiz
                  </Link>
                </div>
              </div>

              {/* Module Contents */}
              <div className="p-5 space-y-3">
                {module.contents.length > 0 ? (
                  module.contents.map((content) => (
                    <div key={content.id} className="border p-4 rounded-lg flex items-center gap-4 group hover:border-blue-300 transition bg-white">
                      <div className="w-8 h-8 rounded bg-gray-100 text-gray-500 font-bold flex items-center justify-center shrink-0 text-sm">
                        {content.order}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded ${content.type === 'LESSON' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                            {content.type === 'LESSON' ? 'CLASS' : 'QUIZ'}
                          </span>
                          <h3 className="text-base font-bold text-gray-900 truncate tracking-tight">{content.title}</h3>
                        </div>
                        <div className="text-xs text-gray-500 font-medium flex gap-4">
                          {content.type === 'LESSON' && content.duration && (
                            <span>Duration: {Math.floor(content.duration / 60)} minutes</span>
                          )}
                        </div>
                      </div>
                      <ContentActions courseSlug={course.slug} contentId={content.id} type={content.type as 'LESSON' | 'QUIZ'} />
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm italic py-4 text-center">No classes or quizzes added to this module yet.</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 bg-white border border-dashed rounded-xl">
             <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
             <h3 className="text-xl font-bold text-gray-600">No Modules Found</h3>
             <p className="text-gray-400 mt-1">Create a module below to start organizing your classes.</p>
          </div>
        )}

        {/* Unassigned Old Content Warning */}
        {course.contents.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 mt-8">
            <div className="flex items-center gap-2 text-yellow-800 font-bold mb-4">
              <AlertTriangle className="w-5 h-5" />
              Unassigned Legacy Content ({course.contents.length})
            </div>
            <div className="space-y-3 opacity-75">
               {course.contents.map(content => (
                 <div key={content.id} className="border border-yellow-300 p-3 rounded bg-white flex justify-between">
                    <span className="font-semibold text-gray-800">{content.title} ({content.type})</span>
                    <span className="text-xs text-gray-500">Missing Module ID</span>
                 </div>
               ))}
            </div>
            <p className="text-xs text-yellow-600 mt-4">These items were created before the Module System update. You may need to recreate them into a designated module to display them to students.</p>
          </div>
        )}
      </div>

      <AddModuleForm courseId={course.id} />
    </div>
  );
}
