/**
 * Learning Page (Server Component)
 * Fetches course details, structures contents alongside completion progress
 */

import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import LearnClient from "./LearnClient";

export const dynamic = "force-dynamic";

export default async function LearnPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // 1. Fetch Course and ordered modules/contents
  const course = await prisma.course.findUnique({
    where: { slug: params.slug },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          contents: {
            orderBy: { order: "asc" },
            include: {
              questions: {
                orderBy: { order: "asc" },
                select: { id: true, questionText: true, options: true, order: true }
              }
            }
          }
        }
      },
      contents: {
        where: { moduleId: null },
        orderBy: { order: "asc" },
        include: {
          questions: {
            orderBy: { order: "asc" },
            select: { id: true, questionText: true, options: true, order: true }
          }
        }
      },
    },
  });

  if (!course) notFound();

  // 2. Validate explicit enrollment
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      userId: user.id,
      courseId: course.id,
    },
  });

  if (!enrollment && !course.hasFreeTrialContent) {
    // Attempted to bypass payment wall
    redirect(`/courses/${course.slug}`);
  }

  // 3. Fetch progress for these contents under this enrollment
  const progressLogs = enrollment ? await prisma.progress.findMany({
    where: {
      enrollmentId: enrollment.id,
    },
  }) : [];

  // 4. Attach `completed` and `isAccessible` booleans manually alongside
  const hydratedModules = course.modules.map(module => ({
    ...module,
    contents: module.contents.map(content => ({
      ...content,
      videoId: (!!enrollment || !!content.isFreeTrial) ? content.videoId : null,
      completed: progressLogs.find((p) => p.contentId === content.id)?.completed || false,
      isAccessible: !!enrollment || !!content.isFreeTrial,
    }))
  }));

  const hydratedUnassignedContents = course.contents.map((content) => {
    const log = progressLogs.find((p) => p.contentId === content.id);
    return {
      ...content,
      videoId: (!!enrollment || !!content.isFreeTrial) ? content.videoId : null,
      completed: log ? log.completed : false,
      isAccessible: !!enrollment || !!content.isFreeTrial,
    };
  });

  return <LearnClient 
    course={course} 
    modules={hydratedModules} 
    unassignedContents={hydratedUnassignedContents} 
    enrollmentId={enrollment?.id || ""} 
    isEnrolled={!!enrollment} 
    initialLessonId={searchParams.lessonId as string}
    startFreeTrial={searchParams.freeTrial === "true"}
  />;
}

