import { useAetherEconomy } from '@/hooks/useAetherEconomy';

interface UseSpellSystemConfig {
    serviceSlugGen: string;
    serviceSlugSave: string;
    baseRedirectPath: string; // e.g. '/spell-room/wicca-magick-spells-app'
}

export const useSpellSystem = ({ serviceSlugGen, serviceSlugSave, baseRedirectPath }: UseSpellSystemConfig) => {
    // --- Economy Hooks ---
    const genEconomy = useAetherEconomy(serviceSlugGen);
    const saveEconomy = useAetherEconomy(serviceSlugSave);

    // --- Actions ---

    // 4. Standardized Error Handling for Save
    // Formerly handled GRIMOIRE_FULL. Now just a pass-through or placeholder if future global errors needed.
    const handleSaveError = (error: any) => {
        // No global errors handled currently
        return false; // Not handled
    };

    // 5. Consolidated Error State
    // Returns the first active error message for the main Overlay
    const activeError = genEconomy.paymentError || saveEconomy.paymentError;
    const clearErrors = () => {
        genEconomy.clearPaymentError();
        saveEconomy.clearPaymentError();
    };

    return {
        // Economy Objects (exposing full economy hooks if needed)
        genEconomy,
        saveEconomy,

        // Actions
        handleSaveError,
        
        // Error Management
        activeError,
        clearErrors
    };
};
