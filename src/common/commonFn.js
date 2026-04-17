import moment from "moment";

export  const getImageLink = (name) => {
        if (!name) return undefined;
        return `https://gaurdianlink.blob.core.windows.net/gaurdianlink/${name}`;
}

export const formatDateTime = (date, format, oldFormat = '') => {
    if (!date) return undefined;
    if (oldFormat) {
        return moment(date, oldFormat).format(format);
    }
    return moment(date).format(format);
}

export const calculteTime = (startTime , endTime) => {
    let result = '-'
    if(startTime && endTime){
        const start = moment(startTime, "HH:mm:ss");
        const end = moment(endTime, "HH:mm:ss");
        const duration = moment.duration(end.diff(start));
        result = moment.utc(duration.asMilliseconds()).format("HH:mm:ss");
    }

    return result
};
