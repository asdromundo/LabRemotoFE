<script lang="ts">
  import { onMount } from "svelte";
  import {
    getNextReservation,
    getReservationsOn,
    getUser,
    removeReservation,
    createReservation,
    updateReservation,
    isInReservationTime,
  } from "../lib/pb";
  import { ClientResponseError } from "pocketbase";

  let selectedDate = $state(new Date().toISOString().split("T")[0]);
  let selectedTime = $state("");
  let RFC3399Time = $derived.by(() => {
    if (selectedTime) {
      const date = new Date(
        `${selectedDate}T${selectedTime ? selectedTime : "00:00"}:00`
      );
      return date.toISOString();
    }
    return "";
  });

  let tieneReserva: boolean = $state(false);
  let reservations: Date[] = [];
  let nextReservation: Date | null = $state(null);
  let loading = $state(true);
  let reservation = $state({
    id: "",
    date: "",
  });

  const now = new Date();
  const timeSlots = Array.from({ length: 48 }, (_, i) => {
    const hour = 0 + Math.floor(i / 2);
    const minute = (i % 2) * 30;
    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
  });

  onMount(async () => {
    tieneReserva = await isInReservationTime();
    const fetchData = async () => {
      loading = true;
      try {
        const date = new Date(selectedDate);

        // Obtener reservas
        const res = await getReservationsOn(date.toISOString().split("T")[0]);
        reservations = res.map((r) => new Date(r.date));

        // Obtener próxima reserva del usuario
        const user = getUser();
        if (user) {
          reservation = await getNextReservation(user!.id);
          nextReservation = reservation.date
            ? new Date(reservation.date)
            : null;
        }
      } catch (error) {
        if (error instanceof ClientResponseError) {
        } else {
          console.error("Error fetching data:", error);
        }
      }
      loading = false;
    };

    fetchData();
  });

  function isReserved(slotDateTime: Date): boolean {
    return reservations.some((r) => r.getTime() === slotDateTime.getTime());
  }

  function isUserReservation(slotDateTime: Date): boolean {
    if (!nextReservation) return false;

    const start = nextReservation.getTime();
    const end = start + 0.5 * 60 * 60 * 1000; // 0.5 horas de duración
    const slotTime = slotDateTime.getTime();

    return (
      slotTime >= start &&
      slotTime < end &&
      nextReservation.toISOString().startsWith(selectedDate)
    );
  }

  function isPast(slotDateTime: Date): boolean {
    return slotDateTime < now;
  }
</script>

<div
  class="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
>
  <h1
    class="text-2xl font-bold text-accent-600 dark:text-accent-200 text-center mb-6"
  >
    Horarios de Prácticas
  </h1>

  <input
    type="date"
    bind:value={selectedDate}
    class="mb-6 w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
    min="2025-02-05"
  />

  {#if loading}
    <div class="text-center py-4">Cargando...</div>
  {:else}
    <div
      class="flex place-content-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg"
    >
      {#if tieneReserva}
        <p>Reserva activa, visita la página:</p>
        <a href="/practicas/laboratorio/"> Laboratorio</a>
      {:else if nextReservation}
        <div></div>
        <p class="text-gray-700 dark:text-gray-300">
          <strong class="text-accent-600 dark:text-accent-200"
            >Reserva activa:</strong
          >
          {nextReservation.toLocaleDateString()}, {nextReservation.toLocaleTimeString(
            [],
            { hour: "2-digit", minute: "2-digit" }
          )}
        </p>
        <button
          onclick={async () => {
            await updateReservation(reservation.id, RFC3399Time);
            window.location.reload();
          }}
          class="border rounded-lg ml-4 text-gray-100 bg-accent-600 dark:bg-accent-200 dark:text-accent-950"
          disabled={!selectedTime}
        >
          <strong> Cambiar por selección </strong>
        </button>
        <button
          onclick={async () => {
            await removeReservation(reservation.id);
            window.location.reload();
          }}
          class="border rounded-lg ml-2 text-gray-100 bg-gray-600 dark:bg-gray-300 dark:text-accent-950"
        >
          <strong> Cancelar </strong>
        </button>
      {:else}
        <div></div>
        <p class="text-gray-700 dark:text-gray-300">
          No tienes reservas activas
        </p>
        {#if getUser() && !isPast(new Date(`${selectedDate}T${selectedTime}:00`))}
          <button
            onclick={async () => {
              await createReservation(RFC3399Time);
              window.location.reload();
            }}
            class="px-4 mx-auto rounded-lg font-semibold transition duration-200
    bg-accent-600 hover:bg-accent-900 text-gray-100 dark:bg-accent-200 dark:text-gray-800 dark:hover:text-gray-300 dark:hover:bg-accent-900"
            disabled={!selectedTime}
          >
            Reservar
          </button>
        {/if}
      {/if}
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <div class="my-auto"></div>
      {#each timeSlots as time}
        {@const slotDateTime = new Date(`${selectedDate}T${time}:00`)}

        <button
          onclick={() => {
            selectedTime = time;
          }}
          class={`p-3 rounded-lg text-center font-semibold transition-colors
                    ${
                      selectedTime == time
                        ? "bg-accent-600 text-white"
                        : isUserReservation(slotDateTime)
                          ? "bg-accent-900 text-white"
                          : isReserved(slotDateTime)
                            ? "bg-gray-400 dark:bg-gray-600 text-white"
                            : isPast(slotDateTime)
                              ? "bg-gray-100 dark:bg-gray-900 text-gray-400"
                              : "bg-gray-200 dark:bg-gray-700 tewxt-gray-900 dark:text-gray-300"
                    }
                    ${
                      !isReserved(slotDateTime) && !isPast(slotDateTime)
                        ? "cursor-pointer hover:bg-accent-400 dark:hover:bg-accent-700"
                        : ""
                    }`}
          disabled={isPast(slotDateTime) || isReserved(slotDateTime)}
        >
          {time}
        </button>
      {/each}
    </div>

    <div class="mt-6 flex flex-wrap items-center justify-center gap-4">
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 bg-accent-900 rounded"></div>
        <span class="text-sm text-gray-700 dark:text-gray-300">Tu reserva</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 bg-gray-400 dark:bg-gray-600 rounded"></div>
        <span class="text-sm text-gray-700 dark:text-gray-300">Ocupado</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 bg-gray-100 dark:bg-gray-900 rounded"></div>
        <span class="text-sm text-gray-700 dark:text-gray-300">Pasado</span>
      </div>
    </div>
  {/if}
</div>
