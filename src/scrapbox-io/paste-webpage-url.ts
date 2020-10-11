import {isChrome, isFirefox} from '../browser';
import {installed} from './manage';
import {browser} from 'webextension-polyfill-ts';

const keys = {
    ctrl: 17,
    alt: 18,
    v: 86,
};

const execPasteChrome = () => {
    // background scriptに処理を依頼する

    browser.runtime.sendMessage(
        {
            command: 'get-clipboard-page',
        }
    ).then(text => {
        if (!text) return;
        insertTextToScrapboxCursor(text);
    }
    );
};

const execPasteFirefox = async () => {
    // background scriptに処理を依頼できない
    // 拡張機能用のtextareaを生成してbody末尾に挿入
    let textarea = document.getElementById('daiiz-ctrlv');
    if (!textarea) {
        textarea = document.createElement('textarea');
        textarea.setAttribute('id', 'daiiz-ctrlv');
        document.body.appendChild(textarea);
    }

    // clipboardが保持する内容を流し込んで値を取得
    let rawText;
    const onPaste = (event: {
        clipboardData: {getData: (arg0: string) => any};
    }) => {
        rawText = event.clipboardData.getData('text/plain');
    };
    textarea.textContent = '';
    /* textarea.value = ''; */
    textarea.focus();
    document.addEventListener('paste', onPaste, false);
    document.execCommand('paste');
    document.removeEventListener('paste', onPaste, false);
    textarea.remove();
    // fetch APIの実行してtextを解決する処理はbackground scriptに依頼する
    browser.runtime.sendMessage(
        {
            command: 'fetch-page-title',
            rawText,
        },
        (text: any) => {
            if (!text) return;
            insertTextToScrapboxCursor(text);
        }
    );
};

const insertTextToScrapboxCursor = (text: string) => {
    // Scrapboxで入力を待ち受けているtextarea要素
    const textInput = document.getElementById('text-input') as HTMLTextAreaElement | null;
    if (!textInput) return;
    if (isChrome()) {
        textInput.focus();
        document.execCommand('insertText', false, text);
    } else {
        // Firefoxでは document.execCommand('insertText') が使えない
        // 代わりに自前で生成したUIEventを発行すればいい
        // https://www.everythingfrontend.com/posts/insert-text-into-textarea-at-cursor-position.html
        const start = textInput.selectionStart; // in this case maybe 0
        textInput.setRangeText(text);
        textInput.selectionStart = start + text.length;
        textInput.selectionEnd = start + text.length;
        const uiEvent = document.createEvent('UIEvent');
        uiEvent.initEvent('input', true, false);
        textInput.dispatchEvent(uiEvent);
    }
};

export function enable(): void {
    let c = 0;

    window.addEventListener('keydown', (event) => {
        const key = installed('daiiz-paste-url-title');
        if (!key) return;
        if (event.keyCode === keys[key]) c = 1;
    });

    window.addEventListener('keydown', (event) => {
        if (!installed('daiiz-paste-url-title')) return;
        const {keyCode} = event;
        if (keyCode !== keys.v || c !== 1) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();

        if (isChrome()) {
            execPasteChrome();
        } else if (isFirefox()) {
            execPasteFirefox();
        }
    });

    window.addEventListener('keyup', () => {
        c = 0;
    });

    browser.runtime.onMessage.addListener(
        (request, _sender) => {
            const {command, externalLink} = request;

            if (command === 're:get-clipboard-page') {
                insertTextToScrapboxCursor(externalLink);
            }
        }
    );
}
