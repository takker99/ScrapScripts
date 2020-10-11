document.getElementById('btn-main-project').addEventListener(
    'click',
    () => {
        const p = document.getElementById('main-project').nodeValue;
        if (p && p.length > 0) localStorage['main-project'] = p;
    },
    false
);
