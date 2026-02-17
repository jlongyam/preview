var src = document.currentScript.getAttribute('data-src');
var link = document.createElement('link');
link.rel = 'stylesheet';
link.href = `${src}/iframe.css`;
document.head.appendChild(link);

var script = document.createElement('script');
script.src = `${src}/iframe.js`;
document.head.appendChild(script);

window.addEventListener('load', function () {

  function innerHTML(title = 'Demo') {
    let txt = `
    <header>
      <h2 title="title">${title}</h2>
      <p>Usage HTML with JS, external CSS</p>
    </header>
    <main>
      <div id="result">RESULT</div>
      <iframe id="preview"></iframe>
    </main>
    <footer id="main">
      
    </footer>`
      ;
    return txt;
  }


  document.body.innerHTML = innerHTML('Example');
  var title = document.getElementById('title');
  var main = document.getElementById('main');
  var result = document.getElementById('result');
  var preview = document.getElementById('preview');

  function displayHtml(content = {}) {
    var snippet = {
      html: sourceCode({
        title: 'HTML',
        id: 'txt_html',
        content: stripInitial(content.html).trim()
      }),
      js: sourceCode({
        title: 'JS',
        id: 'txt_js',
        content: stripInitial(content.js).trim() 
      })
    };
    main.innerHTML += snippet.html;
    main.innerHTML += snippet.js;

    var txt_html = document.getElementById('txt_html');
    var txt_js = document.getElementById('txt_js');
    function previewHtml() {
      writeToIframe('preview', contentHtml({
        link: `${src}/play/test.css`,
        body: txt_html.value,
        script: txt_js.value
      }))
    }
    result.addEventListener('click', previewHtml);
    previewHtml();
  }
  window.displayHtml = displayHtml;
})





