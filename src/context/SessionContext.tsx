import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import dayjs from 'dayjs';
import type { QuizConfig } from '../config/quizzes';
import { scaleMap } from '../config/scaleMap';

export interface AnswerRecord {
    selected: string;
    correct: boolean;
}
export interface ActiveSession {
    quiz: QuizConfig;
    answers: Record<number, AnswerRecord>;
    flagged: Record<number, boolean>;
    start: string;
    expires: string;
}
export interface HistoryEntry {
    id: number;
    quiz: QuizConfig;
    raw: number;
    scaled: number;
    answers: Record<number, AnswerRecord>;
    date: string;
    duration: number; // duration in seconds
}

interface SessionContextType {
    activeSession: ActiveSession | null;
    history: HistoryEntry[];
    startSession: (quiz: QuizConfig) => void;
    updateSession: (data: Partial<ActiveSession>) => void;
    finishSession: () => void;
}
export const SessionContext = createContext<SessionContextType>({} as SessionContextType);

interface Props {
    children: ReactNode;
}
export function SessionProvider({ children }: Props) {
    const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
    const [history, setHistory] = useState<HistoryEntry[]>([]);

    useEffect(() => {
        const a = localStorage.getItem('activeSession');
        const h = localStorage.getItem('quizHistory');
        if (a) setActiveSession(JSON.parse(a));
        if (h) setHistory(JSON.parse(h));
    }, []);

    useEffect(() => {
        if (activeSession) {
            localStorage.setItem('activeSession', JSON.stringify(activeSession));
        } else {
            localStorage.removeItem('activeSession');
        }
    }, [activeSession]);

    useEffect(() => {
        localStorage.setItem('quizHistory', JSON.stringify(history));
    }, [history]);

    const startSession = useCallback((quiz: QuizConfig) => {
        const now = dayjs();
        setActiveSession({
            quiz,
            answers: {},
            flagged: {},
            start: now.toISOString(),
            expires: now.add(180, 'minute').toISOString(),
        });
    }, []);

    const updateSession = useCallback((data: Partial<ActiveSession>) => {
        setActiveSession((prev) => (prev ? { ...prev, ...data } : prev));
    }, []);

    const finishSession = useCallback(() => {
        if (!activeSession) return;
        const end = dayjs();
        const start = dayjs(activeSession.start);
        const durationSec = end.diff(start, 'second');

        const raw = Object.values(activeSession.answers).filter((a) => a.correct).length;
        const scaled = scaleMap[raw] || 0;
        const entry: HistoryEntry = {
            id: Date.now(),
            quiz: activeSession.quiz,
            raw,
            scaled,
            answers: activeSession.answers,
            date: end.toISOString(),
            duration: durationSec,
        };
        setHistory((prev) => [entry, ...prev]);
        setActiveSession(null);
    }, [activeSession]);

    return (
        <SessionContext.Provider
            value={{ activeSession, history, startSession, updateSession, finishSession }}
        >
            {children}
        </SessionContext.Provider>
    );
}
