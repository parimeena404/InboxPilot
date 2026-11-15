import axios from "axios";

const BASE = `${process.env.REACT_APP_BACKEND_URL}/api`;

const api = axios.create({
    baseURL: BASE,
    withCredentials: true,
});

export default api;

export function formatApiErrorDetail(detail) {
    if (detail == null) return "Something went wrong. Please try again.";
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail))
        return detail
            .map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e)))
            .filter(Boolean)
            .join(" ");
    if (detail && typeof detail.msg === "string") return detail.msg;
    return String(detail);
}

export function apiErrorMessage(e, fallback = "Something went wrong. Please try again.") {
    return formatApiErrorDetail(e?.response?.data?.detail) || e?.message || fallback;
}

/**
 * POST an SSE endpoint and consume the event stream.
 * Server events: {"delta": "..."} | {"done": true} | {"error": "..."}
 */
export async function sse(path, body, { onDelta, onDone, onError } = {}, signal) {
    try {
        const res = await fetch(`${BASE}${path}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(body),
            signal,
        });
        if (!res.ok || !res.body) {
            let detail = `Request failed (${res.status})`;
            try {
                const j = await res.json();
                detail = formatApiErrorDetail(j.detail) || detail;
            } catch {}
            throw new Error(detail);
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            buf += decoder.decode(value, { stream: true });
            let idx;
            while ((idx = buf.indexOf("\n\n")) >= 0) {
                const raw = buf.slice(0, idx);
                buf = buf.slice(idx + 2);
                for (const line of raw.split("\n")) {
                    if (!line.startsWith("data:")) continue;
                    const payload = line.slice(5).trim();
                    if (!payload || payload === "[DONE]") continue;
                    try {
                        const evt = JSON.parse(payload);
                        if (evt.delta) onDelta?.(evt.delta);
                        if (evt.done) {
                            onDone?.(evt);
                            return;
                        }
                        if (evt.error) {
                            onError?.(evt.error);
                            return;
                        }
                    } catch {}
                }
            }
        }
        onDone?.({});
    } catch (e) {
        if (e?.name !== "AbortError") onError?.(e?.message || "Connection lost");
    }
}
