const express = require("express");
const WebSocket = require("ws");

const app = express();
const wss = new WebSocket.Server({ port: 9999 });

app.use(express.static("public"));
app.listen(8000);

// pls redeploy

wss.on("connection", function connection(ws) {
  ws.on("message", function incoming(data) {
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  });
});
