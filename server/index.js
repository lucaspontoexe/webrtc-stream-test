const express = require("express");
const WebSocket = require("ws");
const path = require("path");
const { generateID } = require("./generateID");

const app = express();
const wss = new WebSocket.Server({ port: 9999 });

app.use(express.static(path.resolve(__dirname, "..", "client", "public")));
app.use("*", (req, res) =>
  res.sendFile(path.resolve(__dirname, "..", "client", "public", "index.html"))
);
app.listen(8080);

wss.on("connection", function connection(socket, request) {
  const params = new URLSearchParams(request.url);
  const mode = params.get("mode"); // caller / receiver

  if (mode === "receiver") handleReceiverConnect(socket);
  if (mode === "caller") handleCallerConnect(socket, params);
  console.log('we have', wss.clients.size, 'clients');
  
});

function handleReceiverConnect(socket) {
  const data = {
    type: "sign-in",
    connectionID: generateID(),
    recoveryID: "not_implemented",
  };

  socket.connectionID = data.connectionID;
  socket.send(JSON.stringify(data));
}

function handleCallerConnect(callerSocket, params) {
  const receiverID = params.get("receiverID");
  let receiver;

  //helper function
  const sendMsg = (msg, destination) =>
    destination.readyState === WebSocket.OPEN && destination.send(msg);

  // "filter" through receivers
  wss.clients.forEach((client) => {
    if (client.connectionID === receiverID) receiver = client;
  });

  if (!receiver) {
    callerSocket.send(JSON.stringify({ error: "receiverNotFound" }));
    callerSocket.close();
    return;
  }

  callerSocket.on("message", (msg) => sendMsg(msg, receiver));
  receiver.on("message", (msg) => sendMsg(msg, callerSocket));
}

console.log("we runnin'");
