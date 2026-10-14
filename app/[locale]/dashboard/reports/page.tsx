"use client";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  FileBarChart,
  FileSpreadsheet,
  FileText,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";

type ReportStatus = "ready" | "generating" | "failed";
type ReportFormat = "PDF" | "Excel";

interface Report {
  id: string;
  name: string;
  type: string;
  page: string;
  period: string;
  format: ReportFormat;
  status: ReportStatus;
  createdAt: string;
  size: string;
}

const INITIAL_REPORTS: Report[] = [
  {
    id: "1",
    name: "Facebook Sentiment Analysis",
    type: "Sentiment",
    page: "Adama City Administration",
    period: "Sep 1 – Sep 15, 2026",
    format: "PDF",
    status: "ready",
    createdAt: "10 minutes ago",
    size: "2.4 MB",
  },
  {
    id: "2",
    name: "Facebook Engagement Report",
    type: "Engagement",
    page: "Adama City Administration",
    period: "Sep 1 – Sep 15, 2026",
    format: "Excel",
    status: "ready",
    createdAt: "1 hour ago",
    size: "1.8 MB",
  },
  {
    id: "3",
    name: "Public Feedback Summary",
    type: "Insights",
    page: "Adama City Administration",
    period: "Aug 1 – Aug 31, 2026",
    format: "PDF",
    status: "ready",
    createdAt: "Yesterday",
    size: "3.1 MB",
  },
  {
    id: "4",
    name: "Monthly Analytics Report",
    type: "Overview",
    page: "Adama City Administration",
    period: "Aug 1 – Aug 31, 2026",
    format: "PDF",
    status: "generating",
    createdAt: "2 minutes ago",
    size: "—",
  },
];

function FormatIcon({ format }: { format: ReportFormat }) {
  return format === "Excel" ? (
    <FileSpreadsheet className="h-4 w-4" />
  ) : (
    <FileText className="h-4 w-4" />
  );
}

function StatusBadge({ status }: { status: ReportStatus }) {
  switch (status) {
    case "ready":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-3 w-3" />
          Ready
        </span>
      );

    case "generating":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2 py-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
          <Clock3 className="h-3 w-3" />
          Generating
        </span>
      );

    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2 py-1 text-[11px] font-medium text-destructive">
          Failed
        </span>
      );
  }
}

function ReportActions({
  report,
  onDelete,
}: {
  report: Report;
  onDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`Actions for ${report.name}`}
        title="Actions"
        onClick={() => setOpen((value) => !value)}
        className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close actions"
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />

          <div className="absolute right-0 top-9 z-20 w-36 overflow-hidden rounded-md border bg-popover p-1 shadow-md">
            {report.status === "ready" && (
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2 rounded-sm px-2.5 py-2 text-xs text-foreground transition-colors hover:bg-muted"
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onDelete(report.id);
              }}
              className="flex w-full items-center gap-2 rounded-sm px-2.5 py-2 text-xs text-destructive transition-colors hover:bg-destructive/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function ReportRow({
  report,
  onDelete,
}: {
  report: Report;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="group grid grid-cols-[minmax(0,1fr)_auto] gap-3 px-4 py-4 transition-colors hover:bg-muted/30 md:grid-cols-[minmax(260px,1.8fr)_minmax(140px,1fr)_100px_100px_80px] md:items-center">
      {/* Report */}
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <FormatIcon format={report.format} />
        </div>

        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <p className="truncate text-sm font-medium">
              {report.name}
            </p>

            <span className="hidden shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground lg:inline-flex">
              {report.type}
            </span>
          </div>

          <p className="mt-0.5 truncate text-xs text-muted-foreground md:hidden">
            {report.page}
          </p>

          <p className="mt-0.5 truncate text-xs text-muted-foreground md:hidden">
            {report.period}
          </p>
        </div>
      </div>

      {/* Page */}
      <div className="hidden min-w-0 md:block">
        <p className="truncate text-xs font-medium">
          {report.page}
        </p>

        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
          {report.period}
        </p>
      </div>

      {/* Status */}
      <div className="hidden md:block">
        <StatusBadge status={report.status} />
      </div>

      {/* Created */}
      <div className="hidden lg:block">
        <p className="text-xs text-muted-foreground">
          {report.createdAt}
        </p>

        <p className="mt-0.5 text-[11px] text-muted-foreground">
          {report.size}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-1">
        {report.status === "ready" && (
          <button
            type="button"
            aria-label={`Download ${report.name}`}
            title="Download"
            className="hidden h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:flex"
          >
            <Download className="h-4 w-4" />
          </button>
        )}

        <ReportActions
          report={report}
          onDelete={onDelete}
        />
      </div>

      {/* Mobile status */}
      <div className="col-start-1 row-start-2 md:hidden">
        <StatusBadge status={report.status} />
      </div>
    </div>
  );
}

function StatItem({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>

      <div>
        <p className="text-lg font-semibold leading-none">
          {value}
        </p>

        <p className="mt-1 text-[11px] text-muted-foreground">
          {label}
        </p>
      </div>
    </div>
  );
}

