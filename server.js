const express = require("express");
const WebSocket = require("ws");

const app = express();
const wss = new WebSocket.Server({ port: 9999 });

app.use(express.static("public"));
app.listen(8000);

wss.on("connection", function connection(ws, request) {
  const params = new URLSearchParams(request.url);
  const mode = params.get('mode') // caller / receiver


  ws.send(
    `oh hi, welcome. 
    for reasons, this may be your ip: ${request.connection.remoteAddress} 
    or maybe: ${ws._socket.remoteAddress}`
  );
  console.log("gottem ", request.connection.remoteAddress);
  ws.on("message", function incoming(data) {
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  });
});
console.log("we runnin'");
