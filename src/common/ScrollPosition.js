export const saveScrollPosition = (key) => {
    const content = document.querySelector(".content");
    const scrollValue = content?.scrollTop || 0;
    // console.log(key, "save scroll", scrollValue);
    sessionStorage.setItem(key, scrollValue);
};

export const restoreScrollPosition = (key) => {
    const savedScroll = sessionStorage.getItem(key);
    const content = document.querySelector(".content");

    if (savedScroll && content) {
        setTimeout(() => {
            content.scrollTop = Number(savedScroll);
            
            // restore pachi clear
            sessionStorage.removeItem(key);

        }, 500);
    }
};