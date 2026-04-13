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
