<script>
  import SimplePeer from "simple-peer";
  import { onDestroy } from "svelte";
  import { setVideoBitrates } from "../lib/BandwidthHandler";
  import "./video.css";

  const params = Object.fromEntries(
    new URLSearchParams(window.location.search).entries()
  );

  let video;
  let showInfoPage = true;
  let ws;
  let p;
  let receiverID = params.receiverID || undefined;

  function getMedia() {
    // get media
    return navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        facingMode: "environment"
      },
      audio: true
    });
  }

  function startConnection(stream) {
    // get options from inputs
    // validate for no input
    // init websocket
    // on open, get media with constraints
    // add signalling listeners, init simplepeer
    // play video, hide connection page

    // after connection starts, get media capabilities
    // for any [or most of them] supported cap. add a button/range/ui element
    // but for now, just console.log them.

    // get receiver ID

    // init connection
    ws = new WebSocket(
      "ws://localhost:9999?c=d&mode=caller&receiverID=" + receiverID
    );

    p = new SimplePeer({
      initiator: true,
      trickle: false,
      sdpTransform: sdp =>
        setVideoBitrates(sdp, {
          min: 3600,
          max: 6400
        }),
      stream
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

    ws.addEventListener("message", event => handleMessage(event, p));
    ws.addEventListener("error", console.warn);

    // show preview & log capabilities
    video.srcObject = stream;
    video.muted = true;
    const track = stream.getVideoTracks()[0];
    console.log(track.getCapabilities());
    console.log(track.getConstraints());

    showInfoPage = false;
  }

  // TODO: extract to file
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

  function init() {
    // TODO: don't show gui if connection fails
    getMedia()
      .then(stream => startConnection(stream))
      .catch(err => console.log("problemou", err));
  }

  onDestroy(() => {
    if (p) p.destroy();
    if (ws) ws.close();
  });
</script>

<main>

  {#if showInfoPage}
    <div class="info">
      <label for="recv-id">
        <h1>Enter the number displayed on screen </h1>
      </label>

      <input
        id="recv-id"
        type="number"
        placeholder="Receiver ID"
        bind:value={receiverID} />

      <br />
      <button on:click={init}>CONNECT</button>

      <div class="options">options: resolution, bandwidth, etc.</div>

    </div>
  {/if}

  <video bind:this={video} autoplay />

</main>
