<script lang="ts">
    import { onMount } from 'svelte';
    import type { Question } from './Question';

    export let questions: Question[];
    let currentQuestionNumber: number = 0;
    $: currentQuestion = questions[currentQuestionNumber];
    $: canGoLeft = currentQuestionNumber > 0;
    $: canGoRight = currentQuestionNumber < (questions.length - 1);

    function goLeft() {
        if (canGoLeft)
            currentQuestionNumber--;
    }

    function goRight() {
        if (canGoRight)
            currentQuestionNumber++;
    }

    function selectAnswer(i: number) {
        console.log([...currentQuestion.answers][i]);
    }
</script>

<div id="collate-card" class="card">
    <div id="collate-card-header" class="card-header gap-3 fs-2">
        <div>
            <button class="nav-button" class:text-secondary={!canGoLeft} disabled={!canGoLeft} on:click={goLeft}>
                <i class="far fa-arrow-alt-circle-left"></i>
            </button>
        </div>
        <div id="current-question-text-container">
            {currentQuestion.text}
        </div>
        <div>
            <button class="nav-button" class:text-secondary={!canGoRight} disabled={!canGoRight} on:click={goRight}>
                <i class="far fa-arrow-alt-circle-right"></i>
            </button>
        </div>
    </div>
    <div class="card-body d-grid">
        {#each [...currentQuestion.answers] as [answer, points], i}
            <button class="btn btn-secondary" on:click={() => selectAnswer(i)}>{answer}</button>
        {/each}
    </div>
    <div id="collate-card-footer" class="card-footer">
        <button class="btn btn-success">Merge</button>
    </div>
</div>

<style>
    .nav-button {
        line-height: 100%;
        border-radius: 50%;
        padding: 0;
        margin: 0;
    }

    #collate-card {
        max-width: 600px;
        width: 100%;
    }

    #collate-card-header {
        width: 100%;
        display: grid;
        grid-auto-flow: column;
        grid-template-columns: auto 1fr auto;
        align-items: center;
    }

    #collate-card-footer {
        display: flex;
        justify-content: flex-end;
    }

    #collate-card-footer > button {
        margin: 0;
    }

    #current-question-text-container {
        display: flex;
        justify-content: center;
    }
</style>