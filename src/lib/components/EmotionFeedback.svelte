<script lang="ts">
    import { type Emotion } from "@sermas/toolkit/dto";

    import { toolkit } from "$lib";
    import { type UserCharacterizationEventDto } from "@sermas/api-client";
    import { logger } from "@sermas/toolkit/utils";
    import { onDestroy, onMount } from "svelte";
    import angry from "../assets/images/emotion-feedback/angry.png";
    import disgust from "../assets/images/emotion-feedback/disgust.png";
    import fear from "../assets/images/emotion-feedback/fear.png";
    import happy from "../assets/images/emotion-feedback/happy.png";
    import neutral from "../assets/images/emotion-feedback/neutral.png";
    import sad from "../assets/images/emotion-feedback/sad.png";
    import surprise from "../assets/images/emotion-feedback/surprise.png";

    export let emotion: Emotion | undefined = undefined;

    let imagePath = neutral;
    $: if (emotion) {
        switch (emotion) {
            case "angry":
                imagePath = angry;
                break;
            case "disgust":
                imagePath = disgust;
                break;
            case "fear":
                imagePath = fear;
                break;
            case "happy":
                imagePath = happy;
                break;
            case "neutral":
                imagePath = neutral;
                break;
            case "sad":
                imagePath = sad;
                break;
            case "surprise":
                imagePath = surprise;
                break;
            default:
                imagePath = neutral;
                break;
        }
    }

    const onDetectionCharacterization = (ev: UserCharacterizationEventDto) => {
        emotion = ev.detections[0].emotion.value as Emotion;
        logger.debug(`User emotion detected: ${emotion}`);
    };

    onMount(() => {
        toolkit.on("detection.characterization", onDetectionCharacterization);
    });

    onDestroy(() => {
        toolkit.off("detection.characterization", onDetectionCharacterization);
    });
</script>

<div class="emotion-feedback">
    <img src={imagePath} alt="Current emotion" />
</div>

<style>
    .emotion-feedback {
        /* position: absolute;
        z-index: 9999;
        left: 22px;
        top: 160px; */
        width: 30px;
    }
</style>
