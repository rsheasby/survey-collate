<script lang="ts">
    import { onMount } from "svelte";
    import { Question, Answer, removeAnswer, sortAnswers } from "./Question";

    export let questions: Question[];
    let undoState: Question[][] = [];
    let currentQuestionNumber: number = 0;

    $: currentQuestion = questions[currentQuestionNumber];
    $: currentAnswers = currentQuestion.answers;
    $: selectedBaseAnswer = currentAnswers.filter(a => a.isBaseSelected)?.[0];
    $: selectedMergeAnswers = currentAnswers.filter(a => a.isMergeSelected);
    $: canGoLeft = currentQuestionNumber > 0;
    $: canGoRight = currentQuestionNumber < questions.length - 1;
    $: canMerge = (selectedBaseAnswer && selectedMergeAnswers.length > 0);
    $: canUndo = undoState.length > 0;

    function goLeft() {
        if (canGoLeft) currentQuestionNumber--;
    }

    function goRight() {
        if (canGoRight) currentQuestionNumber++;
    }

    function selectAnswer(answer: Answer) {
        if (selectedBaseAnswer === undefined)
            answer.isBaseSelected = true;
        else if (selectedBaseAnswer === answer)
            clearAnswerSelections();
        else
            answer.isMergeSelected = !answer.isMergeSelected;
        currentAnswers = currentAnswers;
    }

    function clearAnswerSelections() {
        currentAnswers.forEach(a => {
            a.isBaseSelected = false;
            a.isMergeSelected = false;
        });
    }

    function mergeAnswers() {
        if (!canMerge)
            return;

        undoState.push(JSON.parse(JSON.stringify(questions)));
        undoState = undoState;
        currentAnswers.filter(a => a.isMergeSelected).forEach(a => {
            selectedBaseAnswer.points += a.points;
            currentQuestion.answers = removeAnswer(currentQuestion.answers, a.text);
        });
        clearAnswerSelections();
        currentQuestion.answers = sortAnswers(currentQuestion.answers);
    }

    function undo() {
        questions = undoState.pop();
        undoState = undoState;
    }
</script>

<div id="collate-card" class="card m-4">
    <div id="collate-card-header" class="card-header gap-2 fs-2">
        <div>
            <button
                class="nav-button"
                class:text-secondary={!canGoLeft}
                disabled={!canGoLeft}
                on:click={goLeft}
            >
                <i class="far fa-arrow-alt-circle-left" />
            </button>
        </div>
        <div id="current-question-text-container">
            {currentQuestion.text}
        </div>
        <div>
            <button
                class="nav-button"
                class:text-secondary={!canGoRight}
                disabled={!canGoRight}
                on:click={goRight}
            >
                <i class="far fa-arrow-alt-circle-right" />
            </button>
        </div>
    </div>
    <div class="card-body d-grid">
        {#each currentAnswers as answer}
            <button
                class="btn"
                class:btn-outline-dark={!answer.isBaseSelected &&
                    !answer.isMergeSelected}
                class:btn-success={answer.isBaseSelected}
                class:btn-primary={answer.isMergeSelected}
                on:click={() => selectAnswer(answer)}>{answer.points} - {answer.text}</button
            >
        {/each}
    </div>
    <div id="collate-card-footer" class="card-footer gap-2">
        <button class="btn btn-primary" on:click={undo} disabled={!canUndo}>
            <i class="fas fa-undo"></i>
            Undo
        </button>
        <button class="btn btn-success" on:click={mergeAnswers} disabled={!canMerge}>
            <i class="fas fa-code-branch"></i>
            Merge
        </button>
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
        display: grid;
        grid-auto-flow: column;
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
