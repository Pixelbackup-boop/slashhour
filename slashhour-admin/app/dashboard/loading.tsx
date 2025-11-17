export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-64 rounded bg-gray-200"></div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 rounded-lg bg-gray-200"></div>
        ))}
      </div>
      <div className="mt-8 h-64 rounded-lg bg-gray-200"></div>
    </div>
  );
}
