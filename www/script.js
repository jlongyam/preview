;(function() {
  const scripts = ['cordova.js', 'console/console.js', 'console/override.js'];
  scripts.forEach(function(src){
    let script = document.createElement('script');
    script.src = src;
    document.head.appendChild(script);
  });
  window.addEventListener('load', function() {
    let script = document.createElement('script');
    script.type = "module";
    script.src = "js/main.js";
    document.body.appendChild(script);
  });
  document.currentScript.remove();
})()