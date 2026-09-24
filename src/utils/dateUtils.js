// Safely converts a date value to an ISO string.
// Returns '' for empty or invalid values (e.g. when "All" is selected in the date range picker).
export const toISO = (d) => {
    if (!d) return '';
    const date = d instanceof Date ? d : new Date(d);
    return isNaN(date.getTime()) ? '' : date.toISOString();
};
