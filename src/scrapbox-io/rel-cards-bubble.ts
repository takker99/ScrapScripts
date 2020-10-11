import { installed } from './manage';
import $ from 'jquery';

export function enable(): void {
    const $appRoot = $('#app-container');
    /* 関連カード */
    let timer: number | undefined = undefined;
    $appRoot.on('mouseenter', 'a.page-link', (e) => {
            const $relationLabels = $('li.relation-label');
            const pos = installed('daiiz-rel-bubble');
            if (pos === false)
                return;
            if ($relationLabels.length === 0)
                return;

            const relLabelHeight = 120; // +($relationLabels.css('height').split('px')[0])
            const $a = $(e.target).closest('a.page-link');
            if ($a.hasClass('empty-page-link'))
                return;
            if (!$a.attr('rel') && $a.attr('rel') !== 'route')
                return;
            const $bubble = $getRelCardBubble($appRoot);
            const rect = $a[0].getBoundingClientRect();

            const pad = 10; // main.cssでの設定値
            let top = rect.top + window.pageYOffset - relLabelHeight - pad * 2 - 29; // 'n'
            if (pos === 's') {
                top = rect.top + window.pageYOffset + $a[0].offsetHeight - 22;
            }

            $bubble.css({
                'max-width': $('.editor')[0].offsetWidth - $a[0].offsetLeft,
                left: rect.left + window.pageXOffset,
                top: 18 + top,
                'background-color': $('body').css('background-color'),
            });
            const tag = $a[0].innerText.replace(/^#/gi, '').split('#')[0];
            if (tag.startsWith('/')) {
                $bubble.hide();
                return;
            }
            const $cards = $getRelCards(tag);
            if ($cards.children().length === 0) {
                $bubble.hide();
                return;
            }
            $bubble.find('.daiiz-cards').remove();
            $bubble.append($cards);
            $bubble.css({
                height: relLabelHeight,
            });

            timer = window.setTimeout(function () {
                $bubble.show();
            }, 650);
        });

    $appRoo.on('mouseleave', 'a.page-link', () => {
        window.clearTimeout(timer);
    });

    $appRoot.on('mouseleave', '#daiiz-rel-cards-bubble', () => {
        const $bubble = $getRelCardBubble($appRoot);
        window.clearTimeout(timer);
        $bubble.hide();
    });

    $appRoot.on('click', () => {
            const $bubble = $getRelCardBubble($appRoot);
            window.clearTimeout(timer);
            $bubble.hide();
        });
}

/* 関連カード */
const $getRelCardBubble = ($appRoot: JQuery<HTMLElement>) => {
    let $relCardsBubble = $('#daiiz-rel-cards-bubble');
    if ($relCardsBubble.length === 0) {
        $relCardsBubble = $(
            '<div id="daiiz-rel-cards-bubble" class="related-page-list daiiz-card-root"></div>'
        );
        $appRoot.find('.page').append($relCardsBubble);
    }
    return $relCardsBubble;
};

/* 関連カード */
const $getRelCards = (title: string) => {
    const project = encodeURIComponent(
        window.location.href.match(/scrapbox.io\/([^\/.]*)/)[1]
    );
    const $fillUpIcon = function ($clonedLi: JQuery<HTMLElement>) {
        if ($clonedLi.find('img.lazy-load-img').length === 0) {
            const cardTitle = encodeURIComponent(
                $clonedLi.find('div.title').text()
            );
            $clonedLi.find('div.icon').append(
                `<img src="https://scrapbox.io/api/pages/${project}/${cardTitle}/icon"
        class="lazy-load-img">`
            );
        }
        return $clonedLi;
    };

    $('.daiiz-cards').remove();
    const relationLabels = $('.relation-label');
    const $cards = $('<div class="daiiz-cards grid"></div>');
    for (let i = 0; i < relationLabels.length; i++) {
        const $label = $(relationLabels[i]);
        const label = $label.find('.title')[0].innerText;
        if (label === title) {
            // TODO: 書き直したい
            let $li = $label.next('li.page-list-item');
            let $clonedLi = $li.clone(true);
            $cards.append($fillUpIcon($clonedLi));
            $clonedLi.css({
                width: 120,
                height: 120,
            });
            let c = 0;
            while ($li.length === 1 && c < 200) {
                $li = $li.next('li.page-list-item');
                $clonedLi = $li.clone(true);
                $clonedLi.css({
                    width: 120,
                    height: 120,
                });
                $cards.append($fillUpIcon($clonedLi));
                c++;
            }
        }
    }
    return $cards;
};
