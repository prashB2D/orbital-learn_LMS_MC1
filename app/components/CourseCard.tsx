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
  basePrice: number;
  offerPercent: number | null;
  finalPrice: number;
  thumbnail: string;
  slug: string;
  hasFreeTrialContent?: boolean;
}

export function CourseCard({
  id,
  title,
  description,
  basePrice,
  offerPercent,
  finalPrice,
  thumbnail,
  slug,
  hasFreeTrialContent,
}: CourseCardProps) {
  const safeFinalPrice = finalPrice ?? basePrice ?? 0;
  return (
    <Link href={`/courses/${slug}`}>
      <div className="group h-full rounded-lg border border-gray-200 bg-white overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer relative">
        {/* Preview Badge */}
        {hasFreeTrialContent && (
          <div className="absolute top-2 right-2 z-10 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
            Preview Available
          </div>
        )}
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
          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-1">
            {offerPercent && offerPercent > 0 ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-red-500 line-through">
                    ₹{basePrice.toLocaleString("en-IN")}
                  </span>
                  <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    {offerPercent}% off
                  </span>
                </div>
                <p className="text-xl font-bold text-green-600">
                  ₹{safeFinalPrice.toLocaleString("en-IN")}
                </p>
              </>
            ) : (
              <p className="text-xl font-bold text-gray-900">
                ₹{safeFinalPrice.toLocaleString("en-IN")}
              </p>
            )}
            {hasFreeTrialContent ? (
               <button className="mt-2 w-full text-center bg-blue-50 text-blue-600 hover:bg-blue-100 py-1.5 rounded text-sm font-bold transition">
                 Preview / Buy
               </button>
            ) : (
               <button className="mt-2 w-full text-center bg-gray-50 text-gray-700 border hover:bg-gray-100 py-1.5 rounded text-sm font-bold transition">
                 Buy Now
               </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
