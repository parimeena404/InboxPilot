import { createContext, useCallback, useContext, useState } from "react";

const UICtx = createContext(null);

export function UIProvider({ children }) {
    const [panelOpen, setPanelOpen] = useState(false);
    const [panelEmail, setPanelEmail] = useState(null);

    const openAssistant = useCallback((email = null) => {
        setPanelEmail(email);
        setPanelOpen(true);
    }, []);

    const closeAssistant = useCallback(() => setPanelOpen(false), []);

    const clearPanelEmail = useCallback(() => setPanelEmail(null), []);

    return (
        <UICtx.Provider value={{ panelOpen, panelEmail, openAssistant, closeAssistant, clearPanelEmail }}>
            {children}
        </UICtx.Provider>
    );
}

export const useUI = () => useContext(UICtx);
