import {installed, detectProject} from './manage';
import * as Parser from '@progfay/scrapbox-parser';

const BRACKET_OPEN = '[';
const DOUBLE_BRACKET_OPEN = '[[';
const BRACKET_CLOSE = ']';
const DOUBLE_BRACKET_CLOSE = ']]';
const INLINE_CODE = '`';
let openInlineCode = false;
let openCodeBlock = false;

let PROJECT_NAME: string | null = null;
let EMPTY_LINKS: string[] = [];

export function getTextBubble() {
    const textBubble = document.createElement('div');
    textBubble.classList.add('daiiz-text-bubble', 'related-page-list', 'daiiz-card', 'daiiz-card-root');
    return textBubble;
}

const decorate = (str: string, strOpenMark: string, _depth: any) => {
    let tagOpen: string[] = [];
    let tagClose: string[] = [];
    let body = '';
    if (strOpenMark === BRACKET_OPEN) {
        // リンク，装飾
        body = str.replace(/^\[/, '').replace(/\]$/, '');
        const words = body.split(' ');
        if (words.length >= 2) {
            const pair = makePair(words);
            const p0 = pair[0];
            const p1 = pair[1];
            if (p0.startsWith('http')) {
                // リンク(別名記法)
                body = p1;
                const href = p0;
                tagOpen.push(
                    `<a href="${encodeHref(
                        href,
                        true
                    )}" class="daiiz-ref-link" target="_blank">`
                );
                tagClose.push('</a>');
                const {img, isImg} = makeImageTag(body);
                if (isImg) {
                    body = img;
                } else {
                    body = spans(p1);
                }
            } else {
                let f = true;
                body = p1;

                // 太字, 斜体, 打ち消し
                const o = !p0.match(/[^\-\*\/_]/gi);
                if (o && p0.indexOf('*') >= 0) {
                    tagOpen.push('<b>');
                    tagClose.push('</b>');
                    f = false;
                }
                if (o && p0.indexOf('/') >= 0) {
                    tagOpen.push('<i>');
                    tagClose.push('</i>');
                    f = false;
                }
                if (o && p0.indexOf('-') >= 0) {
                    tagOpen.push('<s>');
                    tagClose.push('</s>');
                    f = false;
                }
                if (o && p0.indexOf('_') >= 0) {
                    tagOpen.push('<span class="daiz-underline">');
                    tagClose.push('</span>');
                    f = false;
                }

                if (f) {
                    // 半角空白を含むタイトルのページ
                    body = words.join(' ');
                    const href =
                        body[0] === '/' ? body : `/${PROJECT_NAME}/${body}`;
                    const target =
                        PROJECT_NAME !== detectProject() ? '_blank' : '_self';
                    let classEmptyLink = '';
                    if (EMPTY_LINKS.indexOf(body) !== -1)
                        classEmptyLink = 'empty-page-link';
                    body = spans(body);
                    tagOpen.push(`<a href="${encodeHref(
                        getScrapboxUrl(href),
                        false
                    )}"
            class="page-link ${classEmptyLink}" target="${target}">`);
                    tagClose.push('</a>');
                }
            }
            const {img, isImg} = makeImageTag(body);
            if (isImg) body = img;
        } else {
            // [ ] 内に空白を含まない
            if (body.length === 0) {
                body = '[]';
            } else {
                // リンク, 画像
                const pageLink = makePageLink(body);
                tagOpen = pageLink.tagOpen;
                tagClose = pageLink.tagClose;
                body = pageLink.body;
            }
        }
    } else if (strOpenMark === DOUBLE_BRACKET_OPEN) {
        body = str.replace(/^\[\[/, '').replace(/\]\]$/, '');
        tagOpen.push('<b>');
        tagClose.push('</b>');
        const {img, isImg} = makeImageTag(body);
        if (isImg) body = img;
    } else if (strOpenMark === INLINE_CODE) {
        const code = str.replace(/^`/, '').replace(/`$/, '');
        body = `<span class="daiiz-backquote">${spans(code)}</span>`;
    }

    return `${tagOpen.join('')}${body}${tagClose.reverse().join('')}`;
};

const spans = (txt: string): string => {
    return txt.split('')
        .map(char => `<span>${char}</span>`)
        .reduce((body, span) => `${body}${span}`);
};

