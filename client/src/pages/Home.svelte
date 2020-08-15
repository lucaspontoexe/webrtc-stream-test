<script>
  import { Link } from "svelte-routing";
</script>

<!-- svelte-ignore css-unused-selector -->
<div class="buttons">
  <div class="link">
    <Link class="link" to="/camera">camera</Link>
  </div>
  <div class="link">
    <Link class="link" to="/receiver">receiver</Link>
  </div>
</div>


<style>
  .buttons {
    height: 100vh;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .link {
    width: 25rem;
    height: 25rem;
    border-radius: 10px;
    background-color: rgb(54, 54, 54);

    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0px 4rem;
    
    color: white;
    font-size: 3rem;
  }


</style>
