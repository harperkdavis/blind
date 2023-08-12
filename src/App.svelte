<script lang="ts">
  import blindLogo from './assets/svelte.svg';

  import Gradient from './lib/Gradient.svelte';
  import Info from './lib/Info.svelte';

  import Start from './pages/Start.svelte';
</script>

<main>

  <Gradient />

  <Start />
  
  <div class="info-container">
    <Info />
  </div>
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    width: 100vw;
    height: 100vh;
    background-color: #000;
  }

  .info-container {
    position: absolute;
    bottom: 0;
    left: 0;
    padding: 0.25rem;
  }

</style>
