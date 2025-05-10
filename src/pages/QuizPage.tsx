import type { FC } from 'react';
import {
    Box,
    Typography,
    RadioGroup,
    FormControlLabel,
    Radio,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    IconButton,
    useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import { useContext, useEffect, useState } from 'react';
import Papa from 'papaparse';
import { SessionContext } from '../context/SessionContext';
import { Timer } from '../components/Timer';

interface Question {
    question: string;
    A: string;
    B: string;
    C: string;
    D: string;
    answer: string;
}

const QuizPage: FC = () => {
    const theme = useTheme();
    const { activeSession, updateSession, finishSession } = useContext(SessionContext);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [finishDialog, setFinishDialog] = useState(false);
    const [navDialog, setNavDialog] = useState(false);
    const [showImage, setShowImage] = useState(true);

    useEffect(() => {
        setShowImage(true);
    }, []);

    useEffect(() => {
        if (!activeSession) return;
        fetch(activeSession.quiz.path)
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
    }, [activeSession]);

    if (!activeSession || questions.length === 0) {
        return <Typography>Завантаження запитань...</Typography>;
    }

    const current = activeSession.current ?? 0;
    const total = questions.length;
    const page = current + 1;
    const ans = activeSession.answers[current] || { selected: '', correct: false };
    const flagged = activeSession.flagged[current] || false;

    const blockSize = 25;
    const blockIndex = Math.floor((page - 1) / blockSize);
    const start = blockIndex * blockSize + 1;
    const end = Math.min(start + blockSize - 1, total);

    const answeredCount = Object.keys(activeSession.answers).length;
    const flaggedCount = Object.values(activeSession.flagged).filter(Boolean).length;

    const handleSelect = (value: string) =>
        updateSession({
            answers: {
                ...activeSession.answers,
                [current]: { selected: value, correct: value === questions[current].answer },
            },
        });

    const handleFlag = () =>
        updateSession({
            flagged: {
                ...activeSession.flagged,
                [current]: !flagged,
            },
        });

    const handleFinishConfirm = () => {
        finishSession();
        setFinishDialog(false);
    };

    const goTo = (idx: number) => updateSession({ current: idx });
    const goPrev = () => goTo(Math.max(current - 1, 0));
    const goNext = () => goTo(Math.min(current + 1, total - 1));

    const imgUrl = `${activeSession.quiz.pathToImages}${page}.png`;

    return (
        <>
            <Box display="flex" justifyContent="space-between" p={3} sx={{ minHeight: '100vh' }}>
                <Box flex={1} sx={{ minWidth: 0, pr: 2 }}>
                    <Typography variant="h5" gutterBottom>
                        {activeSession.quiz.name}
                    </Typography>

                    <Typography
                        variant="h6"
                        mb={2}
                        sx={{ overflowWrap: 'break-word', whiteSpace: 'normal' }}
                    >
                        Питання {page}/{total}: {questions[current]?.question}
                    </Typography>

                    {showImage && (
                        <Box
                            component="img"
                            src={imgUrl}
                            alt={`Питання ${page}`}
                            sx={{ maxWidth: '50%', mb: 2 }}
                            onError={() => setShowImage(false)}
                        />
                    )}

                    <RadioGroup value={ans.selected} onChange={(e) => handleSelect(e.target.value)}>
                        {(['A', 'B', 'C', 'D'] as const).map((label) => (
                            <FormControlLabel
                                key={label}
                                value={label}
                                control={<Radio />}
                                sx={{ my: 1 }}
                                label={questions[current] ? questions[current][label] : ''}
                            />
                        ))}
                    </RadioGroup>
                </Box>

                <Box
                    width={260}
                    sx={{
                        flexShrink: 0,
                        borderLeft: `1px solid ${theme.palette.divider}`,
                        pl: 2,
                    }}
                >
                    <Typography variant="h6" gutterBottom>
                        Навігація
                    </Typography>
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(5, 46px)',
                            gap: theme.spacing(1),
                        }}
                    >
                        {Array.from({ length: end - start + 1 }, (_, i) => {
                            const num = start + i;
                            const idx = num - 1;
                            const isSelected = idx === current;
                            const isAnswered = !!activeSession.answers[idx]?.selected;
                            const isFlagged = activeSession.flagged[idx];
                            return (
                                <Box key={num} sx={{ position: 'relative' }}>
                                    <Button
                                        size="small"
                                        variant={isSelected ? 'contained' : 'outlined'}
                                        onClick={() => goTo(idx)}
                                        sx={{
                                            width: 42,
                                            height: 42,
                                            minWidth: 0,
                                            p: 0,
                                            fontWeight: 'bold',
                                            bgcolor:
                                                isAnswered && !isSelected ? 'lightgrey' : undefined,
                                            color: isSelected
                                                ? theme.palette.primary.contrastText
                                                : undefined,
                                            border: isFlagged ? '2px solid orange' : undefined,
                                        }}
                                    >
                                        {num}
                                    </Button>
                                </Box>
                            );
                        })}
                    </Box>
                    <Box textAlign="center" mt={1} width={260}>
                        <IconButton
                            onClick={() => setNavDialog(true)}
                            size="medium"
                            sx={{
                                width: '100%',
                                height: 36,
                                border: `1px solid ${theme.palette.primary.main}`,
                                color: theme.palette.primary.main,
                                '&:hover': { bgcolor: theme.palette.primary.light, color: 'white' },
                                borderRadius: 1,
                            }}
                        >
                            <FormatListBulletedIcon />
                        </IconButton>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mt={2} mb={4} width={260}>
                        <Button
                            disabled={current === 0}
                            variant="outlined"
                            onClick={goPrev}
                            sx={{ width: '49%' }}
                        >
                            Попереднє
                        </Button>
                        <Button
                            disabled={current === total - 1}
                            variant="contained"
                            onClick={goNext}
                            sx={{ width: '49%' }}
                        >
                            Наступне
                        </Button>
                    </Box>
                    <Box display="flex" justifyContent="space-between" mt={2} mb={2} width={260}>
                        <Button
                            size="small"
                            variant="outlined"
                            color="warning"
                            onClick={handleFlag}
                            sx={{ textTransform: 'none', width: '55%' }}
                        >
                            {flagged ? 'ЗНЯТИ ПОЗНАЧКУ' : 'ПОЗНАЧИТИ'}
                        </Button>
                        <Button
                            size="small"
                            variant={page === total ? 'contained' : 'outlined'}
                            color={page === total ? 'primary' : 'secondary'}
                            sx={{ width: '42%' }}
                            onClick={() => setFinishDialog(true)}
                        >
                            Завершити
                        </Button>
                    </Box>
                    <Timer />
                </Box>
            </Box>

            <Dialog open={finishDialog} onClose={() => setFinishDialog(false)}>
                <DialogTitle>Завершити тест?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Ви відповіли на <strong>{answeredCount}</strong> з <strong>{total}</strong>{' '}
                        питань.
                    </DialogContentText>
                    <DialogContentText>
                        Позначених питань залишилось: <strong>{flaggedCount}</strong>
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setFinishDialog(false)}>Ні</Button>
                    <Button onClick={handleFinishConfirm} autoFocus>
                        Так
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={navDialog} onClose={() => setNavDialog(false)} fullWidth>
                <DialogTitle>
                    Всі питання
                    <IconButton
                        onClick={() => setNavDialog(false)}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <Box p={2}>
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(14, 33px)',
                            gap: theme.spacing(1),
                        }}
                    >
                        {Array.from({ length: total }, (_, i) => {
                            const num = i + 1;
                            const isSelected = i === current;
                            const isAnswered = !!activeSession.answers[i]?.selected;
                            const isFlagged = activeSession.flagged[i];
                            return (
                                <Box key={num} sx={{ position: 'relative' }}>
                                    <Button
                                        size="small"
                                        variant={isSelected ? 'contained' : 'outlined'}
                                        onClick={() => {
                                            goTo(i);
                                            setNavDialog(false);
                                        }}
                                        sx={{
                                            width: 32,
                                            height: 32,
                                            minWidth: 0,
                                            p: 0,
                                            fontWeight: 'bold',
                                            bgcolor:
                                                isAnswered && !isSelected ? 'lightgrey' : undefined,
                                            border: isFlagged ? '2px solid orange' : undefined,
                                        }}
                                    >
                                        {num}
                                    </Button>
                                </Box>
                            );
                        })}
                    </Box>
                </Box>
            </Dialog>
        </>
    );
};

export default QuizPage;
