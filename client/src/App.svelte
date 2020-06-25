<script>
  export let url = "";

  import { Router, Link, Route } from "svelte-routing";

  import Camera from "./pages/Camera.svelte";
  import Receiver from "./pages/Receiver.svelte";
  import Home from "./pages/Home.svelte";
</script>

<style>
  main {
    text-align: center;
    margin: 0px;
    padding: 0px;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>

<main>

  <Router {url}>
    <Route path="/camera" component={Camera} />
    <Route path="/receiver" component={Receiver} />
    <Route exact path="/" component={Home} />
  </Router>

</main>
