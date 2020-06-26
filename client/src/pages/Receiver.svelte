<script>
  import SimplePeer from "simple-peer";
  import { onDestroy } from "svelte";
  import { setVideoBitrates } from "../lib/BandwidthHandler";
  import darkenBackground from "../utils/darkenBackground";
  import "./video.css";

  const ws = new WebSocket("ws://localhost:8080?a=b&mode=receiver");
  let p;
  let id;
  let video;
  let showInfoPage = true;

  function startConnection() {
    p = new SimplePeer({
      initiator: false,
      trickle: false,
      sdpTransform: sdp =>
        setVideoBitrates(sdp, {
          min: 3600,
          max: 6400
        })
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
      showInfoPage = false;
      video.srcObject = stream;
      video.play();
      darkenBackground();
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
        if (id) {
          console.warn("wait what", id);
          return;
        }

        id = msg.connectionID;
        break;
      default:
        console.warn("unknown message type", msg);
        break;
    }
  }

  ws.addEventListener("open", startConnection);

  onDestroy(() => {
    p.destroy();
    ws.close();
  });
</script>

<style>
  section {
    width: 100vw;
    height: 100vh;
    margin: 0px;
    padding: 0px;

    display: flex;
    justify-content: center;
    align-items: center;
  }

  .info {
    margin: auto 0px;
  }

  sup {
    font-weight: lighter;
    font-size: 24pt;
  }

  h1 {
    color: white;
    font-size: 4em;
    margin: 0;
  }

  .number {
    color: white;
    font-size: 8em;
    margin: 10%;
  }

  .description {
    color: #c8c8c8;
    font-size: 2.3em;
  }
</style>

<section>

  {#if showInfoPage}
    <div class="info">
      <h1>
        WebRTC Streamer
        <sup>0.2</sup>
      </h1>

      <h2 class="description">
        On your second device, enter
        <br />
        https://example.com/camera
        <br />
        and type this number:
      </h2>

      <h2 class="number">{id || '------'}</h2>

    </div>
  {/if}

  <video bind:this={video} autoplay />

</section>
