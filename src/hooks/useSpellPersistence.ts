import { useState, useEffect, useCallback } from 'react';

// Option interface
export interface PersistenceOptions {
    consumeFlag?: boolean;
}

export const useSpellPersistence = <T>(key: string, initialState: T, options?: PersistenceOptions) => {
    const [state, setState] = useState<T>(initialState);
    const [isRestored, setIsRestored] = useState(false);

    // Load state from session storage ONLY if returning from valid flow
    useEffect(() => {
        const checkRestoration = () => {
            if (typeof window === 'undefined') return;
            
            // Check for the "wait, I'm coming back" flag
            const isReturnFlow = sessionStorage.getItem('PENDING_PURCHASE');
            const saved = sessionStorage.getItem(key);

            if (isReturnFlow && saved) {
                try {
                    const parsed = JSON.parse(saved);
                    setState(parsed);
                    setIsRestored(true);
                    
                    // Consume flag only if requested (default true)
                    if (options?.consumeFlag !== false) {
                        sessionStorage.removeItem('PENDING_PURCHASE'); 
                    }
                } catch (e) {
                    console.error("Failed to parse persisted spell state:", e);
                    // Fallback to clear
                    sessionStorage.removeItem(key);
                    setState(initialState);
                }
            } else {
                 // If not a return flow, clear any old state to prevent sticking
                 sessionStorage.removeItem(key);
                 setState(initialState);
            }
        };

        checkRestoration();
        
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key, options?.consumeFlag]); // Intentionally omitting initialState to avoid deep equality check issues on object literals

    // Save state to session storage whenever it changes
    useEffect(() => {
        if (state) {
            sessionStorage.setItem(key, JSON.stringify(state));
        }
    }, [key, state]);

    const clearState = useCallback(() => {
        sessionStorage.removeItem(key);
        setState(initialState);
    }, [key, initialState]);

    return { state, setState, clearState, isRestored };
};
