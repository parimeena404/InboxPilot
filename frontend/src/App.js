import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "@/App.css";
import { AuthProvider, useAuth } from "@/lib/auth";
import { UIProvider } from "@/lib/ui";
import { Toaster } from "@/components/ui/sonner";
import Login from "@/pages/Login";
import AssistantLayout from "@/components/AssistantLayout";
import Overview from "@/pages/Overview";
import Mail from "@/pages/Mail";
import Settings from "@/pages/Settings";
import AssistantPage from "@/pages/AssistantPage";
import ClientCenter from "@/pages/Client";
import ClientReview from "@/pages/ClientReview";

function FullLoader() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="flex items-center gap-3 text-slate-400">
                <span className="h-2 w-2 rounded-full bg-brand pulse-soft" />
                <span className="text-sm font-medium">Loading InboxPilot…</span>
            </div>
        </div>
    );
}

function RootRedirect() {
    const { user } = useAuth();
    if (user === undefined) return <FullLoader />;
    if (!user) return <Navigate to="/login" replace />;
    return <Navigate to={user.role === "client" ? "/client" : "/"} replace />;
}

export default function App() {
    return (
        <AuthProvider>
            <UIProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route element={<AssistantLayout />}>
                            <Route path="/" element={<Overview />} />
                            <Route path="/mail" element={<Mail />} />
                            <Route path="/mail/:emailId" element={<Mail />} />
                            <Route path="/assistant" element={<AssistantPage />} />
                            <Route path="/settings" element={<Settings />} />
                        </Route>
                        <Route path="/client" element={<ClientCenter />} />
                        <Route path="/client/review/:emailId" element={<ClientReview />} />
                        <Route path="*" element={<RootRedirect />} />
                    </Routes>
                    <Toaster position="bottom-right" richColors closeButton />
                </BrowserRouter>
            </UIProvider>
        </AuthProvider>
    );
}
