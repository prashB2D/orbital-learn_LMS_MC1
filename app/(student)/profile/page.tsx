import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import ProfileClient from "./ProfileClient";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  let dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      enrollments: {
        include: { progress: true }
      }
    }
  });

  if (!dbUser) redirect("/login");

  // Auto-generate studentId if null
  if (!dbUser.studentId) {
    const randomHex = Math.floor(Math.random() * 16777215).toString(16).toUpperCase().padStart(6, '0');
    dbUser = await prisma.user.update({
      where: { id: user.id },
      data: { studentId: `HBS-${randomHex}` },
      include: {
        enrollments: {
          include: { progress: true }
        }
      }
    });
  }

  // Calculate quick stats
  const coursesEnrolled = dbUser.enrollments.length;
  // Progress holds lastWatchedTime in seconds, so we sum that up and divide by 60 for minutes
  const totalWatchTimeSeconds = dbUser.enrollments.flatMap(e => e.progress).reduce((acc, p) => acc + (p.lastWatchedTime || 0), 0);
  const watchTimeMinutes = Math.floor(totalWatchTimeSeconds / 60);

  const stats = {
    coursesEnrolled,
    watchTimeMinutes,
    currentStreak: dbUser.currentStreak,
    coinBalance: dbUser.coinBalance
  };

  const serializedUser = {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    studentId: dbUser.studentId,
    phoneNumber: dbUser.phoneNumber,
    dateOfBirth: dbUser.dateOfBirth?.toISOString(),
    location: dbUser.location,
    bio: dbUser.bio,
    profilePicture: dbUser.profilePicture,
    createdAt: dbUser.createdAt.toISOString()
  };

  return <ProfileClient user={serializedUser} stats={stats} />;
}
