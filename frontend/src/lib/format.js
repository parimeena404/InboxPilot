import { format, formatDistanceToNowStrict, isToday, parseISO } from "date-fns";

export const TINTS = {
    rose: { bg: "#FFE4E6", fg: "#9F1239" },
    amber: { bg: "#FEF3C7", fg: "#92400E" },
    emerald: { bg: "#D1FAE5", fg: "#065F46" },
    sky: { bg: "#E0F2FE", fg: "#075985" },
    violet: { bg: "#EDE9FE", fg: "#5B21B6" },
    slate: { bg: "#E2E8F0", fg: "#334155" },
    teal: { bg: "#CCFBF1", fg: "#115E59" },
    orange: { bg: "#FFEDD5", fg: "#9A3412" },
    cyan: { bg: "#CFFAFE", fg: "#155E75" },
    fuchsia: { bg: "#F5D0FE", fg: "#86198F" },
};

export function initialsOf(name = "") {
    return (
        name
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((p) => p[0].toUpperCase())
            .join("") || "?"
    );
}

export function tintOf(item) {
    return TINTS[item?.tint] || TINTS.slate;
}

export function parseDate(value) {
    if (!value) return null;
    try {
        return typeof value === "string" ? parseISO(value) : value;
    } catch {
        return null;
    }
}

export function timeAgo(value) {
    const d = parseDate(value);
    if (!d) return "";
    return `${formatDistanceToNowStrict(d, { addSuffix: false })} ago`;
}

export function clockTime(value) {
    const d = parseDate(value);
    return d ? format(d, "HH:mm") : "";
}

export function dayTime(value) {
    const d = parseDate(value);
    if (!d) return "";
    if (isToday(d)) return format(d, "HH:mm");
    return format(d, "MMM d, HH:mm");
}

export function fullDate(value) {
    const d = parseDate(value);
    return d ? format(d, "EEE, d MMMM yyyy · HH:mm") : "";
}

export function shortDate(value) {
    const d = parseDate(value);
    return d ? format(d, "d MMM") : "";
}

export function deadlineLabel(item) {
    if (!item?.deadline) return "";
    const d = parseDate(item.deadline);
    if (!d) return item.deadline_label || "";
    const diffDays = Math.ceil((d - new Date()) / 86400000);
    if (item.deadline_label) {
        if (diffDays <= 1) return item.deadline_label;
        return item.deadline_label;
    }
    return diffDays <= 1 ? format(d, "HH:mm") : format(d, "d MMM");
}

export const PRIORITY_META = {
    urgent: { label: "Urgent", color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
    high: { label: "High", color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
    normal: { label: "Normal", color: "#475569", bg: "#F8FAFC", border: "#E2E8F0" },
    low: { label: "Low", color: "#94A3B8", bg: "#F8FAFC", border: "#E2E8F0" },
};

export const RESPONSIBILITY_META = {
    assistant: {
        label: "Assistant to reply",
        short: "Assistant",
        color: "#0F766E",
        bg: "#F0FDFA",
        border: "#99F6E4",
    },
    client: {
        label: "Client to reply",
        short: "You",
        color: "#B45309",
        bg: "#FFFBEB",
        border: "#FDE68A",
    },
    none: {
        label: "No reply needed",
        short: "No reply",
        color: "#64748B",
        bg: "#F8FAFC",
        border: "#E2E8F0",
    },
};

export function greetingFor(date = new Date()) {
    const h = date.getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
}

export function todayLabel(date = new Date()) {
    return format(date, "EEEE, d MMMM yyyy");
}
