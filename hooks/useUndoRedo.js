"use client"

import { useEffect } from 'react';

const useUndoRedo = (undo, redo) => {
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.ctrlKey && e.key === 'z') {
                undo();
            } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
                redo();
            }
        };

        document.addEventListener('keydown', handleKeyPress);

        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, [undo, redo]);
};

export default useUndoRedo;