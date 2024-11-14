<script lang="ts">
  import {  onMount } from "svelte";

  let ticketNumber: string | null = $state('')
  let appointmentId: string | null = $state('')

  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    ticketNumber = urlParams.get('ticketNumber');
    appointmentId = urlParams.get('appointmentId');
  })

  const goHome = () => {
    window.location = window.location.origin
  }

</script>

<div class="ticket-content">
{#if ticketNumber}
  Your ticket number is: <span>{ticketNumber}</span>
{/if}
{#if appointmentId}
  Your appointment number is: <span>{appointmentId}</span>
{/if}
<div class="mt-5">
  <button  class="button is-text" onclick={()  => goHome()}>Go home</button>
</div>
</div>

<style>
.ticket-content{
  padding-top: 20px;
  background-color: var(--theme-primary-bg-color);
  color: var(--theme-primary-text-color);
  width: 100%;
  height: 100%;
  text-align: center;
  font-size: 1.5em;
}
.ticket-content span{
  font-weight: bold;
}

</style>