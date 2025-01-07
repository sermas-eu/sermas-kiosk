<script lang="ts">
    import { toolkit } from "$lib";
    import {
        type QuizContentDto,
        UI_INTERACTION_TOPIC,
        type QuizAnswerDto,
        type UIInteractionEventDto,
    } from "@sermas/toolkit";

    export let content: QuizContentDto;
    export let metadata: Record<string, any> | undefined;
    let selected = -1;

    const clicked = (answer: QuizAnswerDto, idx: number) => {
        if (selected > -1) return;
        selected = idx;
        // console.warn(`selected answerId=${answer.answerId}`);
        const payload = {
            appId: toolkit.getAppId(),
            sessionId: toolkit.getSessionId(),
            moduleId: "avatar",
            interaction: {
                context: {
                    answerId: answer.answerId,
                    ...(metadata || {}),
                },
                element: "quiz",
                value: answer.answer,
            },
        } as UIInteractionEventDto;
        toolkit.getBroker().publish(`${UI_INTERACTION_TOPIC}/avatar`, payload);
    };
</script>

<div class="quiz">
    <div class="quiz-question">{content.question}</div>
    {#each content.answers as a, idx}
        <div class="quiz-answer">
            <button
                on:click={() => clicked(a, idx)}
                class="button is-multiline is-primary sermas-button"
            >
                {a.answer}
            </button>
        </div>
    {/each}
</div>

<style lang="scss">
    @import "../../../variables.scss";

    .quiz {
        // width: calc(var(--ui-content-width) / 1.5);
    }
    .quiz-answer button {
        text-wrap: wrap;
        margin: 0.5em 0;
        padding: 0.5em;
        height: auto;
    }

    .button.is-multiline {
        min-height: 2.25em;
        white-space: break-spaces;
        height: auto;
        flex-direction: column;
    }

    @include mobile-view {
        .quiz {
            width: 100%;
        }
    }
</style>
