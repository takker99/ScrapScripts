import {installed, detectProject} from './manage';
import {convertSb2Html} from '../parser/convertSB2HTML';

let PROJECT_NAME: string | null = null;
let EMPTY_LINKS: string[] = [];

export function getTextBubble() {
    const textBubble = document.createElement('div');
    textBubble.classList.add('daiiz-text-bubble', 'related-page-list', 'daiiz-card', 'daiiz-card-root');
    return textBubble;
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
    fetch(`https://scrapbox.io/api/pages/${PROJECT_NAME}/${title}/text`)
        .then(response => response.text())
        .then(text => {

            if (externalProject) bubble.classList.add('daiiz-external-project');
            bubble.dataset.project = PROJECT_NAME || '';

            const contentFragment = document.createDocumentFragment();
            convertSb2Html(text).forEach(node => contentFragment.appendChild(node));
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
    title = encodeURIComponent(title);

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
                const rect = link.getBoundingClientRect();
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


    appRoot?.on('mouseleave', '.daiiz-card', () => {
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
