<script>
  import SimplePeer from "simple-peer";
  import BandwidthHandler from "../lib/BandwidthHandler";

  const params = Object.fromEntries(
    new URLSearchParams(window.location.search).entries()
  );

  let video;
  let showInfoPage = true;
  let ws;
  let receiverID = params.receiverID || undefined;

  async function startConnection() {
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


    // get media
    let stream;

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          facingMode: "environment"
        },
        audio: true
      });
    } catch (error) {
      console.log("problemou: ", error);
    }

    // init connection
    ws = new WebSocket(
      "ws://localhost:9999?c=d&mode=caller&receiverID=" + receiverID
    );

    const p = new SimplePeer({
      initiator: false,
      trickle: false,
      sdpTransform: sdp =>
        BandwidthHandler.setVideoBitrates(sdp, {
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

    // show preview & log capabilities
    video.srcObject = stream;
    const track = stream.getVideoTracks()[0]
    console.log(track.getCapabilities())

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
</script>

<main>

  <div class="info">
    Type the ID that receiver is displaying, etc.
    <input type="number" maxlength="6" placeholder="receiver ID" bind:value={receiverID}/>

    <button on:click={startConnection}>CONNECT</button>

    <div class="options">options: resolution, bandwidth, etc.</div>

  </div>

  <video bind:this={video} autoplay />

</main>
