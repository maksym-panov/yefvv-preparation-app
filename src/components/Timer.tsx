import type { FC } from 'react';
import { Box, Typography, LinearProgress, useTheme } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { SessionContext } from '../context/SessionContext';

export const Timer: FC = () => {
    const theme = useTheme();
    const { activeSession, finishSession } = useContext(SessionContext);
    const [remaining, setRemaining] = useState<number>(0);

    useEffect(() => {
        if (!activeSession) return;
        const update = () => {
            const now = dayjs();
            const left = dayjs(activeSession.expires).diff(now, 'second');
            if (left <= 0) {
                finishSession();
            } else {
                setRemaining(left);
            }
        };
        update();
        const iv = setInterval(update, 1000);
        return () => clearInterval(iv);
    }, [activeSession, finishSession]);

    const minutes = String(Math.floor(remaining / 60)).padStart(2, '0');
    const seconds = String(remaining % 60).padStart(2, '0');

    let progress: number | undefined;
    if (activeSession) {
        const totalMs = dayjs(activeSession.expires).diff(
            dayjs(activeSession.start),
            'millisecond',
        );
        const leftMs = remaining * 1000;
        progress = Math.max(0, Math.min(100, (leftMs / totalMs) * 100));
    }

    return (
        <Box
            width={260}
            sx={{
                p: 1,
                border: `1px solid ${theme.palette.divider}`,
                color: theme.palette.primary.main,
                borderRadius: 2,
                // boxShadow: 3,
                mb: 2,
            }}
        >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle2">Залишилось часу</Typography>
                <Typography variant="subtitle1" sx={{ fontFamily: 'Monospace' }}>
                    {minutes}:{seconds}
                </Typography>
            </Box>
            <LinearProgress
                variant={progress !== undefined ? 'determinate' : 'indeterminate'}
                value={progress}
                sx={{ height: 6, borderRadius: 3 }}
            />
        </Box>
    );
};
