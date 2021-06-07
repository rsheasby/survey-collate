<script lang="ts">
    import { onMount } from 'svelte';
    import type { Question } from './Question';

    export let questions: Question[];

</script>

<div class="card">
    <div class="card-body">
        {questions.length}
    </div>
</div>