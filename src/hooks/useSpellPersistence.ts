import { useState, useEffect, useCallback } from 'react';

export const useSpellPersistence = <T>(key: string, initialState: T) => {
    const [state, setState] = useState<T>(initialState);
    const [isRestored, setIsRestored] = useState(false);

    // Load state from session storage on mount
    useEffect(() => {
        const saved = sessionStorage.getItem(key);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setState(parsed);
                setIsRestored(true);
            } catch (e) {
                console.error("Failed to parse persisted spell state:", e);
            }
        }
    }, [key]);

    // Save state to session storage whenever it changes
    useEffect(() => {
        if (state) {
            sessionStorage.setItem(key, JSON.stringify(state));
        }
    }, [key, state]);

    const clearState = useCallback(() => {
        sessionStorage.removeItem(key);
    }, [key]);

    return { state, setState, clearState, isRestored };
};
