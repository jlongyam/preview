function contentHtml(config) {
  var option = !config ? {} : config;
  option.title = !config.title ? 'Title' : config.title;
  option.body = !config.body ? 'CONTENT' : config.body;
  option.link = !config.link ? '' : `<link href="${config.link}" rel="stylesheet">`;
  option.style = !config.style ? '' : `<style>${config.style}</style>`;
  option.src = !config.src ? {} : config.src;
  option.src.head = !config.src.head ? '' : `<script src="${config.scr.head}"></script>`;
  option.src.body = !config.src.body ? '' : `<script src="${config.scr.body}"></script>`;
  option.script = !config.script ? '' : `<script>${config.script}</script>`
  var doc = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${option.title}</title>
      ${option.link}
      ${option.style}
      ${option.src.head}
    </head>
    <body>
      ${option.body}
      ${option.src.body}
      ${option.script}
    </body>
    </html>
  `
  return doc;
}
function writeToIframe(ifrId, content) {
  var ifr = document.getElementById(ifrId);
  var ifrDoc = ifr.contentWindow.document;
  ifrDoc.open();
  ifrDoc.write(content);
  ifrDoc.close();
}
function sourceCode(config = {}) {
  var option = {};
  option.open = !config.open ? false : config.open;
  option.title = !config.title ? 'HTML' : config.title;
  option.id = !config.id ? 'txt_html' : config.id;
  option.content = !config.content ? '<h1>HTML</h1>' : config.content;
  var comp = `
    <details${option.open ? ' open' : ''} name="accordion">
      <summary>${option.title}</summary>
      <textarea id="${option.id}" wrap="off">${option.content}</textarea>
    </details>
  `;
  return comp;
}
function stripInitial(str) {
  var pttrn = /^\s*(?=[^\s]+)/mg,
    indentLen = str.match(pttrn).reduce(
      function(min, line) {
        return Math.min(min, line.length)
      }, Infinity
    ),
    indent = new RegExp('^\\s{' + indentLen + '}', 'mg')
  ;
  return indentLen > 0 ? str.replace(indent, '') : str;
}
