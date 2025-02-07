<script lang="ts">
  import { createUser, recordToUser, type User, getUser } from "../lib/pb";

  let user = $state<User>({
    nombre: "",
    email: "",
    password: "",
    num_cuenta: "",
    rol: "",
    id: "",
  });

  let status = $state("");
  let success = $state(false);
  $inspect(status);

  async function handleAddUser(e: SubmitEvent) {
    e.preventDefault();

    try {
      const record = await createUser(user);
      user = recordToUser(record);
      status = "Usuario añadido correctamente.";
      success = true;
    } catch (error) {
      console.error("Error during user creation:", error);
      status = (error as Error).message;
    }
  }
</script>

<svelte:window />
<article>
  <header class="flex justify-between">
    <h3>Añadir a un nuevo usuario</h3>
  </header>
  <p>
    Para añadir a un nuevo usuario, por favor, rellene el siguiente formulario.
  </p>
  {#if status}
    <div
      class="flex items-center p-4 mb-4 text-sm rounded-lg bg-gray-50 dark:bg-gray-800 {success
        ? 'text-green-800 dark:text-green-400'
        : 'text-red-800 dark:text-red-400'}"
      role="alert"
    >
      <!-- <Info class="flex-shrink-0 inline w-4 h-4 me-1" /> -->
      <span class="font-medium">{status}</span>
    </div>
  {/if}
  <div
    class="max-w-2xl mx-auto mt-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
  >
    <form onsubmit={handleAddUser}>
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
            bind:value={user.nombre}
            placeholder="Nombre"
            class="w-full p-3 border rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white
                   focus:outline-none focus:ring-2 focus:ring-accent-600"
          />
        </div>
        <div>
          <label
            for="account"
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Usuario
          </label>
          <input
            id="acount"
            type="text"
            bind:value={user.num_cuenta}
            placeholder="Número de cuenta"
            class="w-full p-3 border rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-accent-600"
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
            class="w-full p-3 border rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white
            focus:outline-none focus:ring-2 focus:ring-accent-600"
            required
          />
        </div>
      </div>
      <label for="role"
        >Rol
        <select
          id="role"
          name="role"
          bind:value={user.rol}
          class="ml-4 p-2 border rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white
            focus:outline-none focus:ring-2 focus:ring-accent-600"
          required
        >
          <option selected disabled value="">Seleccionar</option>
          <option value="Estudiante">Estudiante</option>
          {#if getUser()!.role == "Supervisor"}
            <option value="Colaborador">Colaborador</option>
          {/if}
          {#if getUser()!.role == "Supervisor"}
            <option value="Supervisor">Supervisor</option>
          {/if}
        </select>
      </label>
      <label
        for="password"
        class="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        Contraseña
        <input
          id="password"
          type="password"
          bind:value={user.password}
          placeholder="Contraseña"
          class="w-full p-3 border rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white
          focus:outline-none focus:ring-2 focus:ring-accent-600"
          required
        />
      </label>

      <button
        type="submit"
        class="w-full mt-6 p-3 bg-accent-600 text-white font-bold rounded-lg hover:bg-accent-900 transition"
      >
        Añadir usuario
      </button>
    </form>
  </div>
</article>
