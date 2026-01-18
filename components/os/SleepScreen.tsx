/**
 * Copyright (c) 2024. Designed and Developed by Saurabh Lokhande.
 */

import { useAuthStore } from '../../store/useAuthStore';

const SleepScreen = () => {
    const { wake } = useAuthStore();
    return (
        <div onClick={wake} className="h-screen w-screen bg-black cursor-pointer flex items-center justify-center">
            {/* Totally black, maybe a tiny LED indicator */}
            <div className="w-1 h-1 bg-blue-900 rounded-full animate-pulse opacity-50 absolute bottom-4 right-4" />
        </div>
    );
};

export default SleepScreen;
