// Scrapbox
import $ from 'jquery';
import {browser} from 'webextension-polyfill-ts';
const ESC_KEY_CODE = 27;
const DAIIZ_GYAZO_TEXT_BUBBLE = 'daiiz-gyazo-text-bubble';

export function getCurrentProject() {
    if ( window.location.href.match(/localhost:\d+\/([^\/.]*)/)) return 'takker';
    return window.location.href.replace(/scrapbox\.io\/(.*)\//, '$1');
}

// XXX: 直したい
export function installed(
    functionName:
        | 'daiiz-text-bubble'
        | 'daiiz-rel-bubble'
        | 'daiiz-icon-button'
        | 'daiiz-paste-url-title'
): boolean | string {
    let d = `data-${functionName}`;
    const defaultValue = {
        'daiiz-text-bubble': 's', // South
        'daiiz-rel-bubble': 'n', // North
        'daiiz-icon-button': true,
        'daiiz-paste-url-title': 'ctrl',
    };
    if ($('body').attr(d)) {
        d = $('body').attr(d);
        if (d === 'off') return false;
        if (d === 'on') {
            return defaultValue[functionName];
        } else if (d.length >= 1) {
            // n, s
            // ctrl
            return d;
        }
    }
    return false;
}

export function detectProject(): string {
    const r =
        window.location.href.match(/scrapbox\.io\/([^\/.]*)/) ||
        window.location.href.match(/localhost:\d+\/([^\/.]*)/);
    if (r && r.length >= 2) return encodeURIComponent(r[1]);
    return 'daiiz';
}

const enableDaiizScript = (pairs: {}) => {
    browser.runtime.sendMessage({
        command: 'enable-daiiz-script',
        func_project_pairs: pairs,
    });
};

export function install(): void {
    const mo = new window.MutationObserver((mutationRecords) => {
        const pairs = {};
        for (const record of mutationRecords) {
            const attr = record.attributeName;
            if (attr.startsWith('data-daiiz-')) {
                const projectName = $('body').attr(attr);
                const funcName = attr.replace(/^data-/, '');
                if (funcName === DAIIZ_GYAZO_TEXT_BUBBLE) {
                    pairs[funcName] = projectName;
                }
            }
        }
        if (Object.keys(pairs).length > 0)
            enableDaiizScript(pairs);
    });
    mo.observe($('body')[0], {
        attributes: true,
    });

    window.document.body.addEventListener('keydown', (e) => {
        if (e.key == 'Esc')
            $('.daiiz-card-root').remove();
    });
}
