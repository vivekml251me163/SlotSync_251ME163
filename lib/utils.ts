import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getStatusConfig(status: string) {
  const map: Record<string, { label: string; className: string }> = {
    PENDING:                  { label: 'Pending',             className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30' },
    APPROVED:                 { label: 'Approved',            className: 'bg-green-500/15 text-green-400 border-green-500/30' },
    REJECTED:                 { label: 'Rejected',            className: 'bg-red-500/15 text-red-400 border-red-500/30' },
    CANCELLED:                { label: 'Cancelled',           className: 'bg-slate-500/15 text-slate-400 border-slate-500/30' },
    CANCELLATION_REQUESTED:   { label: 'Cancel Requested',    className: 'bg-orange-500/15 text-orange-400 border-orange-500/30' },
    COMPLETED:                { label: 'Completed',           className: 'bg-sky-500/15 text-sky-400 border-sky-500/30' },
    AVAILABLE:                { label: 'Available',           className: 'bg-green-500/15 text-green-400 border-green-500/30' },
    UNAVAILABLE:              { label: 'Unavailable',         className: 'bg-red-500/15 text-red-400 border-red-500/30' },
    UNDER_MAINTENANCE:        { label: 'Maintenance',         className: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
  };
  return map[status] ?? { label: status, className: 'bg-slate-500/15 text-slate-400' };
}

export function formatDate(iso: string | Date): string {
  try {
    const d = typeof iso === "string" ? new Date(iso) : iso;
    if (isNaN(d.getTime())) return String(iso);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    });
  } catch {
    return String(iso);
  }
}

export function formatTime(iso: string | Date): string {
  try {
    let d = typeof iso === "string" ? new Date(iso) : iso;
    if (isNaN(d.getTime()) && typeof iso === "string") {
      const trimmed = iso.trim();
      if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(trimmed)) {
        const parts = trimmed.split(":");
        const hh = parts[0].padStart(2, "0");
        const mm = parts[1];
        d = new Date(`2000-01-01T${hh}:${mm}:00+05:30`);
      }
    }
    if (isNaN(d.getTime())) return String(iso);
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  } catch {
    return String(iso);
  }
}

export function getISTDateString(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;
  return `${year}-${month}-${day}`;
}

export function getISTTimeHHMM(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const hour = parts.find((p) => p.type === "hour")?.value.padStart(2, "0") || "00";
  const minute = parts.find((p) => p.type === "minute")?.value.padStart(2, "0") || "00";
  return `${hour}:${minute}`;
}

export function relativeTime(iso: string | Date): string {
  try {
    const date = new Date(iso);
    const now = new Date();
    const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);

    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

    const absSec = Math.abs(diffInSeconds);
    if (absSec < 60) return "just now";
    if (absSec < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return rtf.format(minutes, "minute");
    }
    if (absSec < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return rtf.format(hours, "hour");
    }
    const days = Math.floor(diffInSeconds / 86400);
    return rtf.format(days, "day");
  } catch {
    return String(iso);
  }
}


