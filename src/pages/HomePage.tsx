import type { FC } from 'react';
import {
    Box,
    Typography,
    List,
    ListItem,
    Button,
    Dialog,
    DialogTitle,
    DialogActions,
    TextField,
    InputAdornment,
} from '@mui/material';
import { useContext, useState, useMemo, type ChangeEvent } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import type { QuizConfig } from '../config/quizzes';
import { quizzes } from '../config/quizzes';
import { SessionContext } from '../context/SessionContext';
import { useNavigate } from 'react-router-dom';

const HomePage: FC = () => {
    const { startSession, activeSession } = useContext(SessionContext);
    const navigate = useNavigate();

    const [open, setOpen] = useState(false);
    const [quiz, setQuiz] = useState<QuizConfig | null>(null);
    const [search, setSearch] = useState('');

    const choose = (q: QuizConfig) => {
        setQuiz(q);
        setOpen(true);
    };
    const cancel = () => setOpen(false);
    const confirm = () => {
        if (quiz && !activeSession) {
            startSession(quiz);
            navigate(`/quiz/${quiz.urlSuffix}`);
        }
        setOpen(false);
    };

    const filteredQuizzes = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return quizzes;
        return quizzes.filter((q) => q.name.toLowerCase().includes(term));
    }, [search]);

    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    return (
        <Box px={4}>
            <Typography variant="h4" gutterBottom>
                Доступні тести
            </Typography>

            <Box mb={3} maxWidth={400}>
                <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    placeholder="Пошук тесту..."
                    value={search}
                    onChange={handleSearchChange}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>

            <List>
                {filteredQuizzes.map((q) => (
                    <ListItem key={q.urlSuffix} disableGutters>
                        <Button
                            variant="contained"
                            disabled={!!activeSession}
                            onClick={() => choose(q)}
                        >
                            {q.name}
                        </Button>
                    </ListItem>
                ))}
                {filteredQuizzes.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                        Нічого не знайдено.
                    </Typography>
                )}
            </List>

            <Dialog open={open} onClose={cancel}>
                <DialogTitle>Ви впевнені, що хочете почати це тестування?</DialogTitle>
                <DialogActions>
                    <Button onClick={cancel}>Ні</Button>
                    <Button onClick={confirm} autoFocus>
                        Так
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default HomePage;
