/**
 * GET /api/content/[contentId]
 * Purpose: Get lesson/quiz details with questions (for students)
 * Input: URL param: contentId
 * Output: {id, title, type, videoId, duration, attachments[], questions[] (if quiz, answers hidden)}
 * Auth Required: Yes (verify enrollment)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCourseAccess } from "@/lib/auth";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const content = await prisma.content.findUnique({ 
      where: { id: params.id },
      include: { questions: { orderBy: { order: "asc" } } }
    });
    if (!content) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, content }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const contentToUpdate = await prisma.content.findUnique({ where: { id: params.id } });
    if (!contentToUpdate) return NextResponse.json({ error: "Not found" }, { status: 404 });
    
    await requireCourseAccess(contentToUpdate.courseId);
    
    const body = await request.json();

    const updateData: any = {
      title: body.title,
      videoId: body.videoId,
      duration: body.duration,
      attachments: body.attachments,
      order: body.order,
      moduleId: body.moduleId || null,
      skill: body.skill,
      xpReward: body.xpReward !== undefined ? Number(body.xpReward) : undefined,
    };

    if (body.questions) {
       // Delete existing questions and recreate them to simplify update
       await prisma.question.deleteMany({ where: { contentId: params.id } });
       updateData.questions = {
         create: body.questions.map((q: any, i: number) => ({
           questionText: q.questionText,
           options: q.optionType === "2_options" ? q.options.slice(0, 2) : q.options,
           optionType: q.optionType,
           correctAnswer: Number(q.correctAnswer),
           order: i + 1,
         }))
       };
    }

    const content = await prisma.content.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ success: true, content }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update content" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const contentToDelete = await prisma.content.findUnique({ where: { id: params.id } });
    if (!contentToDelete) return NextResponse.json({ error: "Not found" }, { status: 404 });
    
    await requireCourseAccess(contentToDelete.courseId);
    
    await prisma.content.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete content" }, { status: 500 });
  }
}
