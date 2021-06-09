export class Question {
    text: string;
    answers: Answer[]
}

export class Answer {
    text: string;
    points: number;
    isBaseSelected: boolean;
    isMergeSelected: boolean;
}

export function addAnswer(answers: Answer[], text: string): Answer[] {
    for (let i = 0; i < answers.length; i++) {
        if (answers[i].text === text) {
            answers[i].points++;
            return answers;
        }
    }
    answers.push({
        text: text,
        points: 1,
        isBaseSelected: false,
        isMergeSelected: false
    });
    return answers;
}

export function removeAnswer(answers: Answer[], text: string): Answer[] {
    return answers.filter(a => a.text !== text);
}

export function sortAnswers(answers: Answer[]): Answer[] {
    return answers.sort((a, b) => b.points - a.points);
}