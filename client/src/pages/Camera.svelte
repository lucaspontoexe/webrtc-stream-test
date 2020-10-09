<script>
  import SimplePeer from "simple-peer";
  import ReconnectingWebsocket from '@yunyu/reconnecting-websocket';
  import { onDestroy } from "svelte";
  import { setVideoBitrates } from "../lib/BandwidthHandler";
  import darkenBackground from "../utils/darkenBackground";
  import "./video.css";

  const params = Object.fromEntries(
    new URLSearchParams(window.location.search).entries()
  );

  let video;
  let showInfoPage = true;
  let ws;
  let p;
  let receiverID = params.receiverID || undefined;
  let error;

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

  function setupWebSocket() {
    return new Promise((resolve, reject) => {
      if (!receiverID) reject({ error: "no receiver" });
      ws = new ReconnectingWebsocket(
        "wss://webrtc-stream-test-ohlord.herokuapp.com?c=d&mode=caller&receiverID=" +
          receiverID
      );
      ws.addEventListener("message", event => handleMessage(event, p));
      ws.addEventListener("error", reject);

      ws.addEventListener("open", resolve);
    });
  }

  function startConnection(stream) {
    // on open, get media with constraints
    // add signalling listeners, init simplepeer
    // play video, hide connection page

    // after connection starts, get media capabilities
    // for any [or most of them] supported cap. add a button/range/ui element
    // but for now, just console.log them.

    // get receiver ID

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

    p.on("error", handleError);

    p.on("signal", data => {
      ws.send(
        JSON.stringify({
          type: "signal",
          payload: data
        })
      );
      console.log("SIGNAL", data);
    });

    // show preview & log capabilities
    video.srcObject = stream;
    video.muted = true;
    darkenBackground();

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
      case 'receiverNotFound':
        ws.close();
        p.destroy();
        showInfoPage = true;
        handleError('receiver not found');
      default:
        console.warn("unknown message type", msg);
        break;
    }
  }

  const handleError = err => {
    console.warn("problemou", err);
    console.dir(err);
    error = JSON.parse(err) || err
  };

  async function init() {
    // TODO: don't show gui if connection fails
    try {
    await setupWebSocket()
    const stream = await (getMedia())
    startConnection(stream)
    } catch (error) {
     handleError(err) 
    }
  }

  onDestroy(() => {
    if (p) p.destroy();
    if (ws) ws.close();
  });
</script>

<style>
  /* TODO: organize CSS */
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
    font-size: 12pt;
  }

  h1 {
    color: white;
    font-size: 2em;
    margin: 0;
  }

  .description {
    color: #c8c8c8;
    font-size: 1em;
  }

  input {
    -moz-appearance: textfield;
    -webkit-appearance: textfield;
    appearance: textfield;

    border-radius: 5px;
    width: 16em;
    height: 50px;
    font-size: 1.2em;
    letter-spacing: 1.2em;
    text-align: center;
  }

  .connect {
    color: white;
    background-color: #6184ff;
    border-radius: 10px;
    border: none;
    width: 100%;
    height: 50px;
    margin-top: 10px;
    font-weight: bold;
    font-size: 1.4rem;
  }
</style>

<section>

  {#if showInfoPage}
    <div class="info">

      <h1>
        WebRTC Streamer
        <sup>0.2</sup>
      </h1>

      <label for="recv-id" class="description">
        <h2>
          Type the number being
          <br />
          displayed on screen
        </h2>
      </label>

      <form on:submit|preventDefault={init}>
        <input id="recv-id" type="number" bind:value={receiverID} />

        <br />
        <button class="connect" type="submit">Connect</button>
      </form>

      <!-- <div class="options">options: resolution, bandwidth, etc.</div> -->

    </div>
  {/if}

  {#if error}
  <div class="error">
    {error}
  </div>
  {/if}

  <!-- svelte-ignore a11y-media-has-caption -->
  <video bind:this={video} autoplay />

</section>
