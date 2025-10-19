// src/hooks/useSyncOffline.ts
import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import OfflineManager from '../services/offlineManager';

export const useSyncOffline = () => {
    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(async (state) => {
            if (state.isConnected) {
                await OfflineManager.syncOfflineActions();
            }
        });

        // Try sync on first load as well
        (async () => {
            await OfflineManager.syncOfflineActions();
        })();

        return () => {
            unsubscribe();
        };
    }, []);
};