export default function ReportPage() {
  const [reports, setReports] = useState<Report[]>(INITIAL_REPORTS);
  const [search, setSearch] = useState("");
  const [format, setFormat] = useState<"all" | ReportFormat>("all");

  const readyCount = reports.filter(
    (report) => report.status === "ready",
  ).length;

  const generatingCount = reports.filter(
    (report) => report.status === "generating",
  ).length;

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase();

    return reports.filter((report) => {
      const matchesSearch =
        !query ||
        report.name.toLowerCase().includes(query) ||
        report.type.toLowerCase().includes(query) ||
        report.page.toLowerCase().includes(query);

      const matchesFormat =
        format === "all" || report.format === format;

      return matchesSearch && matchesFormat;
    });
  }, [reports, search, format]);

  const handleDelete = (id: string) => {
    setReports((current) =>
      current.filter((report) => report.id !== id),
    );
  };

  return (
    <div className="m-auto  max-w-5xl space-y-5">
      {/* =====================================================
          Header
      ===================================================== */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileBarChart className="h-4 w-4" />
            </div>

            <div>
              <h1 className="text-xl font-semibold tracking-tight">
                Reports
              </h1>

              <p className="mt-0.5 text-sm text-muted-foreground">
                Generate and download analytics reports.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-3.5 text-xs font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          <Plus className="h-3.5 w-3.5" />
          Generate report
        </button>
      </div>

      {/* =====================================================
          Quick summary
      ===================================================== */}
      <section className="rounded-lg border bg-card">
        <div className="grid divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          <div className="px-4 py-3.5">
            <StatItem
              label="Total reports"
              value={reports.length}
              icon={FileBarChart}
            />
          </div>

          <div className="px-4 py-3.5">
            <StatItem
              label="Ready to download"
              value={readyCount}
              icon={CheckCircle2}
            />
          </div>

          <div className="px-4 py-3.5">
            <StatItem
              label="Currently generating"
              value={generatingCount}
              icon={RefreshCw}
            />
          </div>
        </div>
      </section>

      {/* =====================================================
          Generate report
      ===================================================== */}
      <section className="rounded-lg border bg-card">
        <div className="flex flex-col gap-4 px-4 py-4 lg:flex-row lg:items-end">
          {/* Report type */}
          <div className="min-w-0 flex-1">
            <label className="mb-1.5 block text-xs font-medium">
              Report type
            </label>

            <select className="h-9 w-full rounded-md border bg-background px-3 text-xs outline-none transition-shadow focus:ring-2 focus:ring-primary/20">
              <option>Overview</option>
              <option>Sentiment Analysis</option>
              <option>Engagement</option>
              <option>Topics</option>
              <option>Public Feedback</option>
            </select>
          </div>

          {/* Facebook page */}
          <div className="min-w-0 flex-1">
            <label className="mb-1.5 block text-xs font-medium">
              Facebook Page
            </label>

            <select className="h-9 w-full rounded-md border bg-background px-3 text-xs outline-none transition-shadow focus:ring-2 focus:ring-primary/20">
              <option>Adama City Administration</option>
            </select>
          </div>

          {/* Date */}
          <div className="min-w-0 flex-1">
            <label className="mb-1.5 block text-xs font-medium">
              Date range
            </label>

            <button
              type="button"
              className="flex h-9 w-full items-center gap-2 rounded-md border bg-background px-3 text-xs text-muted-foreground transition-colors hover:bg-muted"
            >
              <CalendarDays className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">
                Sep 1 – Sep 17, 2026
              </span>
            </button>
          </div>

          {/* Format */}
          <div className="w-full lg:w-36">
            <label className="mb-1.5 block text-xs font-medium">
              Format
            </label>

            <div className="flex h-9 rounded-md border bg-background p-1">
              <button
                type="button"
                className="flex flex-1 items-center justify-center gap-1.5 rounded bg-muted text-[11px] font-medium"
              >
                <FileText className="h-3 w-3" />
                PDF
              </button>

              <button
                type="button"
                className="flex flex-1 items-center justify-center gap-1.5 rounded text-[11px] text-muted-foreground transition-colors hover:bg-muted"
              >
                <FileSpreadsheet className="h-3 w-3" />
                Excel
              </button>
            </div>
          </div>

          {/* Generate */}
          <button
            type="button"
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-4 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 lg:w-auto"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Generate
          </button>
        </div>
      </section>

      {/* =====================================================
          Reports
      ===================================================== */}
      <section className="overflow-hidden rounded-lg border bg-card">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold">
              Recent reports
            </h2>

            <p className="mt-0.5 text-xs text-muted-foreground">
              Your recently generated reports.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative min-w-0 flex-1 sm:flex-none">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search reports..."
                className="h-8 w-full rounded-md border bg-background pl-8 pr-3 text-xs outline-none placeholder:text-muted-foreground transition-shadow focus:ring-2 focus:ring-primary/20 sm:w-52"
              />
            </div>

            {/* Format filter */}
            <select
              value={format}
              onChange={(event) =>
                setFormat(
                  event.target.value as "all" | ReportFormat,
                )
              }
              className="h-8 rounded-md border bg-background px-2.5 text-xs outline-none transition-shadow focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All</option>
              <option value="PDF">PDF</option>
              <option value="Excel">Excel</option>
            </select>
          </div>
        </div>

        {/* Table header */}
        <div className="hidden grid-cols-[minmax(260px,1.8fr)_minmax(140px,1fr)_100px_100px_80px] gap-3 border-b bg-muted/20 px-4 py-2.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground md:grid">
          <span>Report</span>
          <span>Page & period</span>
          <span>Status</span>
          <span>Created</span>
          <span />
        </div>

        {/* Reports */}
        {filteredReports.length > 0 ? (
          <div className="divide-y">
            {filteredReports.map((report) => (
              <ReportRow
                key={report.id}
                report={report}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="flex min-h-60 flex-col items-center justify-center px-6 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <FileBarChart className="h-5 w-5" />
            </div>

            <h3 className="mt-3 text-sm font-semibold">
              No reports found
            </h3>

            <p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">
              No reports match your current search or filter.
            </p>
          </div>
        )}

        {/* Footer */}
        {filteredReports.length > 0 && (
          <div className="border-t px-4 py-2.5">
            <p className="text-[11px] text-muted-foreground">
              Showing {filteredReports.length} of {reports.length} reports
            </p>
          </div>
        )}
      </section>
    </div>
  );
}