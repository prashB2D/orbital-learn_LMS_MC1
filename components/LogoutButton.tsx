"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function LogoutButton({ className }: { className?: string }) {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className={className}
    >
      <LogOut className="w-4 h-4" />
      <span className="md:inline">Logout</span>
    </button>
  );
}
