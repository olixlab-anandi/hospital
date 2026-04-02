"use client";

import React, { useState } from "react";

export default function ChatPage() {
    const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
    const [input, setInput] = useState("");

    const sendMessage = async () => {
        if (!input.trim()) return;

        // Add user message to state
        setMessages((prev) => [...prev, { role: "user", content: input }]);

        // Send request to API
        const res = await fetch("/api/llmchat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: input }),
        });

        const data = await res.json();

        // Add bot response
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);

        setInput("");
    };

    return (
        <div className="flex flex-col h-screen p-4">
            <div className="flex-1 overflow-y-auto border p-2 rounded bg-gray-50">
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`my-2 p-2 rounded ${msg.role === "user" ? "bg-blue-200 self-end" : "bg-green-200 self-start"
                            }`}
                    >
                        <b>{msg.role === "user" ? "You" : "Bot"}:</b> {msg.content}
                    </div>
                ))}
            </div>
            <div className="flex mt-2">
                <input
                    className="flex-1 border rounded p-2"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                />
                <button
                    onClick={sendMessage}
                    className="ml-2 px-4 py-2 bg-blue-600 text-white rounded"
                >
                    Send
                </button>
            </div>
        </div>
    );
}
