"use client";
import { useEffect, useMemo, useRef, useState } from "react";

type ChatMessageType = { user: string; message: string; _id?: string };

export default function Chat() {
    const [messages, setMessages] = useState<ChatMessageType[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const listRef = useRef<HTMLDivElement | null>(null);

    // Fetch messages on mount
    useEffect(() => {
        fetch("/api/chat")
            .then(res => res.json())
            .then((data: ChatMessageType[]) => setMessages(data))
            .catch(() => {});
    }, []);

    // Auto scroll to bottom on new messages
    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [messages, loading]);

    const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

    const sendMessage = async () => {
        if (!canSend) return;
        const userMessage: ChatMessageType = { user: "You", message: input.trim() };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setLoading(true);
        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user: "user1", message: userMessage.message }),
            });
            const data = await res.json();
            if (data?.botMessage) {
                setMessages(prev => [...prev, data.botMessage as ChatMessageType]);
            }
        } catch (err: any) {
            console.log(err);
            setMessages(prev => [...prev, { user: "bot", message: "Sorry, something went wrong." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div ref={listRef} className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3 bg-white">
                {messages.map((msg, index) => {
                    const isBot = msg.user === "bot";
                    return (
                        <div key={index} className={`flex ${isBot ? "items-start" : "items-end justify-end"}`}>
                            {isBot && (
                                <div className="mr-2 h-8 w-8 rounded-full bg-[#0288D1] text-white flex items-center justify-center text-sm">B</div>
                            )}
                            <div className={`${isBot ? "bg-gray-100 text-gray-800" : "bg-[#0288D1] text-white"} max-w-[80%] px-3 py-2 rounded-2xl ${isBot ? "rounded-tl-sm" : "rounded-tr-sm"}`}>
                                <div className="whitespace-pre-wrap leading-relaxed">{msg.message}</div>
                            </div>
                            {!isBot && (
                                <div className="ml-2 h-8 w-8 rounded-full bg-[#64B5F6] text-white flex items-center justify-center text-sm">Y</div>
                            )}
                        </div>
                    );
                })}
                {loading && (
                    <div className="flex items-start">
                        <div className="mr-2 h-8 w-8 rounded-full bg-[#0288D1] text-white flex items-center justify-center text-sm">B</div>
                        <div className="bg-gray-100 text-gray-500 px-3 py-2 rounded-2xl rounded-tl-sm animate-pulse">Bot is typing…</div>
                    </div>
                )}
            </div>
            <div className="border-t border-gray-200 p-3 bg-white">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about our hospital or type a message..."
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0288D1]"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!canSend}
                        className={`px-4 py-2 rounded-lg text-white ${canSend ? "bg-[#0288D1] hover:bg-[#01579b]" : "bg-gray-300 cursor-not-allowed"}`}
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}
