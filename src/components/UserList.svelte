<script lang="ts">
  import { onMount } from "svelte";
  import {
    deleteUser,
    findUser,
    getUser,
    isLoggedIn,
    listUsers,
    type User,
  } from "../lib/pb";
  import AddUser from "./AddUser.svelte";
  import { fade } from "svelte/transition";

  let loading = $state(true);
  let dataFromPB: User[] = $state([]);
  let addUserModal = $state(false);
  let addFromFileModal = $state(false);
  let selectedUsers: User[] = $state([]);
  let search = $state("");

  async function handleSearch() {
    fillTable(async () => {
      if (search) {
        try {
          const user = await findUser(search);
          return user;
        } catch (error) {
          return [];
        }
      } else {
        return dataFromPB;
      }
    });
  }

  async function fillTable(fun: Function) {
    const data = await fun();
    if (data) {
      dataFromPB = data;
      loading = false;
    }
  }

  async function handleDelete() {
    for (const user of selectedUsers) {
      await deleteUser(user.id);
    }
    window.location.reload();
  }

  onMount(async () => {
    dataFromPB = await listUsers();
  });

  $effect(() => {
    if (!search) {
      fillTable(() => dataFromPB);
    }
  });
</script>

{#if isLoggedIn() && getUser()!.role == "Supervisor"}
  <!--   
  <div>
  <!--   {#if addFromFileModal}
    <dialog open={addFromFileModal} transition:fade>
      <AddFromFile
        onclick={() => (addFromFileModal = false)}
        collection={role}
      />
    </dialog>
  {/if} 
</div> -->

  <div class="pico container">
    <div class="text-center">
      <button
        transition:fade
        class="inline-flex items-center rounded-lg p-2 mx-auto bg-accent-600 hover:bg-accent-900 text-gray-100 dark:bg-accent-200 dark:text-gray-800 dark:hover:text-gray-300 dark:hover:bg-accent-900"
        onclick={() => {
          if (!search) {
            window.location.reload();
          } else {
            search = "";
            fillTable(() => dataFromPB);
          }
        }}
      >
        {#if search}
          <!--  <Undo2 class="w-4 h-4 lg:mr-1" /> -->
          <p class="hidden lg:contents">Regresar</p>
        {:else}
          <!-- <RefreshCcw class="w-4 h-4 lg:mr-1" /> -->
          <p class="hidden lg:contents">Actualizar</p>
        {/if}
      </button>
      <button
        class="inline-flex items-center rounded-lg p-2 mx-auto bg-accent-600 hover:bg-accent-900 text-gray-100 dark:bg-accent-200 dark:text-gray-800 dark:hover:text-gray-300 dark:hover:bg-accent-900"
        onclick={() => (addUserModal = !addUserModal)}
        ><!-- <UserRoundPlus class="w-4 h-4 lg:mr-1" /> -->
        {#if addUserModal}
          Cerrar
        {:else}
          <p>Añadir</p>
        {/if}
      </button>
      <button
        class="inline-flex items-center rounded-lg p-2 mx-auto bg-accent-600 hover:bg-accent-900 text-gray-100 dark:bg-accent-200 dark:text-gray-800 dark:hover:text-gray-300 dark:hover:bg-accent-900"
        onclick={() => (addFromFileModal = true)}
        ><!-- <Upload class="w-4 h-4 lg:mr-1" /> -->
        <p class="hidden lg:contents">Desde archivo</p>
      </button>
    </div>
    {#if addUserModal}
      <div transition:fade>
        <AddUser />
      </div>
    {/if}
    <article>
      <header>
        {#if selectedUsers.length > 0}
          <div in:fade class="pico container">
            <div class="flex items-center justify-between">
              <h3>Seleccionados: {selectedUsers.length}</h3>

              <div>
                <button class="contrast" onclick={handleDelete}>Eliminar</button
                >
              </div>
            </div>
          </div>
        {:else}
          <!-- svelte-ignore a11y_no_redundant_roles -->
          <fieldset role="group">
            <input
              class="inline-flex p-2 outline rounded-lg"
              type="search"
              name="search"
              placeholder="Nombre, usuario, email"
              aria-label="Search"
              bind:value={search}
            />
            <button
              onclick={handleSearch}
              class="rounded-lg p-3 mx-auto bg-accent-600 hover:bg-accent-900 text-gray-100 dark:bg-accent-200 dark:text-gray-800 dark:hover:text-gray-300 dark:hover:bg-accent-900"
              >Buscar</button
            >
          </fieldset>
        {/if}
      </header>

      {#if !loading}
        <div class="pico container">
          <div class="overflow-auto">
            <table class="striped">
              <thead>
                <tr>
                  <th scope="col"
                    ><input
                      type="checkbox"
                      checked={selectedUsers.length === dataFromPB!.length}
                      onclick={() => {
                        if (selectedUsers.length === dataFromPB!.length) {
                          selectedUsers = [];
                        } else {
                          selectedUsers = dataFromPB!;
                        }
                      }}
                    /></th
                  >
                  <th scope="col">Nombre</th>
                  <th scope="col">Usuario</th>
                  <th scope="col">Email</th>
                  <th scope="col">Rol</th>
                </tr>
              </thead>
              <tbody>
                {#if dataFromPB!.length === 0}
                  <tr in:fade>
                    <td colspan="5"><h3>No se encontraron usuarios</h3></td>
                  </tr>
                {/if}
                {#each dataFromPB! as user, i}
                  <tr in:fade>
                    <td
                      ><input
                        type="checkbox"
                        checked={selectedUsers.length === dataFromPB!.length}
                        onclick={() => {
                          if (selectedUsers[i] !== user) {
                            selectedUsers[i] = user;
                          } else {
                            selectedUsers.splice(i, 1);
                          }
                        }}
                      /></td
                    >
                    <td>{user.nombre}</td>
                    <td>{user.num_cuenta}</td>
                    <td>{user.email}</td>
                    <td>{user.rol}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      {:else}
        <div
          role="status"
          class="pico container p-4 space-y-4 border border-gray-200 divide-y divide-gray-200 rounded shadow animate-pulse dark:divide-gray-700 md:p-6 dark:border-gray-700"
        >
          <div class="flex items-center justify-between">
            <div>
              <div
                class="h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-24 mb-2.5"
              ></div>
              <div
                class="w-32 h-2 bg-gray-200 rounded-full dark:bg-gray-700"
              ></div>
            </div>
            <div
              class="h-2.5 bg-gray-300 rounded-full dark:bg-gray-700 w-12"
            ></div>
          </div>
          <div class="flex items-center justify-between pt-4">
            <div>
              <div
                class="h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-24 mb-2.5"
              ></div>
              <div
                class="w-32 h-2 bg-gray-200 rounded-full dark:bg-gray-700"
              ></div>
            </div>
            <div
              class="h-2.5 bg-gray-300 rounded-full dark:bg-gray-700 w-12"
            ></div>
          </div>
          <div class="flex items-center justify-between pt-4">
            <div>
              <div
                class="h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-24 mb-2.5"
              ></div>
              <div
                class="w-32 h-2 bg-gray-200 rounded-full dark:bg-gray-700"
              ></div>
            </div>
            <div
              class="h-2.5 bg-gray-300 rounded-full dark:bg-gray-700 w-12"
            ></div>
          </div>
          <div class="flex items-center justify-between pt-4">
            <div>
              <div
                class="h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-24 mb-2.5"
              ></div>
              <div
                class="w-32 h-2 bg-gray-200 rounded-full dark:bg-gray-700"
              ></div>
            </div>
            <div
              class="h-2.5 bg-gray-300 rounded-full dark:bg-gray-700 w-12"
            ></div>
          </div>
          <div class="flex items-center justify-between pt-4">
            <div>
              <div
                class="h-2.5 bg-gray-300 rounded-full dark:bg-gray-600 w-24 mb-2.5"
              ></div>
              <div
                class="w-32 h-2 bg-gray-200 rounded-full dark:bg-gray-700"
              ></div>
            </div>
            <div
              class="h-2.5 bg-gray-300 rounded-full dark:bg-gray-700 w-12"
            ></div>
          </div>
          <span class="sr-only">Cargando...</span>
        </div>
      {/if}
    </article>
  </div>
{/if}
