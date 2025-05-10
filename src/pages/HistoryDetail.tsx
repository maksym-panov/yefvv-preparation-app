import type { FC } from 'react';
import { Box, Typography, Divider, Paper, useTheme } from '@mui/material';
import { useContext, useEffect, useState, useMemo } from 'react';
import Papa from 'papaparse';
import { useParams } from 'react-router-dom';
import { SessionContext } from '../context/SessionContext';

interface Question {
    question: string;
    A: string;
    B: string;
    C: string;
    D: string;
    answer: string;
}

const HistoryDetail: FC = () => {
    const theme = useTheme();
    const { id } = useParams<{ id: string }>();
    const { history } = useContext(SessionContext);
    const entry = useMemo(() => history.find((h) => String(h.id) === id), [history, id]);
    const [questions, setQuestions] = useState<Question[]>([]);

    useEffect(() => {
        if (entry) {
            fetch(entry.quiz.path)
                .then((res) => res.text())
                .then((csv) => {
                    const { data } = Papa.parse<Question>(csv, {
                        header: true,
                        skipEmptyLines: true,
                        transformHeader: (h) => {
                            switch (h.trim()) {
                                case 'Питання':
                                    return 'question';
                                case 'A':
                                case 'B':
                                case 'C':
                                case 'D':
                                    return h;
                                case 'Правильна':
                                    return 'answer';
                                default:
                                    return h;
                            }
                        },
                    });
                    setQuestions(data.filter((q) => q.question && q.answer) as Question[]);
                });
        }
    }, [entry]);

    if (!entry) {
        return <Typography color="error">Запис не знайдено</Typography>;
    }
    if (questions.length === 0) {
        return <Typography>Завантаження питань...</Typography>;
    }

    return (
        <Box p={2}>
            <Typography variant="h4" gutterBottom>
                {entry.quiz.name}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
                Результат: {entry.raw}/140 тестових балів ({entry.scaled}/200)
            </Typography>

            {Object.entries(entry.answers).map(([key, ansRecord]) => {
                const idx = Number(key);
                const q = questions[idx];
                const options: (keyof Question)[] = ['A', 'B', 'C', 'D'];
                const user = ansRecord.selected;
                const correct = q.answer;
                const isCorrect = ansRecord.correct;
                const imgUrl = `${entry.quiz.pathToImages}${idx + 1}.png`;

                return (
                    <Box key={key} mb={3}>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>
                                Питання {idx + 1}: {q.question}
                            </Typography>

                            <Box
                                component="img"
                                src={imgUrl}
                                alt={`Питання ${idx + 1}`}
                                sx={{ maxWidth: '50%', mb: 2 }}
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />

                            {options.map((opt) => {
                                const text = q[opt];
                                const isUser = opt === user;
                                const isRight = opt === correct;
                                let border = 'transparent';
                                if (isRight) border = theme.palette.success.main;
                                if (!isCorrect && isUser) border = theme.palette.error.main;
                                return (
                                    <Box
                                        key={opt}
                                        sx={{
                                            border: `2px solid ${border}`,
                                            borderRadius: 1,
                                            p: 1,
                                            mb: 1,
                                        }}
                                    >
                                        <Typography>
                                            {opt}. {text}
                                        </Typography>
                                    </Box>
                                );
                            })}
                        </Paper>
                        <Box mt={1}>
                            {isCorrect ? (
                                <Paper
                                    sx={{
                                        bgcolor: theme.palette.success.dark,
                                        p: 2,
                                        borderRadius: 1,
                                    }}
                                >
                                    <Typography color={'white'}>
                                        Ви надали правильну відповідь – {correct}
                                    </Typography>
                                </Paper>
                            ) : (
                                <Paper
                                    sx={{
                                        bgcolor: theme.palette.error.dark,
                                        p: 2,
                                        borderRadius: 1,
                                    }}
                                >
                                    <Typography color={'white'}>
                                        Ви надали неправильну відповідь – {user}. Правильна –{' '}
                                        {correct}
                                    </Typography>
                                </Paper>
                            )}
                        </Box>
                        <Divider sx={{ mt: 3 }} />
                    </Box>
                );
            })}
        </Box>
    );
};

export default HistoryDetail;
