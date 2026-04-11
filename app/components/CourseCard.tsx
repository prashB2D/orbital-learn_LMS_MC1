/**
 * CourseCard Component
 * Displays a single course with image, title, description, and price
 * Used on landing page and course listing pages
 */

import Link from "next/link";
import Image from "next/image";

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnail: string;
  slug: string;
}

export function CourseCard({
  id,
  title,
  description,
  price,
  thumbnail,
  slug,
}: CourseCardProps) {
  return (
    <Link href={`/courses/${slug}`}>
      <div className="group h-full rounded-lg border border-gray-200 bg-white overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer">
        {/* Course Thumbnail */}
        <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
          <Image
            src={thumbnail}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>

        {/* Course Info */}
        <div className="p-4 flex flex-col h-full justify-between">
          {/* Title and Description */}
          <div>
            <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {title}
            </h3>
            <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
          </div>

          {/* Price */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-lg font-bold text-blue-600">
              ₹{price.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Start learning today
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
