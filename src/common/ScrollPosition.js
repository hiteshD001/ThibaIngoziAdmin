export const saveScrollPosition = (key) => {
    const content = document.querySelector(".content");
    const elements = document.querySelectorAll(".MuiTableContainer-root");
    const data = {
        scrollY: content?.scrollTop || 0,
        scrollX: []
    };

    elements.forEach((el) => {
        data.scrollX.push(el.scrollLeft);
    });

    sessionStorage.setItem(key, JSON.stringify(data));
};

export const restoreScrollPosition = (key) => {
    const saved = sessionStorage.getItem(key);

    if (!saved) return;

    const { scrollY, scrollX } = JSON.parse(saved);

    const content = document.querySelector(".content");
    const elements = document.querySelectorAll(".MuiTableContainer-root");

    setTimeout(() => {
        if (content) {
            content.scrollTop = Number(scrollY);
        }
        elements.forEach((el, index) => {
            if (scrollX[index] !== undefined) {
                el.scrollLeft = Number(scrollX[index]);
            }
        });

        sessionStorage.removeItem(key);
    }, 300);
};