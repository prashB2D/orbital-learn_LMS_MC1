import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { VALID_SKILLS } from "@/lib/constants";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "MENTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const courseId = searchParams.get("courseId");
    const search = searchParams.get("search") || "";

    const assignments = await prisma.courseAssignment.findMany({
      where: { mentorId: user.id },
      include: { course: { select: { id: true, title: true } } }
    });
    
    let allowedCourses = assignments.map(a => a.course);
    let allowedCourseIds = allowedCourses.map(c => c.id);

    if (courseId) {
      if (!allowedCourseIds.includes(courseId)) {
        return NextResponse.json({ error: "No access to this course" }, { status: 403 });
      }
      allowedCourseIds = [courseId];
      allowedCourses = allowedCourses.filter(c => c.id === courseId);
    }

    if (allowedCourseIds.length === 0) {
      return NextResponse.json({ success: true, students: [] });
    }

    // 2. Query students enrolled in these courses
    const students = await prisma.user.findMany({
      where: {
        role: "STUDENT",
        enrollments: {
          some: { courseId: { in: allowedCourseIds } }
        },
        OR: search ? [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ] : undefined
      },
      include: {
        enrollments: {
          where: { courseId: { in: allowedCourseIds } },
          include: {
            course: { select: { id: true, title: true } },
            progress: true
          }
        },
        quizAttempts: {
          take: 5,
          orderBy: { createdAt: "desc" },
          include: { quiz: { select: { title: true } } }
        },
        earnedBadges: {
          where: { isRevoked: false },
          include: { badge: true }
        },
        coinTransactions: {
          where: { amount: { gt: 0 }, isWithdrawal: false, awardedById: user.id },
          orderBy: { awardedAt: "desc" }
        },
        skills: true
      }
    });

    // 3. Format the response
    const formattedStudents = students.map(student => {
      // Calculate progress % across enrolled courses
      let totalProgressCompleted = 0;
      let totalProgressPossible = 0;

      const courses = student.enrollments.map(e => {
        const completed = e.progress.filter(p => p.completed).length;
        totalProgressCompleted += completed;
        // Approximation if we don't fetch content count per course here
        // We'll just return the raw progress array for the frontend to handle or 
        // calculate a simple completed count.
        return {
          id: e.course.id,
          title: e.course.title,
          completedCount: completed
        };
      });

      // Format skills
      const formattedSkills: Record<string, any> = {};
      student.skills.forEach(skill => {
        const xp = skill.totalXP;
        // Approximation threshold function inline
        let nextLevelAt = 100;
        if (xp >= 5500) nextLevelAt = 5500;
        else if (xp >= 4500) nextLevelAt = 5500;
        else if (xp >= 3600) nextLevelAt = 4500;
        else if (xp >= 2800) nextLevelAt = 3600;
        else if (xp >= 2100) nextLevelAt = 2800;
        else if (xp >= 1500) nextLevelAt = 2100;
        else if (xp >= 1000) nextLevelAt = 1500;
        else if (xp >= 600) nextLevelAt = 1000;
        else if (xp >= 300) nextLevelAt = 600;
        else if (xp >= 100) nextLevelAt = 300;
        
        formattedSkills[skill.skillName] = {
          currentLevel: skill.currentLevel,
          totalXP: skill.totalXP,
          nextLevelAt
        };
      });

      VALID_SKILLS.forEach(s => {
        if (!formattedSkills[s]) {
          formattedSkills[s] = { currentLevel: 0, totalXP: 0, nextLevelAt: 100 };
        }
      });

      return {
        id: student.id,
        name: student.name,
        email: student.email,
        createdAt: student.createdAt,
        courses, // raw courses list
        quizAttempts: student.quizAttempts,
        badges: student.earnedBadges.map(eb => eb.badge.name),
        badgeCount: student.earnedBadges.length,
        coins: student.coinBalance || 0,
        coinTransactions: student.coinTransactions,
        skills: formattedSkills
      };
    });

    // Group by course
    const coursesResponse = allowedCourses.map(course => {
      // Find all students who have this course in their courses array
      const enrolledStudents = formattedStudents
        .filter(s => s.courses.some(c => c.id === course.id))
        .map(s => {
          const courseData = s.courses.find(c => c.id === course.id);
          return {
            userId: s.id,
            id: s.id, // keep for backwards compatibility if needed
            name: s.name,
            email: s.email,
            progress: courseData?.completedCount || 0,
            lastActive: s.createdAt, // approximation
            coinBalance: s.coins,
            coins: s.coins, // keep for compatibility
            badgeCount: s.badgeCount,
            badges: s.badges,
            coinTransactions: s.coinTransactions,
            skills: s.skills,
            quizAttempts: s.quizAttempts,
            courses: s.courses
          };
        });
        
      return {
        courseId: course.id,
        courseName: course.title,
        students: enrolledStudents
      };
    });

    return NextResponse.json({ success: true, courses: coursesResponse });
  } catch (error: any) {
    console.error("Fetch mentor students error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
