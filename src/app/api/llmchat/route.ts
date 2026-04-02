import { NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ConversationChain } from "langchain/chains";
import { BufferMemory } from "langchain/memory";
import { MongoDBChatMessageHistory } from "@langchain/mongodb";
import clientPromise from "@/lib/mongodb";

export async function POST(req: Request) {
  try {
    const { message, userId } = await req.json();
    if (!userId) throw new Error("userId is required for persistent memory");

    // MongoDB connection
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // Store conversation per user
    const messageHistory = new MongoDBChatMessageHistory({
      collection: db.collection("conversations"),
      sessionId: `chat:${userId}`, // unique per user
    });

    // Create memory wrapper
    const memory = new BufferMemory({
      chatHistory: messageHistory,
      returnMessages: true,
      memoryKey: "history",
    });

    // Initialize LLM
    const llm = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: "gpt-4o-mini",
      temperature: 0.7,
    });

    // Prompt template
    const prompt = ChatPromptTemplate.fromTemplate(
      "The following is a conversation.\n{history}\nUser: {input}\nAI:"
    );

    // Chain with memory
    const chain = new ConversationChain({
      llm,
      memory,
      prompt,
    });

    // Run chain
    const response = await chain.invoke({ input: message });

    return NextResponse.json({ reply: response.response });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
