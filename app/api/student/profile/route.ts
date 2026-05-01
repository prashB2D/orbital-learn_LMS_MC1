import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { phoneNumber, dateOfBirth, location, bio, profilePicture } = body;

    if (phoneNumber !== undefined && phoneNumber !== "") {
      const { isValidPhoneNumber } = require('libphonenumber-js');
      if (!isValidPhoneNumber(phoneNumber)) {
        return NextResponse.json({ error: "Please enter a valid phone number for the selected country" }, { status: 400 });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        phoneNumber: phoneNumber !== undefined ? phoneNumber : undefined,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        location: location !== undefined ? location : undefined,
        bio: bio !== undefined ? bio : undefined,
        profilePicture: profilePicture !== undefined ? profilePicture : undefined,
      }
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
