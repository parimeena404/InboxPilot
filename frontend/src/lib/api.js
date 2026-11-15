import axios from "axios";
import { handleMockRequest, handleMockSSE } from "./mockApi";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";
const BASE = BACKEND_URL ? `${BACKEND_URL.replace(/\/+$/, "")}/api` : "/api";

const api = axios.create({
    baseURL: BASE,
    withCredentials: true,
});

// Seamless client-side adapter:
// If no external backend URL is specified (default on Netlify static deploy),
// or if the backend request fails, it routes to mockApi with localStorage persistence.
api.interceptors.request.use(async (config) => {
    if (!BACKEND_URL) {
        config.adapter = async (cfg) => {
            const method = (cfg.method || "get").toUpperCase();
            let parsedData = cfg.data;
            if (typeof parsedData === "string") {
                try {
                    parsedData = JSON.parse(parsedData);
                } catch {}
            }
            const res = await handleMockRequest(method, cfg.url || "/", parsedData, cfg.params);
            return {
                data: res.data,
                status: 200,
                statusText: "OK",
                headers: {},
                config: cfg,
                request: {},
            };
        };
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status = error?.response?.status;
        const isNetworkErr = !error.response || status === 404 || status >= 500;
        if (isNetworkErr && error.config && !error.config._mockFallback) {
            error.config._mockFallback = true;
            try {
                const method = (error.config.method || "get").toUpperCase();
                let parsedData = error.config.data;
                if (typeof parsedData === "string") {
                    try {
                        parsedData = JSON.parse(parsedData);
                    } catch {}
                }
                const res = await handleMockRequest(method, error.config.url || "/", parsedData, error.config.params);
                return {
                    data: res.data,
                    status: 200,
                    statusText: "OK",
                    headers: {},
                    config: error.config,
                    request: {},
                };
            } catch (mockErr) {
                return Promise.reject(mockErr);
            }
        }
        return Promise.reject(error);
    }
);

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
    if (!BACKEND_URL) {
        return handleMockSSE(path, body, { onDelta, onDone, onError }, signal);
    }
    try {
        const res = await fetch(`${BASE}${path}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(body),
            signal,
        });
        if (!res.ok || !res.body) {
            return handleMockSSE(path, body, { onDelta, onDone, onError }, signal);
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
        if (e?.name !== "AbortError") {
            return handleMockSSE(path, body, { onDelta, onDone, onError }, signal);
        }
    }
}
