"use client";
import { useDriverStore } from "@/stores/driver-store";
import { DriverPageWrapper } from "@/components/driver/DriverPageWrapper";
import { DashboardCard } from "@/components/vendor/DashboardCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { Star, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

function RatingBar({ star, count, total }: { star: number; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1 w-12 flex-shrink-0">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{star}</span>
        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
      </div>
      <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full bg-yellow-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-500 dark:text-gray-400 w-6 text-right">{count}</span>
    </div>
  );
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={cn("w-4 h-4", i <= Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-200 dark:text-gray-700")} />
      ))}
    </div>
  );
}

export default function RatingsPage() {
  const { stats, statsLoading, loadStats } = useDriverStore();

  const distribution = stats?.rating_distribution ?? {};
  const totalRatings = Object.values(distribution).reduce((a, b) => a + b, 0);

  return (
    <DriverPageWrapper
      title="Ratings & Reviews"
      subtitle="Your delivery performance as rated by customers."
      actions={
        <button onClick={loadStats} disabled={statsLoading} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors">
          <RefreshCw className={cn("w-4 h-4", statsLoading && "animate-spin")} />
        </button>
      }
    >
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <DashboardCard title="Average Rating" value={`${(stats?.avg_rating ?? 0).toFixed(1)} / 5`} icon={<Star className="w-5 h-5" />} iconBg="bg-yellow-50 dark:bg-yellow-900/20" iconColor="text-yellow-500" loading={statsLoading} />
        <DashboardCard title="Total Reviews" value={stats?.total_reviews ?? 0} icon={<Star className="w-5 h-5" />} iconBg="bg-blue-50 dark:bg-blue-900/20" iconColor="text-blue-500" loading={statsLoading} />
        <DashboardCard title="On-Time Rate" value={`${(stats?.on_time_rate ?? 0).toFixed(0)}%`} icon={<Star className="w-5 h-5" />} iconBg="bg-green-50 dark:bg-green-900/20" iconColor="text-green-500" loading={statsLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Rating distribution */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Rating Distribution</h3>
          {statsLoading ? (
            <div className="space-y-3">{[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-5 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />)}</div>
          ) : (
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((star) => (
                <RatingBar key={star} star={star} count={distribution[String(star)] ?? 0} total={totalRatings} />
              ))}
            </div>
          )}
          {/* Big rating display */}
          <div className="mt-6 flex items-center gap-4">
            <p className="text-5xl font-black text-gray-900 dark:text-white">{(stats?.avg_rating ?? 0).toFixed(1)}</p>
            <div>
              <StarDisplay rating={stats?.avg_rating ?? 0} />
              <p className="text-xs text-gray-400 mt-1">{totalRatings} reviews</p>
            </div>
          </div>
        </div>

        {/* Recent reviews */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Reviews</h3>
          </div>
          {statsLoading ? (
            <div className="p-4 space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />)}</div>
          ) : !stats?.recent_reviews?.length ? (
            <EmptyState title="No reviews yet" description="Customer reviews will appear here after deliveries." icon={<Star className="h-10 w-10" />} />
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {stats.recent_reviews.map((review) => (
                <div key={review.id} className="px-5 py-4">
                  <div className="flex items-start justify-between mb-1.5">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {review.buyer__first_name} {review.buyer__last_name}
                    </p>
                    <StarDisplay rating={review.rating} />
                  </div>
                  {review.comment && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{review.comment}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1.5">
                    Order #{review.order__id} · {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DriverPageWrapper>
  );
}
