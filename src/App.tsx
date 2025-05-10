import type { FC } from 'react';
import { useContext, useState, useMemo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, IconButton, CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { lightTheme, darkTheme } from './theme';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { SessionContext } from './context/SessionContext';
import { Sidebar } from './components/Sidebar';
import HomePage from './pages/HomePage';
import QuizPage from './pages/QuizPage';
import HistoryPage from './pages/HistoryPage';
import HistoryDetail from './pages/HistoryDetail';

const App: FC = () => {
    const { activeSession } = useContext(SessionContext);
    const [mode, setMode] = useState<'light' | 'dark'>(
        (localStorage.getItem('mode') as 'light' | 'dark') || 'light',
    );
    const theme = useMemo(() => (mode === 'light' ? lightTheme : darkTheme), [mode]);
    const toggle = () => {
        const next = mode === 'light' ? 'dark' : 'light';
        setMode(next);
        localStorage.setItem('mode', next);
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box display="flex" height="100vh">
                <Sidebar />
                <Box flexGrow={1} display="flex" flexDirection="column">
                    <Box display="flex" justifyContent="flex-end" p={1}>
                        <IconButton onClick={toggle}>
                            {mode === 'light' ? <Brightness4Icon /> : <Brightness7Icon />}
                        </IconButton>
                    </Box>
                    <Box flexGrow={1} p={2} overflow="auto">
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route
                                path="/quiz/:suffix"
                                element={activeSession ? <QuizPage /> : <Navigate to="/" />}
                            />
                            <Route path="/history" element={<HistoryPage />} />
                            <Route path="/history/:id" element={<HistoryDetail />} />
                        </Routes>
                    </Box>
                </Box>
            </Box>
        </ThemeProvider>
    );
};

export default App;
