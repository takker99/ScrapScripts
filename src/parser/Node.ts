import {
    Node,
    QuoteNode,
    HelpfeelNode,
    StrongImageNode,
    StrongIconNode,
    StrongNode,
    FormulaNode,
    DecorationNode,
    CodeNode,
    CommandLineNode,
    BlankNode,
    ImageNode,
    LinkNode,
    GoogleMapNode,
    IconNode,
    HashTagNode,
    PlainNode,
} from '@progfay/scrapbox-parser'

import {convertLink} from './LinkNode';
import {getCurrentProject} from '../scrapbox-io/manage';

export function convertNode(node: Node) {
    switch (node.type) {
        case 'quote':
            return convertQuote(node);
        case 'helpfeel':
            return convertHelpFeel(node);
        case 'strongImage':
            return convertStrongImage(node);
        case 'strongIcon':
            return convertStringIcon(node);
        case 'strong':
            return convertStrong(node);
        case 'formula':
            return convertFormula(node);
        case 'decoration':
            return convertDecoration(node);
        case 'code':
            return convertCode(node);
        case 'commandLine':
            return convertCommandLine(node);
        case 'blank':
            return convertBlank(node);
        case 'link':
            return convertLink(node);
        case 'image':
            return convertImage(node);
        case 'googleMap':
            return convertGoogleMap(node);
        case 'icon':
            return convertIcon(node);
        case 'hashTag':
            return convertHashTag(node);
        case 'plain':
            return convertPlain(node);
    }
}

function convertQuote(quoteNode: QuoteNode) {
    const quote = document.createElement('blockquote');
    const tag = document.createElement('span');
    tag.classList.add('tag');
    quote.appendChild(tag);
    quote.append(...quoteNode.nodes.map(node => convertNode(node)));
    return quote;
}

function convertHelpFeel(helpfeelNode: HelpfeelNode) {
    const code = document.createElement('code');
    const prefix = document.createElement('span');
    prefix.classList.add('prefix');
    const space = document.createTextNode(' ');
    code.appendChild(prefix);
    code.appendChild(space);
    const entry = document.createElement('span');
    entry.classList.add('entry');
    entry.textContent = helpfeelNode.text;
    code.appendChild(entry);

    return code;
}

function convertStrongImage(strongImageNode:StrongImageNode) {
    const a = document.createElement('a');
    a.href = strongImageNode.src;
    a.rel = 'noopener noreferrer';
    a.target = '_blank';
    const img = document.createElement('img');
    img.src = strongImageNode.src;
    img.classList.add('strong-image');
    a.appendChild(img);

    return a;
}

function convertStringIcon(strongIconNode:StrongIconNode) {
    const a = document.createElement('a');
    a.href = strongIconNode.path;
    a.rel = strongIconNode.pathType;
    a.classList.add('link', 'icon');
    const img = document.createElement('img');
    img.src = `/api/pages${strongIconNode.path}/icon`;
    img.alt = strongIconNode.path.replace(/\/(.*)\/(.*)/, '$2');
    img.title = img.alt;
    img.classList.add('icon', 'strong-icon');
    a.appendChild(img);

    return a;
}

function convertStrong(strongNode: StrongNode) {
    const strong = document.createElement('strong');
    strong.append(...strongNode.nodes.map(node => convertNode(node)));
    return strong;
}

function convertFormula(formulaNode: FormulaNode) {
    const formula = document.createElement('span');
    formula.classList.add('formula');
    formula.textContent = formulaNode.formula;
    return formula;
}

function convertDecoration(decorationNode: DecorationNode) {
    const deco = document.createElement('span');
    deco.classList.add('deco', ...decorationNode.decos.map(deco => `deco-${deco}`));
    deco.append(...decorationNode.nodes.map(node => convertNode(node)));
    return deco;
}

function convertCode(codeNode: CodeNode) {
    const code = document.createElement('code');
    code.classList.add('code');
    code.textContent = codeNode.text;
    return code;
}

function convertCommandLine(commandLineNode: CommandLineNode) {
    const cli = document.createElement('span');
    cli.classList.add('cli');

    const prefix = document.createElement('span');
    prefix.classList.add('prefix');
    prefix.textContent = commandLineNode.symbol;
    const space = document.createTextNode(' ');
    cli.appendChild(prefix);
    cli.appendChild(space);
    const command = document.createElement('span');
    command.classList.add('command');
    command.textContent = commandLineNode.text;
    cli.appendChild(command);

    return cli;
}

function convertBlank(blankNode: BlankNode) {
    const blank = document.createElement('span');
    blank.classList.add('blank');
    blank.textContent = blankNode.text;

    return blank;
}

function convertImage(imageNode:ImageNode) {
    const a = document.createElement('a');
    a.href = imageNode.link ?? imageNode.src;
    if (imageNode.link) a.classList.add('link');
    a.rel = 'noopener noreferrer';
    a.target = '_blank';
    const img = document.createElement('img');
    img.src = imageNode.src;
    img.classList.add('image');
    a.appendChild(img);

    return a;
}

function convertGoogleMap(googleMapNode:GoogleMapNode) {
    const a = document.createElement('a');
    a.href = googleMapNode.url;
    a.rel = 'noopener noreferrer';
    a.target = '_blank';
    a.classList.add('link');
    a.textContent = googleMapNode.place;

    return a;
}

function convertIcon(iconNode:IconNode) {
    const a = document.createElement('a');
    a.href = iconNode.path;
    a.rel = iconNode.pathType;
    a.classList.add('link', 'icon');
    const img = document.createElement('img');
    img.src = `/api/pages${iconNode.path}/icon`;
    img.alt = iconNode.path.replace(/\/(.*)\/(.*)/, '$2');
    img.title = img.alt;
    img.classList.add('icon');
    a.appendChild(img);

    return a;
}

function convertHashTag(hashTagNode: HashTagNode) {
    const a = document.createElement('a');
    a.href = `/${getCurrentProject()}/${hashTagNode.href}`;
    a.type = 'hashTag';
    a.classList.add('page-link');
    a.textContent = hashTagNode.href;

    return a;
}

function convertPlain(plainNode: PlainNode) {
    return document.createTextNode(plainNode.text);
}

