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
