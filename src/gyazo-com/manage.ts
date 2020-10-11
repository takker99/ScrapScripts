import {browser} from 'webextension-polyfill-ts';
// Gyazo
let ROOT_PROJECT_NAME: string | undefined = undefined;
const DAIIZ_GYAZO_TEXT_BUBBLE = 'daiiz-gyazo-text-bubble';

export function detectProject() {
    return ROOT_PROJECT_NAME;
}

export function install() {
    return new Promise((resolve) => {
        browser.runtime.sendMessage(
            {
                command: 'get-project-name',
                func_names: ['daiiz-gyazo-text-bubble'],
            })
        .then(
            (projectNames) => {
                console.info('ScrapScripts', projectNames);
                if (projectNames[DAIIZ_GYAZO_TEXT_BUBBLE]) {
                    ROOT_PROJECT_NAME = projectNames[DAIIZ_GYAZO_TEXT_BUBBLE];
                    // daiizGyazoTextBubbleMain($appRoot, ROOT_PROJECT_NAME)
                    resolve(ROOT_PROJECT_NAME);
                }
            }
        );
    });
}
