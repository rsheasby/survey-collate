<script lang="ts">
    import { onMount } from "svelte";
    import { Question, Answer, removeAnswer, sortAnswers } from "./Question";

    import Export from "./Export.svelte";

    export let questions: Question[];
    let undoState: Question[][] = [];
    let currentQuestionNumber: number = 0;
    let newText: string = null;
    let exportDialogShown: boolean = false;

    $: currentQuestion = questions[currentQuestionNumber];
    $: currentAnswers = currentQuestion.answers;
    $: selectedBaseAnswer = currentAnswers.filter((a) => a.isBaseSelected)?.[0];
    $: selectedMergeAnswers = currentAnswers.filter((a) => a.isMergeSelected);
    $: canGoLeft = currentQuestionNumber > 0;
    $: canGoRight = currentQuestionNumber < questions.length - 1;
    $: canRename = selectedBaseAnswer;
    $: canMerge = canRename && selectedMergeAnswers.length > 0;
    $: canDelete = canRename;
    $: canUndo = undoState.length > 0;

    function goLeft() {
        if (canGoLeft) {
            currentQuestionNumber--;
            clearAnswerSelections();
        }
    }

    function goRight() {
        if (canGoRight) {
            currentQuestionNumber++;
            clearAnswerSelections();
        }
    }

    function openExportDialog() {
        exportDialogShown = true;
    }

    function closeExportDialog() {
        exportDialogShown = false;
    }

    function selectAnswer(answer: Answer) {
        if (selectedBaseAnswer === undefined) {
            answer.isBaseSelected = true;
            newText = answer.text;
        } else if (selectedBaseAnswer === answer) clearAnswerSelections();
        else answer.isMergeSelected = !answer.isMergeSelected;
        currentAnswers = currentAnswers;
    }

    function clearAnswerSelections() {
        newText = null;
        questions.forEach((q) =>
            q.answers.forEach((a) => {
                a.isBaseSelected = false;
                a.isMergeSelected = false;
            })
        );
    }

    function mergeAnswers() {
        if (!canRename) return;

        undoState.push(JSON.parse(JSON.stringify(questions)));
        undoState = undoState;
        currentAnswers
            .filter((a) => a.isMergeSelected)
            .forEach((a) => {
                selectedBaseAnswer.points += a.points;
                currentQuestion.answers = removeAnswer(
                    currentQuestion.answers,
                    a.text
                );
            });
        selectedBaseAnswer.text = newText;
        clearAnswerSelections();
        currentQuestion.answers = sortAnswers(currentQuestion.answers);
    }

    function deleteSelectedAnswers() {
        undoState.push(JSON.parse(JSON.stringify(questions)));
        undoState = undoState;

        if (!selectedBaseAnswer)
            return;
        currentQuestion.answers = removeAnswer(currentQuestion.answers, selectedBaseAnswer.text);
        selectedMergeAnswers?.forEach(a => {
            currentQuestion.answers = removeAnswer(currentQuestion.answers, a.text);
        });
        clearAnswerSelections();
    }

    function undo() {
        questions = undoState.pop();
        undoState = undoState;
        clearAnswerSelections();
    }
</script>

{#if exportDialogShown}
    <Export {questions} close={closeExportDialog} />
{:else}
    <div id="collate-card" class="card m-4">
        <div id="collate-card-header" class="card-header gap-4 fs-2">
            <button
                class="btn btn-primary nav-button"
                disabled={!canGoLeft}
                on:click={goLeft}
            >
                <i class="far fa-arrow-left" />
            </button>
            <div id="current-question-text-container">
                {currentQuestion.text}
            </div>
            {#if canGoRight}
                <button
                    class="btn btn-primary nav-button"
                    disabled={!canGoRight}
                    on:click={goRight}
                >
                    <i class="far fa-arrow-right" />
                </button>
            {:else}
                <button
                    class="btn btn-success nav-button"
                    on:click={openExportDialog}
                >
                    <i class="far fa-file-download" />
                </button>
            {/if}
        </div>
        <div id="collate-card-answers-container" class="card-body gap-2">
            {#each currentAnswers as answer}
                <button
                    class="btn"
                    class:btn-outline-dark={!answer.isBaseSelected &&
                        !answer.isMergeSelected}
                    class:btn-success={answer.isBaseSelected}
                    class:btn-primary={answer.isMergeSelected}
                    on:click={() => selectAnswer(answer)}
                    >{answer.points} - {answer.text}</button
                >
            {/each}
        </div>
        <div id="collate-card-footer" class="card-footer gap-2">
            <button class="btn btn-primary" on:click={undo} disabled={!canUndo}>
                <i class="fas fa-undo" />
                Undo
            </button>
            <button
                class="btn btn-danger"
                on:click={deleteSelectedAnswers}
                disabled={!canDelete}
            >
                <i
                    class="fas fa-trash"
                />
                Delete
            </button>
            <input
                id="new-text-input"
                type="text"
                class="form-control"
                bind:value={newText}
                disabled={newText === null}
            />
            <button
                class="btn btn-success"
                on:click={mergeAnswers}
                disabled={!canRename}
            >
                <i
                    class="fas {canMerge ? 'fa-code-branch' : 'fa-pencil-alt'}"
                />
                {canMerge ? "Merge" : "Rename"}
            </button>
        </div>
    </div>
{/if}

<style>
    #collate-card {
        max-width: 800px;
        width: 100%;
    }

    #collate-card-header {
        width: 100%;
        display: grid;
        grid-auto-flow: column;
        grid-template-columns: auto 1fr auto;
        grid-template-rows: 1fr;
        align-items: stretch;
        position: sticky;
        top: 0;
        background-color: white;
    }

    .nav-button {
        line-height: 1;
        margin: 0;
    }

    #collate-card-footer {
        display: grid;
        grid-auto-flow: column;
        grid-template-columns: auto auto 1fr auto;
        align-items: stretch;
        position: sticky;
        bottom: 0;
        background-color: white;
    }

    #collate-card-footer > button {
        margin: 0;
    }

    #collate-card-footer > input {
        margin: 0;
    }

    #current-question-text-container {
        display: flex;
        justify-content: center;
    }

    #collate-card-answers-container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr;
    }

    #collate-card-answers-container > button {
        margin: 0;
    }
</style>
