import {
    Block,
    Title,
    CodeBlock,
    Table,
    Line,
} from '@progfay/scrapbox-parser'

import {convertNode} from './Node';

export function convertBlock(block: Block) {
    switch (block.type) {
        case 'title':
            return convertTitle(block);
        case 'codeBlock':
            return convertCodeBlock(block);
        case 'table':
            return convertTable(block);
        case 'line':
            return convertLine(block);
   }
}

function convertTitle(title: Title) {
    const div = document.createElement('div');
    div.textContent = title.text;
    div.classList.add('line', 'line-title');
    return [div];
}

function convertCodeBlock(codeBlock: CodeBlock) {
    const code = document.createElement('code');
    const fileName = document.createElement('span');
    fileName.classList.add('code-block-start');
    fileName.title = codeBlock.fileName;
    fileName.textContent = codeBlock.fileName;
    code.appendChild(fileName);
    const main = document.createElement('div');
    main.textContent = codeBlock.content;
    code.appendChild(main);

    return [code];
}

function convertTable(tableBlock: Table) {
    const div = document.createElement('div');
    const fileName = document.createElement('span');
    fileName.classList.add('code-block-start');
    fileName.title = tableBlock.fileName;
    fileName.textContent = tableBlock.fileName;
    div.appendChild(fileName);
    const table = document.createElement('table');
    table.append(...tableBlock.cells.map(rows => {
        const tr = document.createElement('tr');
        tr.append(...rows.map(columns => {
            const td = document.createElement('td');
            td.classList.add('cell');
            td.append(...columns.map(column => convertNode(column)));
            return td;
        }));
        return tr;
    }));
    div.appendChild(table);

    return [div];
}

function convertLine(line: Line) {
    if (line.nodes.length === 0) return [document.createElement('br')];
    return line.nodes.map(node => convertNode(node));
}
