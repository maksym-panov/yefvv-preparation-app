export interface QuizConfig {
    name: string;
    path: string;
    pathToImages: string;
    urlSuffix: string;
}
export const quizzes: QuizConfig[] = [
    {
        name: 'ЄФВВ Інформаційні Технології 2024',
        path: '/quizzes/quiz-it-2024/quiz-it-2024.csv',
        pathToImages: '/quizzes/quiz-it-2024/',
        urlSuffix: 'it-2024',
    },
];
