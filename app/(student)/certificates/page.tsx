/**
 * Certificates Page
 * Download certificates for completed courses
 */

export default function CertificatesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">My Certificates</h1>
        <p className="text-gray-600">Download your course completion certificates</p>
      </div>

      {/* TODO: Fetch from GET /api/certificates */}
      {/* TODO: Display downloaded certificates */}

      <div className="grid md:grid-cols-3 gap-6">
        {/* TODO: CertificateCard components with:
            - Course name
            - Issue date
            - Download button
        */}
      </div>

      {/* Empty state */}
      <div className="text-center py-12">
        <p className="text-gray-500">
          Complete courses to earn certificates →
        </p>
      </div>
    </div>
  );
}
