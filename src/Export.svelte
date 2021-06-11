<script lang="ts">
	import Papa from 'papaparse';
	import { saveAs } from 'file-saver';
	import type { Question } from './Question';

	export let questions: Question[];
	export let close: () => void;
	let exportLimit: number = 8;
	let exportThreshold: number = 3;
	let exportPercentages: boolean = true;

	function exportCsv() {
		let exportQuestions: Question[] = JSON.parse(JSON.stringify(questions));
		if (exportPercentages) convertAnswersToPercentages(exportQuestions);

		let exportResults = [];
		exportQuestions.forEach((q) => {
			let answers = q.answers
				.slice(0, exportLimit)
				.filter((a) => a.points >= exportThreshold)
				.map((a) => `${a.points} - ${a.text}`);
			exportResults.push([q.text, ...answers]);
		});
		let outputBlob = new Blob([
			Papa.unparse(exportResults, {
				quotes: true,
				header: false,
			}),
		]);
		saveAs(outputBlob, 'results.csv');
		close();
	}

	function exportJson() {
		let exportQuestions = JSON.parse(JSON.stringify(questions));
		if (exportPercentages) convertAnswersToPercentages(exportQuestions);

		let exportResults = exportQuestions.map((q) => {
			return {
				text: q.text,
				answers: q.answers
					.slice(0, exportLimit)
					.filter((a) => a.points >= exportThreshold)
					.map((a) => ({
						text: a.text,
						points: a.points,
					})),
			};
		});
		let outputBlob = new Blob([JSON.stringify(exportResults)]);
		saveAs(outputBlob, 'results.json');
		close();
	}

	function convertAnswersToPercentages(questions: Question[]) {
		questions.forEach((q) => {
			let totalAnswers = q.answers.map((a) => a.points).reduce((t, p) => t + p);
			q.answers.forEach((a) => (a.points = Math.round((a.points * 100) / totalAnswers)));
		});
	}
</script>

<div class="card m-4">
	<div class="card-header fs-2">Export Results</div>
	<div class="card-body">
		<div class="form-group">
			<label for="limit-input">Number of answers to export</label>
			<input id="limit-input" type="number" class="form-control" bind:value={exportLimit} />
		</div>
		<div class="form-group">
			<label for="threshold-input">Minimum point value of exported answers</label>
			<input id="threshold-input" type="number" class="form-control" bind:value={exportThreshold} />
		</div>
		<div class="form-check">
			<input id="percentage-checkbox" type="checkbox" class="form-check-input" bind:checked={exportPercentages} />
			<label for="percentage-checkbox" class="form-check-label">Output as percentage</label>
		</div>
	</div>
	<div class="card-footer">
		<button class="btn btn-danger" on:click={close}>
			<i class="fas fa-times" />
			Cancel
		</button>
		<button class="btn btn-success" on:click={exportCsv}>
			<i class="fas fa-file-alt" />
			Export as CSV
		</button>
		<button class="btn btn-success" on:click={exportJson}>
			<i class="fas fa-file-code" />
			Export as JSON
		</button>
	</div>
</div>
