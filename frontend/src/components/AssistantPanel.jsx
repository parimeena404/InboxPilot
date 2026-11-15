import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import AssistantChat from "@/components/AssistantChat";
import { useUI } from "@/lib/ui";

export default function AssistantPanel() {
    const { panelOpen, panelEmail, closeAssistant, clearPanelEmail } = useUI();

    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && closeAssistant();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [closeAssistant]);

    return (
        <AnimatePresence>
            {panelOpen && (
                <>
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        onClick={closeAssistant}
                        className="fixed inset-0 z-40 bg-ink-900/30 backdrop-blur-[2px]"
                        data-testid="assistant-panel-backdrop"
                    />
                    <motion.aside
                        key="panel"
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[440px] flex-col border-l border-slate-200 bg-white shadow-2xl"
                        data-testid="assistant-panel"
                    >
                        <div className="flex items-center gap-2.5 border-b border-slate-200/80 px-4 py-3.5">
                            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-soft border border-brand-border text-brand-dark">
                                <Sparkles size={15} />
                            </span>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-ink-900">Pilot — AI Assistant</p>
                                <p className="text-[11px] text-slate-400">
                                    {panelEmail ? "Analyzing the selected conversation" : "Workspace-wide assistant"}
                                </p>
                            </div>
                            <button
                                data-testid="assistant-panel-close"
                                onClick={closeAssistant}
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            >
                                <X size={17} />
                            </button>
                        </div>
                        <AssistantChat className="flex-1" emailContext={panelEmail} onClearContext={clearPanelEmail} />
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}
