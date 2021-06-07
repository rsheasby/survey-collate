export class Question {
    text: string;
    answers: Map<string, number>
}

export function sortAnswers(answers: Map<string, number>): Map<string, number> {
    return new Map([...answers.entries()].sort((a, b) => b[1] - a[1]));
}