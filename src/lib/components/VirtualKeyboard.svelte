<script lang="ts">
  import { run } from 'svelte/legacy';

import KioskBoard from 'kioskboard';
import { tick } from "svelte";
import { createEventDispatcher } from 'svelte';
import {
    appSettingsStore,
  } from "$lib/store";
    import { sleep } from '@sermas/api-client';

const dispatch = createEventDispatcher();

  interface Props {
    showKeyboard: boolean;
    inputValue: string;
    placeholder: string;
  }

  let { showKeyboard = $bindable(), inputValue = $bindable(), placeholder }: Props = $props();
let field: HTMLInputElement = $state()


const options = {
    /*!* Required* An Array of Objects has to be defined for the custom keys. Hint: Each object creates a row element (HTML) on the keyboard.* e.g. [{"key":"value"}, {"key":"value"}] => [{"0":"A","1":"B","2":"C"}, {"0":"D","1":"E","2":"F"}]*/
    keysArrayOfObjects: [],
    /*!* Required only if "keysArrayOfObjects" is "null".* The path of the "kioskboard-keys-${langugage}.json" file must be set to the "keysJsonUrl" option. (XMLHttpRequest to get the keys from JSON file.)* e.g. '/Content/Plugins/KioskBoard/dist/kioskboard-keys-english.json'*/
    keysJsonUrl: '/kioskboard-keys-english.json',
    /** Optional: (Special Characters)* An Array of Strings can be set to override the built-in special characters.* e.g. ["#", "€", "%", "+", "-", "*"]*/
    // keysSpecialCharsArrayOfStrings: ['.',',','/'],
    /** Optional: (Numpad Keys)* An Array of Numbers can be set to override the built-in numpad keys. (From 0 to 9, in any order.)* e.g. [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]*/
    //keysNumpadArrayOfNumbers: null,
    // Optional: (Other Options)// Language Code (ISO 639-1) for custom keys (for language support) => e.g. "de" || "en" || "fr" || "hu" || "tr" etc...
    language: 'en',
    // The theme of keyboard => "light" || "dark" || "flat" || "material" || "oldschool"
    theme: 'flat',
    // Scrolls the document to the top or bottom(by the placement option) of the input/textarea element. Prevented when "false"
    autoScroll: false,
    // Uppercase or lowercase to start. Uppercased when "true"
    capsLockActive: false,
    // Allow or prevent real/physical keyboard usage. Prevented when "false"// In addition, the "allowMobileKeyboard" option must be "true" as well, if the real/physical keyboard has wanted to be used.
    allowRealKeyboard: false,
    // Allow or prevent mobile keyboard usage. Prevented when "false"
    allowMobileKeyboard: false,
    // CSS animations for opening or closing the keyboard
    cssAnimations: true,
    // CSS animations duration as millisecond
    cssAnimationsDuration: 250,
    // CSS animations style for opening or closing the keyboard => "slide" || "fade"
    //cssAnimationsStyle: 'slide',
    // Enable or Disable Spacebar functionality on the keyboard. The Spacebar will be passive when "false"
    keysAllowSpacebar: true,
    // Text of the Space key (Spacebar). Without text => " "
    keysSpacebarText: 'Space',
    // Font family of the keys
    keysFontFamily: 'sans-serif',
    // Font size of the keys
    keysFontSize: '22px',
    // Font weight of the keys
    keysFontWeight: 'normal',
    // Size of the icon keys
    keysIconSize: '25px',
    // Text of the Enter key (Enter/Return). Without text => " "
    keysEnterText: 'Done',
    // The callback function of the Enter key. This function will be called when the enter key has been clicked.
    keysEnterCallback: undefined,
    // The Enter key can close and remove the keyboard. Prevented when "false"
    keysEnterCanClose: true,
  }


const openKeyboard = async () => {
  if (!$appSettingsStore.virtualKeyboardEnabled) {
    showKeyboard = false
    return
  }
  await tick();
  KioskBoard.run('.js-kioskboard-input', options)
  await sleep(500);
  document.getElementById("keyboard-input-text")?.focus()
}

const done = (str: string) => {
  dispatch('virtual-keyboard-input', {
      text: str
  });
}


run(() => {
    if (showKeyboard) {
    openKeyboard()
  }
  });
</script>

{#if showKeyboard}
  <div class="virtual-keyboard">
    <div class="keyboard-input-box field has-addons is-flex is-justify-content-center">
      <div class="control">
        <input id="keyboard-input-text" bind:this={field} bind:value={inputValue} class="input js-kioskboard-input is-large" readonly type="text" data-kioskboard-specialcharacters="true"  placeholder={placeholder}>
      </div>
      <div class="control">
        <button class="button is-large sermas-button" onclick={() => done(field?.value)}>
          Confirm
        </button>
        </div>
        <div class="control">
        <button class="button is-large sermas-button" onclick={() => done(inputValue)}>
          Cancel
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .virtual-keyboard {
    position:fixed;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.4);
    top: 0;
    left: 0;
    z-index: 50;
    text-align: center;
  }
  .keyboard-input-box {
    position:relative;
    width: 100%;
    margin-left: 0;
    margin-top: 250px;
  }
  .keyboard-input-box input {
    width: 100%;
  }
</style>