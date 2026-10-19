import moment from "moment";

// Single place to show a stored (UTC/ISO) date-time in the viewer's local time zone.
// The display format is unchanged and defaults to the list format used across the app.
// Returns `fallback` for empty or invalid values.
export const toLocalDateTime = (value, format = "HH:mm:ss - DD/MM/YYYY", fallback = "-") => {
    if (!value) return fallback;
    const m = moment(value, moment.ISO_8601);
    return m.isValid() ? m.local().format(format) : fallback;
};

// Safely converts a date value to an ISO string.
// Returns '' for empty or invalid values (e.g. when "All" is selected in the date range picker).
export const toISO = (d) => {
    if (!d) return '';
    const date = d instanceof Date ? d : new Date(d);
    return isNaN(date.getTime()) ? '' : date.toISOString();
};
