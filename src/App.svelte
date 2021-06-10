<script lang="ts">
	import Papa from 'papaparse';
	import Sugar from 'sugar';
	import type { Question, Answer } from './Question';
	import { addAnswer, sortAnswers } from './Question';

	import Collation from './Collation.svelte';

	let questions: Question[] = [
		{
			text: 'test',
			answers: [],
		},
	];
	let importDone: boolean = false;

	function showFilePopup() {
		let input = document.getElementById('import-file-input');
		input.click();
	}

	function showDragOver(ev: Event) {
		let el: HTMLElement = document.getElementById('dropzone');
		el.classList.add('border-primary');
	}

	function hideDragOver(ev: Event) {
		let el: HTMLElement = document.getElementById('dropzone');
		el.classList.remove('border-primary');
	}

	async function importFile(e: Event | DragEvent) {
		let f: File;
		if (e instanceof DragEvent) {
			f = e?.dataTransfer?.files?.[0];
		} else {
			const e = document.getElementById('import-file-input') as HTMLInputElement;
			f = e?.files?.[0];
		}
		questions = await processFile(f);
		importDone = true;
	}

	async function processFile(f: File): Promise<Question[]> {
		let questions: Question[] = [];
		let result: Promise<Question[]> = new Promise((resolve, reject) => {
			Papa.parse(f, {
				complete: (results) => {
					const data = results.data;
					// Create questions
					for (let i = data[0][0] === 'Timestamp' ? 1 : 0; i < (data[0] as string[]).length; i++) {
						// Create answers map
						let answers: Answer[] = [];
						for (let j = 1; j < data.length; j++) {
							const answerText = Sugar.String.titleize(data[j][i]);
							answers = addAnswer(answers, answerText);
						}
						// Save question
						questions.push({
							text: data[0][i],
							answers: sortAnswers(answers),
						});
					}
					resolve(questions);
				},
			});
		});
		return result;
	}
</script>

<main>
	{#if importDone}
		<Collation {questions} />
	{:else}
		<div class="card">
			<div class="card-header fs-1">Survey Collate</div>
			<div class="card-body">
				<p>Using this utility is simple:</p>
				<ol>
					<li>Import your Google Forms CSV file containing the survey results</li>
					<li>
						Click answers to rename them,<br />or select multiple to merge them into one answer.
					</li>
					<li>Configure output settings</li>
					<li>Export results</li>
				</ol>
				<div
					id="dropzone"
					class="card border border-5"
					on:drop|preventDefault={importFile}
					on:dragover|preventDefault={showDragOver}
					on:dragleave|preventDefault={hideDragOver}
				>
					<div class="card-body">
						Drag your CSV file here to import it, or
						<a href="#" on:click|preventDefault={showFilePopup}>click here</a>
						<input id="import-file-input" type="file" class="d-none" on:input={importFile} />
					</div>
				</div>
			</div>
		</div>
	{/if}
</main>

<style>
	main {
		display: flex;
		justify-content: center;
		align-items: center;
		min-width: 100%;
		min-height: 100%;
		position: relative;
	}
</style>
