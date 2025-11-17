"use client"; // Error components must be Client Components - 2025 Best Practice

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to error reporting service
    console.error("User detail page error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[500px] items-center justify-center">
      <div className="w-full max-w-md rounded-lg border border-red-200 bg-red-50 p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>

        <h2 className="mb-2 text-2xl font-bold text-red-900">
          Something went wrong!
        </h2>

        <p className="mb-6 text-red-700">
          {error.message || "An unexpected error occurred while loading user details."}
        </p>

        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="rounded-lg bg-red-600 px-6 py-2 text-white hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.href = "/dashboard/users"}
            className="rounded-lg border border-red-300 bg-white px-6 py-2 text-red-700 hover:bg-red-50 transition-colors"
          >
            Back to Users
          </button>
        </div>

        {error.digest && (
          <p className="mt-4 text-xs text-red-600">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
