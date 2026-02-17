var title = document.getElementById('title');
var main = document.getElementById('main');
var result = document.getElementById('result');
var preview = document.getElementById('preview');

var code = {};
code.html = `
  <h1>Hi</h1>
`;

code.css = `
  h1 {
    color: green;
  }
`;
var snippet = {
  html: sourceCode({
    open: true,
    title: 'HTML',
    id: 'txt_html',
    content: stripInitial(code.html).trim()
  }),
  css: sourceCode({
    title: 'CSS',
    id: 'txt_css',
    content: stripInitial(code.css).trim()
  })
};

main.innerHTML += snippet.html;
main.innerHTML += snippet.css;

window.addEventListener('load', function() {

  var txt_html = document.getElementById('txt_html');
  var txt_css = document.getElementById('txt_css');

  result.addEventListener('click', function() {
    writeToIframe('preview', contentHtml({
      style: txt_css.value,
      body: txt_html.value
    })
  )});

});
