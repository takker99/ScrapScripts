import $ from 'jquery';
import { installed as _installed, detectProject as _detectProject } from './manage';
const installed = _installed;
const detectProject = _detectProject;

export function enable () {
    const $appRoot = $('#app-container');

    $appRoot.on('click', 'img.icon', e => {
        if (!installed('daiiz-icon-button')) return;
        const projectName = detectProject();

        const $t = $(e.target).closest('img.icon');
        const src = $t.attr('src');
        const iconProject = src.split('/api/pages/')[1].split('/')[0];
        if (iconProject !== projectName) return;

    // 自分のプロジェクトの管理下のscriptだけ実行できる
        const iconName = $t.attr('title').match(/[^\s/]+-button$/g);
        if (iconName) {
            const scriptFilePath = `${location.origin}/api/code/${projectName}/${iconName[0]}/button.js`;
      // cf.https://qiita.com/uhyo/items/91649e260165b35fecd7#fetch%E3%81%AE%E5%9F%BA%E6%9C%AC%E3%83%AA%E3%82%AF%E3%82%A8%E3%82%B9%E3%83%88%E3%81%AE%E7%99%BA%E8%A1%8C%E3%81%A8%E7%B5%90%E6%9E%9C%E3%81%AE%E5%8F%96%E5%BE%97
            fetch(scriptFilePath, { method: 'GET' })
        // eslint-disable-next-line no-eval
        .then(response => eval(response));

            return false;
        }
    });
}