const getScrapboxUrl = (url: string): string => `https://scrapbox.io${url}`;

const makePageLink = (
    body: string,
) => {
    const link: {tagOpen: string[]; tagClose: string[]; body: string;} = {tagOpen: [], tagClose: [], body: ''};

    let href = getScrapboxUrl(`/${PROJECT_NAME}/${body}`);
    let startsWithHttp = false;
    if (body[0] === '/') {
        href = getScrapboxUrl(body);
    } else if (body.startsWith('http')) {
        href = body;
        startsWithHttp = true;
    }

    let className = 'page-link';
    let target = PROJECT_NAME !== detectProject() ? '_blank' : '_self';
    if (body.startsWith('http')) {
        className = 'daiiz-ref-link';
        target = '_blank';
    }
    const {img, isImg} = makeImageTag(body);
    if (isImg) {
        link.body = img;
    } else {
        if (EMPTY_LINKS.indexOf(body) !== -1) className += ' empty-page-link';
        link.body = spans(body);
        link.tagOpen.push(
            `<a href="${encodeHref(
                href,
                startsWithHttp
            )}" class="${className}" target="${target}">`
        );
        link.tagClose.push('</a>');
    }
    return link;
};

const makePair = (words: string[]) => {
    const w0 = words[0];
    const wL = words[words.length - 1];
    const pair = [];
    if (wL.startsWith('http')) {
        pair.push(wL);
        pair.push(words.slice(0, words.length - 1).join(' '));
    } else {
        pair.push(w0);
        pair.push(words.slice(1, words.length).join(' '));
    }

    if (pair[0].startsWith('http') && pair[1].startsWith('http')) {
        const a =
            pair[0].endsWith('.jpg') ||
            pair[0].endsWith('.png') ||
            pair[0].endsWith('.gif');
        const b =
            pair[0].match(/^https{0,1}:\/\/gyazo.com\/.{24,32}$/) !== null;
        if (a || b) {
            pair.reverse();
        }
    }
    return pair;
};

