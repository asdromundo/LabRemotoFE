<script>
  import VideoThemePlayer from "./VideoThemePlayer.svelte";
  import { onMount } from "svelte";
  import { isInReservationTime } from "../lib/pb";

  let tieneReserva = $state(false);

  let width = $state(0);
  let height = $state(0);
  let text = $state("");
  let color = $state("#ff9500");
  let img = $state("");

  onMount(async () => {
    tieneReserva = await isInReservationTime();
  });
</script>

{#if tieneReserva}
  <VideoThemePlayer />

  <div
    class="max-w-2xl mx-auto mt-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg content-center"
  >
    <form onsubmit={() => {}}>
      <input type="text" bind:value={text} placeholder="Texto" />

      <label for="color"
        >Color <input type="color" bind:value={color} required /></label
      >

      <label>
        Width
        <input type="range" bind:value={width} min="500" max="2000" required />
      </label>

      <label>
        Height
        <input type="range" bind:value={height} min="500" max="2000" required />
      </label>

      <button type="submit">Enviar</button>
    </form>
  </div>
{:else}
  Podrás ingresar al laboratorio únicamente durante el horario que hayas
  reservado.
{/if}
