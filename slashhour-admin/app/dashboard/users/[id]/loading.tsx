// Loading skeleton for user detail page - 2025 Best Practice
export default function Loading() {
  return (
    <div className="animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-6 flex items-center gap-4">
        <div className="h-10 w-32 rounded-lg bg-gray-200"></div>
        <div className="h-10 w-48 rounded-lg bg-gray-200"></div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column Skeleton */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            {/* Avatar */}
            <div className="mb-6 flex flex-col items-center">
              <div className="mb-4 h-24 w-24 rounded-full bg-gray-200"></div>
              <div className="h-8 w-40 rounded-lg bg-gray-200"></div>
              <div className="mt-2 h-4 w-24 rounded-lg bg-gray-200"></div>
            </div>

            {/* Badges */}
            <div className="mb-6 flex justify-center gap-2">
              <div className="h-8 w-32 rounded-full bg-gray-200"></div>
            </div>
            <div className="mb-6 flex justify-center gap-2">
              <div className="h-6 w-20 rounded-full bg-gray-200"></div>
            </div>

            {/* Contact Info */}
            <div className="space-y-4 border-t border-gray-200 pt-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="h-5 w-5 rounded bg-gray-200"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-16 rounded bg-gray-200"></div>
                    <div className="h-5 w-full rounded bg-gray-200"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column Skeleton */}
        <div className="space-y-6 lg:col-span-2">
          {/* Activity Stats Skeleton */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 h-6 w-48 rounded-lg bg-gray-200"></div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-lg bg-gray-50 p-4">
                  <div className="h-5 w-24 rounded bg-gray-200"></div>
                  <div className="mt-2 h-8 w-16 rounded bg-gray-200"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Business Section Skeleton */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 h-6 w-40 rounded-lg bg-gray-200"></div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="space-y-3">
                <div className="h-6 w-48 rounded-lg bg-gray-200"></div>
                <div className="h-4 w-32 rounded-lg bg-gray-200"></div>
                <div className="flex gap-4">
                  <div className="h-4 w-24 rounded-lg bg-gray-200"></div>
                  <div className="h-4 w-24 rounded-lg bg-gray-200"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Metrics Skeleton */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 h-6 w-40 rounded-lg bg-gray-200"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="h-5 w-32 rounded-lg bg-gray-200"></div>
                  <div className="h-6 w-12 rounded-lg bg-gray-200"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
