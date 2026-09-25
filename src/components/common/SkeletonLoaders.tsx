import React from "react";
import { Card, Row, Col, Button } from "antd";
import { ReloadOutlined, InboxOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { NAVY, GOLD } from "@/lib/theme";

// Standard Shimmer class that can be applied to any placeholder block
export const Shimmer = ({ className = "" }: { className?: string }) => (
  <div className={`bg-slate-200/70 animate-pulse rounded-md ${className}`} />
);

// 1. Stats Row Skeleton (Dashboard)
export function StatCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <Row gutter={[20, 20]} className="mb-6">
      {Array.from({ length: count }).map((_, i) => (
        <Col xs={24} sm={12} lg={24 / count} key={i}>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="space-y-2 flex-1 mr-4">
              <Shimmer className="h-3.5 w-24" />
              <Shimmer className="h-7 w-20" />
              <Shimmer className="h-2.5 w-32" />
            </div>
            <Shimmer className="w-12 h-12 rounded-xl shrink-0" />
          </div>
        </Col>
      ))}
    </Row>
  );
}

// 2. Table Page Skeleton (Floors, Rooms, Beds, Reservations, Rates, Housekeeping, DNR)
export function TableSkeleton({
  columns = 5,
  rows = 5,
  title = "",
  hasHeaderActions = true,
}: {
  columns?: number;
  rows?: number;
  title?: string;
  hasHeaderActions?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-6 mb-6">
      {hasHeaderActions && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
          <div className="space-y-1.5">
            {title ? (
              <div className="text-lg font-serif font-semibold text-[#0B1F3A]">{title}</div>
            ) : (
              <Shimmer className="h-6 w-36" />
            )}
            <Shimmer className="h-3 w-48" />
          </div>
          <div className="flex items-center gap-2.5">
            <Shimmer className="h-9 w-40 sm:w-56 rounded-xl" />
            <Shimmer className="h-9 w-24 sm:w-28 rounded-xl" />
          </div>
        </div>
      )}

      {/* Table Head Placeholder */}
      <div className="grid gap-3 pb-3 border-b border-slate-100 mb-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {Array.from({ length: columns }).map((_, i) => (
          <Shimmer key={i} className="h-4 w-3/4 rounded" />
        ))}
      </div>

      {/* Table Rows Placeholder */}
      <div className="space-y-3.5">
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div
            key={rIdx}
            className="grid gap-3 py-2.5 border-b border-slate-50 items-center"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: columns }).map((_, cIdx) => (
              <Shimmer
                key={cIdx}
                className={`h-4 rounded ${
                  cIdx === 0
                    ? "w-4/5"
                    : cIdx === columns - 1
                    ? "w-1/2 ml-auto"
                    : cIdx % 2 === 0
                    ? "w-2/3"
                    : "w-3/5"
                }`}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Table Pagination Placeholder */}
      <div className="flex items-center justify-between pt-4 mt-2">
        <Shimmer className="h-3 w-28" />
        <div className="flex gap-1.5">
          <Shimmer className="w-8 h-8 rounded-lg" />
          <Shimmer className="w-8 h-8 rounded-lg" />
          <Shimmer className="w-8 h-8 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// 3. Card Grid Skeleton (Room Types, Seasons, Products, Features)
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <Shimmer className="h-5 w-3/4" />
              <Shimmer className="h-3 w-1/2" />
            </div>
            <Shimmer className="w-10 h-10 rounded-xl" />
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-50">
            <div className="flex justify-between items-center">
              <Shimmer className="h-3 w-20" />
              <Shimmer className="h-3 w-16" />
            </div>
            <div className="flex justify-between items-center">
              <Shimmer className="h-3 w-24" />
              <Shimmer className="h-3 w-12" />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Shimmer className="h-8 w-16 rounded-lg" />
            <Shimmer className="h-8 w-20 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

// 4. List Skeleton (Reminders, Activity Feed, Timeline)
export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-start gap-3.5 py-2.5 border-b border-slate-50 last:border-0">
          <Shimmer className="w-9 h-9 rounded-xl shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <Shimmer className="h-4 w-44" />
              <Shimmer className="h-3 w-20" />
            </div>
            <Shimmer className="h-3 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

// 5. Floor Plan Skeleton (Floor Plan Layout)
export function FloorPlanSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Shimmer className="h-6 w-48" />
          <Shimmer className="h-3 w-64" />
        </div>
        <div className="flex gap-2">
          <Shimmer className="h-9 w-32 rounded-xl" />
          <Shimmer className="h-9 w-24 rounded-xl" />
        </div>
      </div>

      <div className="h-96 rounded-2xl bg-slate-50 border border-dashed border-slate-200 p-6 flex flex-col justify-between">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Shimmer key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="flex justify-center">
          <Shimmer className="h-4 w-48" />
        </div>
      </div>
    </div>
  );
}

// 6. Luxury Styled Empty State
export function EmptyState({
  title = "No records found",
  description = "Get started by adding your first entry or adjust your filters.",
  actionText,
  onAction,
  icon,
}: {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 sm:p-12 text-center flex flex-col items-center justify-center my-4">
      <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center text-2xl mb-3 shadow-inner">
        {icon || <InboxOutlined style={{ color: "#94a3b8" }} />}
      </div>
      <h3 className="font-serif text-lg font-semibold text-[#0B1F3A] mb-1">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mb-5 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <Button
          type="primary"
          onClick={onAction}
          style={{ background: NAVY, borderColor: NAVY }}
          className="rounded-xl px-5 h-9 font-medium shadow-sm"
        >
          {actionText}
        </Button>
      )}
    </div>
  );
}

// 7. Error State with Retry
export function ErrorState({
  message = "Failed to load operational data",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="bg-red-50/70 border border-red-200/80 rounded-2xl p-6 text-center my-4 flex flex-col items-center">
      <ExclamationCircleOutlined className="text-red-500 text-3xl mb-2" />
      <h4 className="text-sm font-semibold text-red-900 mb-1">Operational Sync Interrupted</h4>
      <p className="text-xs text-red-700 max-w-md mb-4">{message}</p>
      {onRetry && (
        <Button
          icon={<ReloadOutlined />}
          onClick={onRetry}
          danger
          className="rounded-xl h-8 px-4 text-xs font-medium"
        >
          Retry Connection
        </Button>
      )}
    </div>
  );
}
