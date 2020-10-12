import {parse} from '@progfay/scrapbox-parser';
import {convertBlock} from './Block';


export function convertSb2Html(text: string, {hasTitle = true} = {}) {
    const blocks = parse(text, {hasTitle: hasTitle});
    return blocks.flatMap(block => convertBlock(block));
}
