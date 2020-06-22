<script>
  export let url = "";
  export let name = "ala";

  import { Router, Link, Route } from "svelte-routing";
  
  import Camera from "./pages/Camera.svelte";
  import Receiver from "./pages/Receiver.svelte";
  import Home from "./pages/Home.svelte";

</script>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  h1 {
    color: #ff3e00;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>

<main>
  <h1>Hello {name}!</h1>
  <p>
    Visit the
    <a href="https://svelte.dev/tutorial">Svelte tutorial</a>
    to learn how to build Svelte apps.
  </p>

  <Router {url}>
    <Route path="/camera" component={Camera} />
    <Route path="/receiver" component={Receiver} />
    <Route path="/" component={Home} />
  </Router>

</main>
