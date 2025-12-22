"use client";

import { useState, useEffect } from 'react';
import { getServiceCost, deductUserCredits } from '@/lib/services/economyService';

export const useAetherEconomy = (serviceSlug: string) => {
    const [cost, setCost] = useState<number>(0);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [showStoreLink, setShowStoreLink] = useState(false);

    // 1. Fetch Cost on Mount
    useEffect(() => {
        let mounted = true;
        const loadCost = async () => {
            const price = await getServiceCost(serviceSlug);
            if (mounted) setCost(price);
        };
        loadCost();
        return () => { mounted = false; };
    }, [serviceSlug]);

    // 2. The Spend Function
    const spendAether = async (userId: string): Promise<boolean> => {
        setIsProcessingPayment(true);
        setPaymentError(null);
        setShowStoreLink(false);

        if (cost === 0) {
            // Free service?
            setIsProcessingPayment(false);
            return true;
        }

        try {
            const success = await deductUserCredits(userId, cost);
            
            if (!success) {
                setPaymentError("Insufficient Aether.");
                setShowStoreLink(true);
                setIsProcessingPayment(false);
                return false;
            }
            
            // Success
            setIsProcessingPayment(false);
            return true;
        } catch (err) {
            console.error(err);
            setPaymentError("Transaction Failed.");
            setIsProcessingPayment(false);
            return false;
        }
    };

    const clearPaymentError = () => {
        setPaymentError(null);
        setShowStoreLink(false);
    };

    return {
        cost,
        spendAether,
        isProcessingPayment,
        paymentError,
        clearPaymentError,
        showStoreLink
    };
};