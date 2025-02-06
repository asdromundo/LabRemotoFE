<script>
  import {
    isAuthenticated,
    getUser,
    updateUser,
    logout,
    requestEmailChange,
  } from "../lib/pb";
  import LoginButton from "./LoginButton.svelte";
  import { onMount } from "svelte";
  import { slide } from "svelte/transition";

  let modifyPassword = $state(false);
  let modifiedEmail = $state("");

  let user = $state({
    name: "",
    account: "",
    username: "",
    email: "",
    oldPassword: "",
    password: "",
    confirmPassword: "",
  });

  onMount(async () => {
    if (getUser()) {
      user = await getUser();
    }
  });

  async function handleEmailChange(event) {
    event.preventDefault();

    if (modifiedEmail) {
      requestEmailChange(modifiedEmail);
    }
  }

  async function handleUpdate(event) {
    event.preventDefault();

    if (!isAuthenticated()) {
      alert(
        "Sesión invalida, no se realizarán cambios. Vuelva a iniciar sesión"
      );
      await logout();
      window.location.reload();
      return;
    }

    if (user.password && user.password !== user.confirmPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }
    if (!modifyPassword) {
      user.password = user.oldPassword;
    }
    try {
      await updateUser(user.id, {
        name: user.name,
        email: user.email,
        password: user.password,
        oldPassword: user.password,
      });

      alert("Datos actualizados correctamente. Vuelve a iniciar sesión.");
      user.password = "";
      user.confirmPassword = "";
      await logout();
      window.location.reload();
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      alert("Hubo un error al actualizar los datos. Verifica tu contraseña");
    }
  }
</script>

{#if getUser()}
  <div
    class="max-w-2xl mx-auto mt-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
  >
    <form onsubmit={handleUpdate}>
      <div class="mb-6 space-y-4">
        <div>
          <label
            for="name"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Nombre
          </label>
          <input
            id="name"
            type="text"
            bind:value={user.name}
            placeholder="Nombre"
            class="w-full p-3 border rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-accent-600"
          />
        </div>

        <div>
          <label
            for="username"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Usuario
          </label>
          <input
            id="username"
            type="text"
            bind:value={user.account}
            disabled
            class="w-full p-3 border rounded-lg bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            required
          />
        </div>

        <div>
          <label
            for="email"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            bind:value={user.email}
            placeholder="correo@ejemplo.com"
            class="w-full p-3 border rounded-lg bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            disabled
            required
          />
        </div>
      </div>

      <div class="flex items-center gap-2 mt-4">
        <label
          for="togglePassword"
          class="text-m font-medium text-gray-700 dark:text-gray-300"
        >
          Cambiar contraseña
        </label>
        <input
          type="checkbox"
          id="togglePassword"
          bind:checked={modifyPassword}
          class="w-4 h-4"
        />
      </div>

      <label
        for="oldPassword"
        class="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        Contraseña actual
        <input
          id="oldPassword"
          type="password"
          bind:value={user.oldPassword}
          placeholder="Contraseña actual"
          class="w-full p-3 border rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white
            focus:outline-none focus:ring-2 focus:ring-accent-600"
          required
        />
      </label>
      {#if modifyPassword}<div transition:slide>
          <label
            for="password"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Nueva contraseña
          </label>
          <input
            id="password"
            type="password"
            bind:value={user.password}
            placeholder="Nueva contraseña"
            class="w-full p-3 border rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-accent-600"
            required
          />

          <label
            for="confirmPassword"
            class="block mt-4 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Confirmar contraseña
          </label>
          <input
            id="confirmPassword"
            type="password"
            bind:value={user.confirmPassword}
            placeholder="Confirmar contraseña"
            class="w-full p-3 border rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white
                focus:outline-none focus:ring-2 focus:ring-accent-600"
            required
          />
        </div>
      {/if}

      <button
        type="submit"
        class="w-full mt-6 p-3 bg-accent-600 text-white font-bold rounded-lg hover:bg-accent-900 transition"
      >
        Guardar cambios
      </button>
    </form>
  </div>
  <!-- No funcional hasta que tengamos servidor de correo SMTP
      <form onsubmit={handleEmailChange}>
      <div>
        <label
          for="email"
          class="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Solicitar cambio de correo. Deberás confirmar con el enlace enviado al
          correo proporcionado
        </label>
        <input
          placeholder="nuevo@correo.com"
          id="email"
          type="email"
          bind:value={modifiedEmail}
          class="w-1/2 p-3 border rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-accent-600"
          required
        />
        <button
          type="submit"
          class="sm:mx-auto md:ml-16 mt-6 p-3 bg-accent-600 text-white font-bold rounded-lg hover:bg-accent-900 transition"
        >
          Solicitar cambio de correo
        </button>
      </div>
    </form>
   -->
{:else}
  <h3 class="text-center">
    Debes iniciar sesión para ver los datos de tu cuenta
  </h3>
  <div class="flex justify-center">
    <LoginButton />
  </div>
{/if}
