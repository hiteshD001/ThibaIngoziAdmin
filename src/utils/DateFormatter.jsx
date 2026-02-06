// utils/dateFormatter.js
export const formatDate = (isoString) => {
    if (!isoString) return "-";

    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
        month: 'short',   // Jan, Feb, etc.
        day: '2-digit',   // 01, 15, etc.
        year: 'numeric',  // 2024
    });
};

export function formatSmartDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();

    const isSameDay = (d1, d2) =>
        d1.getDate() === d2.getDate() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getFullYear() === d2.getFullYear();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    const time = date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });

    if (isSameDay(date, now)) {
        return `Today, ${time}`;
    }

    if (isSameDay(date, yesterday)) {
        return `Yesterday, ${time}`;
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}, ${time}`;
}

export function timeAgo(dateString) {
    const date = new Date(dateString);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (seconds < 10) return "Just now";

    const intervals = [
        { label: "year", seconds: 31536000 },
        { label: "month", seconds: 2592000 },
        { label: "day", seconds: 86400 },
        { label: "hour", seconds: 3600 },
        { label: "minute", seconds: 60 },
    ];

    for (const interval of intervals) {
        const count = Math.floor(seconds / interval.seconds);
        if (count >= 1) {
            return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
        }
    }

    return "Just now";
}
