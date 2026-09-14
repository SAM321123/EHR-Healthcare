const http = require('http');
const httpProxy = require('http-proxy');

// Create a proxy server with custom application logic
const proxy = httpProxy.createProxyServer({});

// Create your target server
const server = http.createServer((req, res) => {
  // You can define here where should the proxy go
  proxy.web(req, res, { target: "http://192.168.29.60:5002" });
});

console.log("<<<<< Listening on port 5001 >>>>>")
server.listen(5001);