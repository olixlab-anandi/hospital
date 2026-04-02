import connection from "@/DB/connection";
import ChatMessage from "../../../../model/chatMessage";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import jwt from "jsonwebtoken";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to verify JWT token
function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRETE as string) as {
      id: string;
      email: string;
      role: string;
    };
    return { id: decoded.id, email: decoded.email, role: decoded.role };
  } catch {
    return null;
  }
}

// POST → user sends a new message
export async function POST(req: Request) {
  try {
    await connection();
    
    // Check for authentication token
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const userInfo = verifyToken(token);
    
    if (!userInfo) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const { message } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Save user message in DB
    const newMessage = new ChatMessage({ 
      user: "user", 
      message, 
      userId: userInfo.id, 
      userEmail: userInfo.email 
    });
    await newMessage.save();

    // Site knowledge (light RAG seed)
    const SITE_KNOWLEDGE = `
You are the chatbot for a Hospital Management System web app.
Site capabilities:
- Staff management, patient records, schedules, reports, and profiles for admin and staff.
- Login at /login. Admin area at /admin, staff area at /staff.
- Users can add patient details, create schedules, and generate reports.
- Built with Next.js. This chat is only for general guidance; do not provide medical advice.
If the user asks about this website, its features, navigation, or how to do tasks here, answer specifically and concisely based on the info above.
If the question is medical, provide general guidance and advise consulting professionals.
Keep responses brief unless asked for more detail.`;

    // Pull last 10 messages for conversational context (only for this user)
    const recent = await ChatMessage.find({ userId: userInfo.id }).sort({ timestamp: -1 }).limit(10).lean();
    const history = recent
      .reverse()
      .map((m: { user: string; message: string }) => ({ 
        role: m.user === "bot" ? "assistant" as const : "user" as const, 
        content: m.message 
      }));

    // Get AI reply with context + knowledge
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system" as const, content: SITE_KNOWLEDGE },
        ...history,
        { role: "user" as const, content: message },
      ],
      temperature: 0.3,
    });

    const botReply = completion.choices[0].message.content;

    // Save bot reply in DB
    const botMessage = new ChatMessage({ 
      user: "bot", 
      message: botReply, 
      userId: userInfo.id, 
      userEmail: userInfo.email 
    });
    await botMessage.save();

    return NextResponse.json({ userMessage: newMessage, botMessage });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}

// GET → fetch all messages for authenticated user
export async function GET(req: Request) {
  try {
    await connection();
    
    // Check for authentication token
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const userInfo = verifyToken(token);
    
    if (!userInfo) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Fetch messages only for this user
    const messages = await ChatMessage.find({ userId: userInfo.id }).sort({ timestamp: 1 });
    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
