const express = require('express')
const ws = require('ws')

const app = express();
const wss = new WebSocket.Server({ port: 9999 });

app.get('/', (rq, rs) => rs.sendfile('video.html'))
app.listen(80)


wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(data) {
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  });
});
