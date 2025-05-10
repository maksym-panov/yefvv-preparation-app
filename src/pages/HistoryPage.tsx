import type { FC } from 'react';
import { Box, Typography, List, ListItemButton, Chip } from '@mui/material';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { SessionContext } from '../context/SessionContext';

const HistoryPage: FC = () => {
    const { history } = useContext(SessionContext);

    return (
        <Box px={2} py={1}>
            <Typography variant="h4" gutterBottom>
                Історія тестувань
            </Typography>
            <List disablePadding>
                {history.map((e) => {
                    const minutes = Math.floor(e.duration / 60);
                    const seconds = String(e.duration % 60).padStart(2, '0');
                    const durationText = `${minutes}:${seconds}`;
                    return (
                        <ListItemButton
                            key={e.id}
                            component={Link}
                            to={`/history/${e.id}`}
                            sx={{
                                mb: 2,
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 1,
                                p: 2,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <Box>
                                <Typography variant="body1">{e.quiz.name}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {e.raw}/140 тестових балів
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {e.scaled}/200 за шкалою ЗНО
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Тривалість: {durationText}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {new Date(e.date).toLocaleString()}
                                </Typography>
                            </Box>
                            <Chip
                                label={e.scaled === 0 ? 'Не складено' : 'Складено'}
                                color={e.scaled === 0 ? 'error' : 'success'}
                                size="medium"
                                variant="outlined"
                            />
                        </ListItemButton>
                    );
                })}
            </List>
        </Box>
    );
};

export default HistoryPage;
