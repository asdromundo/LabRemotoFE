<script>
  import { login, isAuthenticated } from "../lib/pb";

  let email = $state("");
  let password = $state("");
  let errorMessage = $state("");

  $effect(() => {
    if (isAuthenticated()) {
      window.location.href = "/account";
    }
  });

  async function handleSubmit(event) {
    event.preventDefault();
    errorMessage = "";

    try {
      await login(email, password);
      window.location.href = "/practicas/horarios";
    } catch (error) {
      console.log(error);
      errorMessage = "Error al iniciar sesión";
    }
  }
</script>

<div class="flex items-center justify-center">
  <div
    class="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg"
  >
    <h1
      class="text-2xl font-bold text-accent-600 dark:text-accent-200 text-center"
    >
      Inicia Sesión
    </h1>

    {#if errorMessage}
      <p class="text-red-500 text-sm text-center">{errorMessage}</p>
    {/if}

    <form class="mt-6" onsubmit={handleSubmit}>
      <label
        for="email"
        class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        Correo electrónico
      </label>
      <input
        id="email"
        type="email"
        bind:value={email}
        required
        class="w-full p-3 border rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-600"
      />

      <label
        for="password"
        class="block mt-4 mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        Contraseña
      </label>
      <input
        id="password"
        type="password"
        bind:value={password}
        required
        class="w-full p-3 border rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-600"
      />

      <button
        type="submit"
        class="w-full mt-6 p-3 font-bold rounded-lg bg-accent-600 hover:bg-accent-900 text-gray-100 dark:bg-accent-200 dark:text-gray-800 dark:hover:text-gray-300 dark:hover:bg-accent-900 transition"
      >
        Entrar
      </button>
    </form>

    <a
      href="/account/password"
      class="block mt-4 text-sm text-accent-600 hover:text-accent-900 text-center"
    >
      ¿Olvidaste tu contraseña?
    </a>
  </div>
</div>
