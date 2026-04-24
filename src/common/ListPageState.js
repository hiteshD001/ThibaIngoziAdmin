const buildStateKey = (namespace) => `listPageState:${namespace}`;

export const loadListPageState = (namespace, fallbackValue = null) => {
    try {
        const raw = sessionStorage.getItem(buildStateKey(namespace));
        if (!raw) return fallbackValue;
        return JSON.parse(raw);
    } catch (error) {
        console.error("Failed to load list page state:", error);
        return fallbackValue;
    }
};

export const saveListPageState = (namespace, value) => {
    try {
        sessionStorage.setItem(buildStateKey(namespace), JSON.stringify(value));
    } catch (error) {
        console.error("Failed to save list page state:", error);
    }
};

export const clearListPageState = (namespace) => {
    try {
        sessionStorage.removeItem(buildStateKey(namespace));
    } catch (error) {
        console.error("Failed to clear list page state:", error);
    }
};
