<script>
  import { getUser, isAuthenticated, logout } from "../lib/pb";

  async function handleButton() {
    if (getUser()) {
      await logout();
      window.location.reload();
    } else {
      window.location.href = "/account/login";
    }
  }
</script>

<button
  onclick={handleButton}
  class="px-4 py-2 rounded-lg font-semibold transition duration-200
    bg-accent-600 hover:bg-accent-900 text-gray-100 dark:bg-accent-200 dark:text-gray-800 dark:hover:text-gray-300 dark:hover:bg-accent-900"
>
  {getUser() ? "Cerrar sesión" : "Iniciar sesión"}
</button>
