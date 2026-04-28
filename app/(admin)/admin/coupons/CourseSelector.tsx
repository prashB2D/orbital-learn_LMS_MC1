"use client";

import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";

export function CourseSelector({ 
  value, 
  onChange 
}: { 
  value: string; 
  onChange: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [courses, setCourses] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      const res = await fetch(`/api/admin/courses/search?q=${query}`);
      const data = await res.json();
      if (data.success) {
        setCourses(data.courses);
      }
      setLoading(false);
    };

    const timer = setTimeout(() => {
      fetchCourses();
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedCourse = courses.find(c => c.id === value);

  return (
    <div className="relative" ref={wrapperRef}>
      <div 
        className="w-full border px-3 py-2 rounded-lg bg-white flex justify-between items-center cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">
          {selectedCourse ? `${selectedCourse.courseCode} - ${selectedCourse.title}` : "Select a course..."}
        </span>
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div className="p-2 border-b sticky top-0 bg-white">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                className="w-full pl-8 pr-2 py-1 border rounded text-sm"
                placeholder="Search by code or title..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                onClick={e => e.stopPropagation()}
              />
            </div>
          </div>
          
          <div className="p-1">
            {loading ? (
              <div className="p-2 text-sm text-gray-500 text-center">Loading...</div>
            ) : courses.length > 0 ? (
              courses.map(course => (
                <div 
                  key={course.id}
                  className="px-3 py-2 hover:bg-blue-50 rounded cursor-pointer flex items-center gap-2"
                  onClick={() => {
                    onChange(course.id);
                    setIsOpen(false);
                  }}
                >
                  <span className="bg-gray-100 text-gray-700 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border">
                    {course.courseCode}
                  </span>
                  <span className="text-sm truncate">{course.title}</span>
                </div>
              ))
            ) : (
              <div className="p-2 text-sm text-gray-500 text-center">No courses found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
