import { LinkNode } from '@progfay/scrapbox-parser'

export function convertLink(linkNode: LinkNode) {
    switch (linkNode.pathType) {
        case 'root':
        case 'relative':
            return convertInternalLink(linkNode);
        case 'absolute':
            return convertExternalLink(linkNode);
    }
}

function convertInternalLink(linkNode: LinkNode) {
    const a = document.createElement('a');
    a.classList.add('page-link');
    a.href = linkNode.href;
    a.textContent = linkNode.href;

    return a;
}

function convertExternalLink(linkNode: LinkNode) {
    const a = document.createElement('a');
    a.href = linkNode.href;
    a.rel = 'noopener noreferrer';
    a.target = '_blank';
    a.textContent = linkNode.content ?? linkNode.href;

    return a;
}
