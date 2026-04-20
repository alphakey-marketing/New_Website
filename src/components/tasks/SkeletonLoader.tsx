/** Animated skeleton loading screen shown while the task dashboard initialises. */
export default function TasksSkeletonLoader() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar skeleton */}
      <div className="w-64 bg-white shadow-lg h-screen p-4 space-y-3 flex-shrink-0">
        <div className="h-8 bg-gray-200 rounded-md animate-pulse" />
        <div className="h-8 bg-gray-200 rounded-md animate-pulse w-3/4" />
        <div className="pt-3 space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-7 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="flex-1 flex flex-col">
        {/* Navbar skeleton */}
        <div className="bg-white shadow h-14 px-6 flex items-center justify-between">
          <div className="flex gap-2">
            <div className="h-8 w-20 bg-gray-200 rounded-md animate-pulse" />
            <div className="h-8 w-20 bg-gray-200 rounded-md animate-pulse" />
            <div className="h-8 w-20 bg-gray-200 rounded-md animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-16 bg-gray-200 rounded-md animate-pulse" />
            <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
          </div>
        </div>

        {/* Content skeleton */}
        <div className="flex-1 p-8 max-w-3xl mx-auto w-full space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-64 bg-gray-100 rounded animate-pulse" />
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-white border border-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Animated skeleton loading screen for the Notes page. */
export function NotesSkeletonLoader() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar skeleton */}
      <div className="bg-white shadow h-16 px-6 flex items-center justify-between">
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Content skeleton */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar skeleton */}
        <div className="w-80 bg-white border-r border-gray-200 p-4 space-y-3">
          <div className="h-9 bg-blue-200 rounded-md animate-pulse" />
          <div className="h-9 bg-gray-200 rounded-md animate-pulse" />
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 bg-gray-100 rounded-md animate-pulse" />
          ))}
        </div>

        {/* Main area skeleton */}
        <div className="flex-1 p-8 space-y-4">
          <div className="h-8 w-40 bg-gray-200 rounded animate-pulse" />
          {[0, 1].map((i) => (
            <div key={i} className="h-4 w-full bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
