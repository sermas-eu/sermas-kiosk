<script lang="ts">
  import { env } from "$env/dynamic/public";
  import { browser } from "$app/environment";
  import { page } from "$app/stores";
  import { toolkit } from "$lib";
    import { onMount } from "svelte";

  const noPrivacyPage = "/no-privacy";

  type PrivacyOptions = "yes" | "no" | null;
  let privacy: PrivacyOptions = null;

  let isPrivacyPage = true;

  let radio1 = false,
    radio2 = false;

  onMount(() => {
    let timer = setTimeout(checkPrivacy, 1000);
    return () => clearTimeout(timer);
  });


  const checkPrivacy = () => {
    // console.warn($page.url.pathname);
    isPrivacyPage = $page.url.pathname.startsWith(noPrivacyPage);
    if (isPrivacyPage) return;
    privacy = localStorage.getItem("privacy") as PrivacyOptions;
    console.log(`Privacy is ${privacy}`);
  };

  const setPrivacy = async (option: PrivacyOptions) => {
    if (option === "no") return (document.location = noPrivacyPage);
    if (option) localStorage.setItem("privacy", option);
    if (option === "yes")
      await fetch(`${toolkit.getBaseUrl()}/api/ui/privacy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
    checkPrivacy();
  };

  $: if (browser) checkPrivacy();
</script>

{#if privacy !== "yes" && !isPrivacyPage}
  <div class="fullscreen">
    <div class="popup content">
      <p class="paragraph">
        Did you read and accept the Privacy Policy (<a
          target="_blank"
          href={env.PUBLIC_PRIVACY_POLICY_URL || "/privacy-policy.pdf"}>link</a
        >)?
      </p>
      <div class="radio-group">
        <label class="radio-button">
          <input
            type="radio"
            checked={radio1}
            on:change={() => {
              radio1 = true;
            }}
          /> Yes
        </label>
        <br />
        <label class="radio-button">
          <input
            type="radio"
            checked={!radio1}
            on:change={() => {
              radio1 = false;
            }}
          /> No
        </label>
      </div>

      <p class="paragraph">
        Do you agree to share your data with third parties?
      </p>
      <div class="radio-group">
        <label class="radio-button">
          <input
            type="radio"
            checked={radio2}
            on:change={() => {
              radio2 = true;
            }}
          /> Yes
        </label>
        <br />
        <label class="radio-button">
          <input
            type="radio"
            checked={!radio2}
            on:change={() => {
              radio2 = false;
            }}
          /> No
        </label>
      </div>

      <p class="disclaimer">
        Disclaimer: <b>Do not provide your real personal data</b>. Those pages
        offer a development preview of the SERMAS Toolkit. We may use some data
        such as audio recording and conversation with the avatars o improve the
        system. During the interaction, you might be asked to provide your data
        to simulate a real service. For this reason, if you do not want to share
        your data we recommend using fictional data only.
      </p>

      <p class="paragraph">Do you want to proceed?</p>
      <div>
        <button
          class="button is-primary"
          disabled={!(radio1 && radio2)}
          on:click={() => setPrivacy("yes")}>Yes</button
        >
        <button class="button is-secondary" on:click={() => setPrivacy("no")}
          >No</button
        >
      </div>
    </div>
  </div>
{/if}

<style lang="scss">
  @import "../../variables.scss";

  .fullscreen {
    position: absolute;
    z-index: 99999999;
    background-color: rgba($primary, 0.75);
    width: 100%;
    height: 100%;
  }

  .popup {
    background-color: rgba(255, 255, 255, 0.9);
    margin: 2em 15%;
    padding: 1em;
    text-align: center;
    border-radius: 16px;
  }

  .disclaimer {
    text-align: justify;
    font-size: 14px;
  }

  .paragraph {
    margin-bottom: 0.5em !important;
  }

  .radio-group {
    margin-bottom: 1em;
  }
</style>