const encodeHref = (url: string, startsWithHttp: boolean) => {
    const tt = url.match(/scrapbox\.io\/([^\/]+)\/(.+)/);
    if (startsWithHttp || tt === null) {
        url = url
            .replace(/</gi, '%3C')
            .replace(/>/gi, '%3E')
            .replace(/;/gi, '%3B');
        return url;
    }
    if (tt !== null) {
        let pageName = tt[2];
        const pageRowNum = pageName.match(/#.{24,32}$/);
        if (pageRowNum) {
            // 行リンク
            const n = pageRowNum[0];
            pageName = encodeURIComponent(pageName.split(n)[0]) + n;
        } else {
            pageName = encodeURIComponent(pageName);
        }
        return url.replace(tt[2], pageName);
    }
};

// 画像になる可能性があるものに対処
const makeImageTag = (keyword: string) => {
    keyword = keyword.trim();
    let img = '';
    let isImg = true;
    if (keyword.match(/\.icon\**\d*$/gi)) {
        let iconName = keyword.split('.icon')[0];
        if (iconName.charAt(0) !== '/') {
            iconName = '/' + PROJECT_NAME + '/' + iconName;
        }
        const toks = keyword.split('*');
        let times = 1;
        if (toks.length === 2) times = +toks[1];
        for (let i = 0; i < times; i++) {
            img += `<img class="daiiz-tiny-icon" src="https://scrapbox.io/api/pages${iconName}/icon">`;
        }
    } else if (
        keyword.endsWith('.jpg') ||
        keyword.endsWith('.png') ||
        keyword.endsWith('.gif')
    ) {
        img = `<img class="daiiz-small-img" src="${keyword}">`;
    } else if (keyword.match(/^https{0,1}:\/\/gyazo.com\/.{24,32}$/)) {
        img = `<img class="daiiz-small-img" src="${keyword}/raw">`;
    } else {
        img = keyword;
        isImg = false;
    }
    return {img, isImg};
};

/** Scrapboxの行単位での記法解析 */
let dicts: {[x: string]: any}[] = [];
const parse = (
    fullStr: string,
    startIdx: number,
    depth: number,
    seekEnd: string | null
) => {
    fullStr = fullStr.trim();
    const l = fullStr.length;
    const startIdxkeep = startIdx;
    while (startIdx < l) {
        const subStr = fullStr.substring(startIdx, l);

        if (subStr.startsWith(DOUBLE_BRACKET_OPEN) && !openInlineCode) {
            const token = parse(
                fullStr,
                startIdx + DOUBLE_BRACKET_OPEN.length,
                depth + 1,
                DOUBLE_BRACKET_CLOSE
            );
            const str = `${DOUBLE_BRACKET_OPEN}${fullStr.substring(
                token[0],
                token[1]
            )}${DOUBLE_BRACKET_CLOSE}`;
            const res = decorate(str, DOUBLE_BRACKET_OPEN, depth);
            const trans = {};
            trans[str] = res;
            dicts.push(trans);
            startIdx = token[1];
        } else if (subStr.startsWith(BRACKET_OPEN) && !openInlineCode) {
            var token = parse(
                fullStr,
                startIdx + BRACKET_OPEN.length,
                depth + 1,
                BRACKET_CLOSE
            );
            var str =
                BRACKET_OPEN +
                fullStr.substring(token[0], token[1]) +
                BRACKET_CLOSE;
            var res = decorate(str, BRACKET_OPEN, depth);
            var trans = {};
            trans[str] = res;
            dicts.push(trans);
            startIdx = token[1];
        } else if (subStr.startsWith(INLINE_CODE) && !openInlineCode) {
            openInlineCode = true;
            // このマークは入れ子構造をとり得ないことに注意
            var token = parse(
                fullStr,
                startIdx + INLINE_CODE.length,
                depth + 1,
                INLINE_CODE
            );
            var str =
                INLINE_CODE +
                fullStr.substring(token[0], token[1]) +
                INLINE_CODE;
            var res = decorate(str, INLINE_CODE, depth);
            var trans = {};
            trans[str] = res;
            dicts.push(trans);
            startIdx = token[1];
        }

        // 探していた閉じマークが見つかった
        if (subStr.startsWith(seekEnd)) {
            if (seekEnd === INLINE_CODE) openInlineCode = false;
            return [startIdxkeep, startIdx];
        }

        startIdx++;
    }

    // 置換する順番に格納されている
    // HTML文字列を作成する
    dicts.push(fullStr);
    dicts.reverse();
    let html = fullStr;
    for (let i = 1; i < dicts.length; i++) {
        const key = Object.keys(dicts[i])[0];
        html = html.replace(key, dicts[i][key]);
    }
    return html;
};

/* ======================== */
/*  Main: 行単位の記法解析  */
/* ======================== */
const parseRow = function (row: string) {
    if (row.length === 0) return null;
    const t0 = row.charAt(0);
    row = row.trim();
    // コードブロックを無視する処理
    if (row.startsWith('code:')) {
        openCodeBlock = true;
        return null;
    }
    if (openCodeBlock) {
        if (t0 == ' ' || t0 == '\t') {
            return null;
        } else {
            openCodeBlock = false;
        }
    }

    // シェル記法の対応
    if (row.charAt(0) === '$') return makeShellStr(row);
    // 括弧を用いる記法の解析
    dicts = [];
    let res = parse(row, 0, 0, null);
    // プレーンテキストに埋め込まれたリンクに対応する
    res = makePlainLinks(res);
    // ハッシュタグをリンク化する
    res = makeHashTagLinks(res);

    // scriptタグを無効化
    let html = '';
    for (let j = 0; j < res.length; j++) {
        const c = res.charAt(j);
        if (c === '<' && res.substring(j + 1, res.length).startsWith('script'))
            html += spans('<');
        else if (
            c === '<' &&
            res.substring(j + 1, res.length).startsWith('/script')
        )
            html += spans('<');
        else if (c === ';') html += spans(';');
        else html += c;
    }
    return html;
};

var makeHashTagLinks = function (row: string) {
    row = ' ' + row + ' ';
    const hashTags = row.match(/(^| )\#[^ ]+/gi);
    if (hashTags) {
        for (let i = 0; i < hashTags.length; i++) {
            const hashTag = hashTags[i].trim();
            const keyword = encodeURIComponent(
                hashTag.substring(1, hashTag.length)
            );
            const target =
                PROJECT_NAME !== detectProject() ? '_blank' : '_self';
            const a = ` <a href="/${PROJECT_NAME}/${keyword}" class="page-link"
        target="${target}">${spans(hashTag)}</a> `;
            row = row.replace(` ${hashTag} `, a);
        }
    }
    return row.substring(1, row.length - 1);
};

var makePlainLinks = function (row: string) {
    row = ' ' + row + ' ';
    const words = row.split(' ');
    const res = [];
    for (let k = 0; k < words.length; k++) {
        const word = words[k].trim();
        if (word.startsWith('http')) {
            const a = ` <a href=${encodeHref(
                word,
                true
            )} class="daiiz-ref-link" target="_blank">${word}</a> `;
            row = row.replace(` ${word} `, a);
        }
    }
    return row.substring(1, row.length - 1);
};

var makeShellStr = function (row: any) {
    return `<span class="daiiz-backquote">${spans(row)}</span>`;
};

//scrapbox記法をpreview用htmlに変換する
function convertSb2Html(page: Parser.Page) {
    return page.filter(line => line.type !== 'title' && line.type !== 'codeBlock')
        .flatMap(line => convertSbNodes2Html((line as Parser.Line).nodes))
}
function parseTable(table: Parser.Table): string[] {
    return [table.fileName, ...table.cells.map(row => row.map(col =>
        // リンク以外の記法を無視して一つの文にする
        col.map(node => {
            switch (node.type) {
                case 'link':
                    const link = document.createElement('a');
                    link.href = node.href;
                    link.classList.add('page-link');
                    link.text = node.content;
                    return link;
                case 'hashTag':
                    const hashTag = document.createElement('a');
                    hashTag.href = node.href;
                    hashTag.classList.add('page-link');
                    return hashTag;
                case 'code':
                case 'commandLine':
                case 'helpfeel':
                case 'plain':
                    return document.createTextNode(node.text);
                case 'formula':
                    return document.createTextNode(node.formula);
                case 'icon':
                case 'strongIcon':
                case 'image':
                case 'strongImage':
                case 'blank':
                case 'quote':
                case 'googleMap':
                case 'decoration':
                case 'strong':
                    return document.createTextNode('');
            }
        });
}
function convertSbNodes2Html(nodes: Parser.Node[]) {
    return nodes.map(node => {
        switch (node.type) {
            case 'link':
                const link = document.createElement('a');
                link.href = node.href;
                link.classList.add('page-link');
                link.text = node.content;
                return link;
            case 'code':
                const inlineCode = document.createElement('code');
                inlineCode.classList.add('code');
                inlineCode.textContent = node.text;
                return inlineCode;
            case 'hashTag':
                const hashTag = document.createElement('a');
                hashTag.href = node.href;
                hashTag.classList.add('page-link');
                return hashTag;
            case 'icon':
                const icon = document.createElement('img');
                icon.classList.add('daiiz-tiny-icon');
                icon.src = node.path;
                return icon;
            case 'commandLine':
                const commandLine = document.createElement('code');
                commandLine.classList.add('code');
                commandLine.textContent = `${node.symbol} ${node.text}`;
                return commandLine;
            case 'helpfeel':
                const helpfeel = document.createElement('code');
                helpfeel.classList.add('code');
                helpfeel.textContent = `? ${node.text}`;
                return helpfeel;
            case 'blank':
                return document.createElement('br');
            case 'quote':
                const quote = document.createElement('span');
                quote.classList.add('quotes');
                const quoteFragment = document.createDocumentFragment();
                convertSbNodes2Html(node.nodes).forEach(result => quoteFragment.appendChild(result));
                quote.appendChild(quoteFragment);
                return quote;
            case 'image':
                const imageWrapper = document.createElement('a');
                imageWrapper.href = node.link;
                const image = document.createElement('img');
                image.src = node.src;
                image.classList.add('daiiz-small-img');
                imageWrapper.appendChild(image);
                return imageWrapper;
            case 'formula':
                const formula = document.createElement('code');
                formula.textContent = node.formula;
                return formula;
            case 'decoration':
                const deco = document.createElement('span');
                deco.classList.add(...node.decos);
                const decoFragment = document.createDocumentFragment();
                convertSbNodes2Html(node.nodes).forEach(result => decoFragment.appendChild(result));
                deco.appendChild(decoFragment);
                return deco;
            case 'plain':
                return document.createTextNode(node.text);
            case 'strong':
                const strong = document.createElement('strong');
                const strongFragment = document.createDocumentFragment();
                convertSbNodes2Html(node.nodes).forEach(result => strongFragment.appendChild(result));
                strong.appendChild(strongFragment);
                return strong;
            default:
                return document.createTextNode('');
        }
    });
}

/* ================ */
/*  表示コントール  */
/* ================ */
function previewPageText(
    root: HTMLDivElement,
    bubble: HTMLDivElement,
    title: string,
) {
    let externalProject = false;
    if (PROJECT_NAME !== detectProject()) externalProject = true;
    fetch(`https://scrapbox.io/api/pages/${PROJECT_NAME}/${title}`)
        .then(response => response.text())
        .then(text => {
            const pageData = Parser.parse(text);

            if (externalProject) bubble.classList.add('daiiz-external-project');
            bubble.dataset.project = PROJECT_NAME || '';

            const contentFragment = document.createDocumentFragment();
            convertSb2Html(pageData).forEach(node => contentFragment.appendChild(node));
            if (contentFragment.children.length > 0) {
                bubble.classList.add('daiiz-bubble-text');
                bubble.appendChild(contentFragment);
                bubble.style.display = 'block';
                root.appendChild(bubble);
            }
        });
}

export function $getRefTextBody(
    title: string,
    root: HTMLDivElement,
    bubble: HTMLDivElement,
    projectName: string | null
) {
    title = title.replace(/^\#/, '');
    const t = title.match(/\#.{24,32}$/);
    let lineHash = null;
    if (t !== null) {
        title = title.replace(/\#.{24,32}$/, '');
        lineHash = t[0].replace('#', '');
    }

    if (title.startsWith('/')) {
        console.log('...');
        return;
        // 外部プロジェクト名とページ名を抽出
        /* const tt = title.match(/\/([^\/]+)\/(.+)/); */
        /* if (!tt) return; */
        /* projectName = tt[1]; */
        /* title = tt[2]; */
    }
    title = encodeURIComponent(title);
    PROJECT_NAME = projectName;

    previewPageText(root, bubble, title);
}

export function enable(this: any) {
    const appRoot = document.getElementById('app-container');
    const self = this;
    let timer: NodeJS.Timeout | null = null;

    appRoot?.querySelectorAll('a.page-link')
        .forEach(link => {
            link.addEventListener('mouseenter', e => {

                const pos = installed('daiiz-text-bubble');
                if (pos === false) return;

                const parentBubble = link.closest('div.daiiz-text-bubble');
                const root = appRoot.getElementsByClassName('page')?.[0];

                if (link.classList.contains('empty-page-link')) return;

                const $bubble = self.$getTextBubble();
                const rect = $a[0].getBoundingClientRect();
                $bubble.css({
                    'max-width': $('.editor')[0].offsetWidth - $a[0].offsetLeft,
                    left: rect.left + window.pageXOffset,
                    top:
                        18 +
                        rect.top +
                        window.pageYOffset +
                        $a[0].offsetHeight +
                        3 -
                        24,
                    'border-color': $('body').css('background-color'),
                });
                pos = `${$bubble.css('top')}_${$bubble.css('left')}`;
                $bubble.attr('data-pos', pos);

                // すでに表示されているならば，何もしない
                if ($(`.daiiz-text-bubble[data-pos="${pos}"]`).length > 0) return;
                if ($a.attr('rel') && $a.attr('rel') == 'route') {
                    $(`.daiiz-text-bubble:not([data-pos="${pos}"])`).remove();
                }
                const keyword = $a[0].innerText;

                timer = setTimeout(() => {
                    let projectName = detectProject();
                    if ($parentBubble.length > 0)
                        projectName = $parentBubble.attr('data-project');
                    self.$getRefTextBody(keyword.trim(), $root, $bubble, projectName);
                }, 650);
            });

            link.addEventListener('mouseleave', _ => window.clearTimeout(timer));
        });


    $appRoot.on('mouseleave', '.daiiz-card', (_e) => {
        window.clearTimeout(timer);
    });

    appRoot?.addEventListener('click', e => {
        window.clearTimeout(timer);
        const $bubble = $('.daiiz-card');
        const $t = $(e.target).closest('.daiiz-card');
        if ($(e.target)[0].tagName.toLowerCase() === 'a') {
            $bubble.remove();
        } else if ($t.length > 0) {
            $t.remove();
        } else {
            $bubble.remove();
        }
    });
}
