import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAetherEconomy } from '@/hooks/useAetherEconomy';
import { buySpellSlots } from '@/lib/services/economyService';

interface UseSpellSystemConfig {
    serviceSlugGen: string;
    serviceSlugSave: string;
    baseRedirectPath: string; // e.g. '/spell-room/wicca-magick-spells-app'
}

export const useSpellSystem = ({ serviceSlugGen, serviceSlugSave, baseRedirectPath }: UseSpellSystemConfig) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const actionParam = searchParams.get('action');

    // --- State ---
    const [showSlotModal, setShowSlotModal] = useState(false);
    const [slotLoading, setSlotLoading] = useState(false);
    const [showAetherWarning, setShowAetherWarning] = useState(false);
    const [slotPurchaseSuccess, setSlotPurchaseSuccess] = useState(false);
    
    // --- Economy Hooks ---
    const genEconomy = useAetherEconomy(serviceSlugGen);
    const saveEconomy = useAetherEconomy(serviceSlugSave);

    // --- Auto-Open Modal on Return ---
    useEffect(() => {
        if (actionParam === 'expand_slots') {
             setTimeout(() => setShowSlotModal(true), 500); 
        }
    }, [actionParam]);

    // --- Actions ---

    // 1. Buy Slots Action
    const handleBuySlots = async (userId: string) => {
        if (!userId) return;
        setSlotLoading(true);
        const success = await buySpellSlots(userId);
        setSlotLoading(false);
        
        if (success) {
            setSlotPurchaseSuccess(true);
            setShowAetherWarning(false);
        } else {
            setShowAetherWarning(true);
        }
    };

    const handleGoToStoreForSlots = (currentStateToSave?: any, saveKey?: string) => {
        if (currentStateToSave && saveKey) {
            localStorage.setItem(saveKey, JSON.stringify({
                ...currentStateToSave,
                timestamp: Date.now()
            }));
        }
        // Removed action=expand_slots to prevent deprecated "Grimoire Full" modal on return
        router.push(`/store?redirect=${encodeURIComponent(baseRedirectPath)}`);
    };

    // 3. Modal Close
    const closeSlotModal = () => {
        setShowSlotModal(false);
        setTimeout(() => {
            setSlotPurchaseSuccess(false);
            setShowAetherWarning(false);
        }, 300);
    };

    // 4. Standardized Error Handling for Save
    const handleSaveError = (error: any) => {
        if (error.message === 'GRIMOIRE_FULL') {
            setShowSlotModal(true);
            return true; // Handled
        }
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
        // Modal State
        modalState: {
            isOpen: showSlotModal,
            setIsOpen: setShowSlotModal, // In case manual open needed
            isLoading: slotLoading,
            showWarning: showAetherWarning,
            showSuccess: slotPurchaseSuccess,
            close: closeSlotModal
        },
        
        // Economy Objects (exposing full economy hooks if needed)
        genEconomy,
        saveEconomy,

        // Actions
        buySlots: handleBuySlots,
        goToStoreForSlots: handleGoToStoreForSlots,
        handleSaveError,
        
        // Error Management
        activeError,
        clearErrors
    };
};
