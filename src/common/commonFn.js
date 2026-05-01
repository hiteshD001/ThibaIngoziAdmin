import moment from "moment";

export  const getImageLink = (name) => {
        if (!name) return undefined;
        return `https://gaurdianlink.blob.core.windows.net/gaurdianlink/${name}`;
}

export const formatDateTime = (date, format, oldFormat = '') => {
    if (!date) return undefined;
    const CheckDate = moment(date, moment.ISO_8601, true);
    if (!CheckDate.isValid()) {
        return '-';
    }
    if (oldFormat) {
        return moment(date, oldFormat).format(format);
    }
    return moment(date).format(format);
}

export const calculteTime = (startTime, endTime) => {
    let result = "-";
    if (!startTime || !endTime) return result;
    
    const start = moment(startTime, moment.ISO_8601, true);
    const end = moment(endTime, moment.ISO_8601, true);
    
    if (!start.isValid() || !end.isValid()) {
        return result;
    }

    const duration = moment.duration(end.diff(start));

    const days = duration.days();
    const hours = duration.hours();
    const minutes = duration.minutes();
    const seconds = duration.seconds();

     const parts = [];

    if (days) parts.push(`${days}d`);
    if (hours) parts.push(`${hours}h`);
    if (minutes) parts.push(`${minutes}m`);
    if (seconds) parts.push(`${seconds}s`);

    result = parts.length ? parts.join(" ") : "0s";

    return result;
};
