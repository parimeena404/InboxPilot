import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Logo from "@/components/Logo";
import ConversationView from "@/components/ConversationView";
import { useAuth } from "@/lib/auth";

export default function ClientReview() {
    const { emailId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user === null) navigate("/login", { replace: true });
        if (user && user.role !== "client") navigate("/", { replace: true });
    }, [user, navigate]);

    if (!user || user.role !== "client") return null;

    return (
        <div className="min-h-screen bg-background" data-testid="client-review-page">
            <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-slate-200/80 bg-white/85 px-4 md:px-8 backdrop-blur-xl">
                <Logo size={32} showWord={false} />
                <p className="text-sm font-bold text-ink-900">Review conversation</p>
            </header>
            <div className="mx-auto max-w-4xl px-4 md:px-8 py-6">
                <div className="card-base shadow-soft overflow-hidden">
                    <ConversationView emailId={emailId} variant="client" onBack={() => navigate("/client")} />
                </div>
            </div>
        </div>
    );
}
