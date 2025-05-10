import type { FC, JSX } from 'react';
import { useState, useContext } from 'react';
import {
    Box,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    IconButton,
    Divider,
    Tooltip,
    useTheme,
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import HistoryIcon from '@mui/icons-material/History';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { SessionContext } from '../context/SessionContext';

export const Sidebar: FC = () => {
    const { activeSession } = useContext(SessionContext);
    const [collapsed, setCollapsed] = useState(false);
    const theme = useTheme();
    const location = useLocation();

    const items = [
        { to: '/', text: 'Головна', icon: <HomeIcon /> },
        { to: '/history', text: 'Історія тестувань', icon: <HistoryIcon /> },
        activeSession && {
            to: `/quiz/${activeSession.quiz.urlSuffix}`,
            text: 'Продовжити тест',
            icon: <PlayCircleOutlineIcon />,
        },
    ].filter(Boolean) as { to: string; text: string; icon: JSX.Element }[];

    return (
        <Box
            component="nav"
            sx={{
                width: collapsed ? 56 : 240,
                transition: 'width 0.3s ease',
                height: '100vh',
                borderRight: `1px solid ${theme.palette.divider}`,
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'background.paper',
                flexShrink: 0,
            }}
        >
            <Box sx={{ p: 1, display: 'flex', justifyContent: collapsed ? 'center' : 'flex-end' }}>
                <Tooltip title={collapsed ? 'Expand' : 'Collapse'}>
                    <IconButton size="small" onClick={() => setCollapsed(!collapsed)}>
                        {collapsed ? <MenuIcon /> : <ChevronLeftIcon />}
                    </IconButton>
                </Tooltip>
            </Box>

            <Divider />

            <List sx={{ flexGrow: 1 }}>
                {items.map(({ to, text, icon }) => {
                    const selected = location.pathname === to;
                    return (
                        <ListItemButton
                            key={to}
                            component={Link}
                            to={to}
                            selected={selected}
                            sx={{
                                py: 1.5,
                                px: collapsed ? 1 : 2,
                                justifyContent: collapsed ? 'center' : 'flex-start',
                                '&:not(.Mui-selected):hover': {
                                    bgcolor: theme.palette.action.hover,
                                },
                                '&.Mui-selected, &.Mui-selected:hover': {
                                    bgcolor: theme.palette.primary.main,
                                    color: theme.palette.primary.contrastText,
                                },
                                '&.Mui-selected .MuiListItemIcon-root': {
                                    color: theme.palette.primary.contrastText,
                                },
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    minWidth: 0,
                                    mr: collapsed ? 0 : 2,
                                    justifyContent: 'center',
                                }}
                            >
                                {icon}
                            </ListItemIcon>
                            {!collapsed && <ListItemText primary={text} />}
                        </ListItemButton>
                    );
                })}
            </List>

            <Box sx={{ p: 2, textAlign: 'center', fontSize: '1rem', color: 'text.secondary' }}>
                {collapsed ? '©' : '© 2025 Maksym Panov'}
            </Box>
        </Box>
    );
};
