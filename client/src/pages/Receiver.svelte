<script>
  import SimplePeer from "simple-peer";

  const ws = new WebSocket("ws://localhost:9999?mode=receiver");
  let id;
  let video;
  let showInfoPage = true;

  function startConnection() {
    const p = new SimplePeer({
      initiator: false,
      trickle: false
      //   sdpTransform: sdp =>
      //     BandwidthHandler.setVideoBitrates(sdp, {
      //       min: 3600,
      //       max: 6400
      //     })
    });

    p.on("error", err => console.log("error", err));

    p.on("signal", data => {
      ws.send(
        JSON.stringify({
          type: "signal",
          payload: data
        })
      );
      console.log("SIGNAL", data);
    });

    p.on("stream", stream => {
      video.srcObject = stream;
      video.play();
      showInfoPage = false;
    });

    ws.addEventListener("message", event => handleMessage(event, p));
  }

  function handleMessage(event, p) {
    const msg = JSON.parse(event.data);

    switch (msg.type) {
      case "signal":
        p.signal(msg.payload);
        break;
      case "sign-in":
        id = msg.connectionID;
        break;
      default:
        console.warn("unknown message type", msg);
        break;
    }
  }

  ws.addEventListener('open', startConnection)
</script>

<main>
  {#if showInfoPage}
    <div class="info">receiver page your ID is {id}</div>
  {/if}
  <video bind:this={video} autoplay />

</main>
