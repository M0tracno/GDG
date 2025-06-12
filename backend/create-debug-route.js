const fs = require('fs');
const path = require('path');

// Create a script that adds a /debug-routes route to the server
fs.writeFileSync(
  path.join(__dirname, 'debug-server-routes.js'),
  `
  // Add this to your server.js file to debug routes
  
  // Debug routes endpoint
  app.get('/debug-routes', (req, res) => {
    const routes = [];
    
    function print(path, layer) {
      if (layer.route) {
        layer.route.stack.forEach(print.bind(null, path.concat(split(layer.route.path))));
      } else if (layer.name === 'router' && layer.handle.stack) {
        layer.handle.stack.forEach(print.bind(null, path.concat(split(layer.regexp.source.replace('\\\\/?(?=\\\\/|$)', '').replace('\\^\\\\', '').replace('\\$', '')))));
      } else if (layer.method) {
        routes.push({
          method: layer.method.toUpperCase(),
          path: path.concat(split(layer.regexp.source.replace('\\\\/?(?=\\\\/|$)', '').replace('\\^\\\\', '').replace('\\$', ''))).filter(Boolean).join('/')
        });
      }
    }
    
    function split(thing) {
      if (typeof thing === 'string') {
        return thing.split('/');
      } else if (thing.fast_slash) {
        return [''];
      } else {
        var match = thing.toString()
          .replace('\\\\/?', '')
          .replace('(?=\\\\/|$)', '$')
          .match(/^\\^\\\\(\\/(?:[^\\/\\\\()[\\]\\\\?\\\\+\\*]*\\\\[^][^\\\\()[\\]]*)*)/);
        return match ? match[1].replace(/\\\\(.)/g, '$1').split('/') : ['<complex>'];
      }
    }
    
    app._router.stack.forEach(print.bind(null, []));
    
    res.json(routes);
  });
  
  console.log('Debug route added at /debug-routes');
`
);

console.log('Created debug-server-routes.js - add this to your server.js file to see registered routes');
