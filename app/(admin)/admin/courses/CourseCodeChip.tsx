"use client";

export function CourseCodeChip({ code }: { code: string }) {
  return (
    <span 
      className="bg-gray-100 text-gray-700 text-[10px] font-mono font-bold px-2 py-0.5 rounded border cursor-pointer hover:bg-gray-200 transition"
      onClick={(e) => {
        e.preventDefault();
        navigator.clipboard.writeText(code);
        // Could add a toast here
      }}
      title="Click to copy Course ID"
    >
      {code}
    </span>
  );
}
