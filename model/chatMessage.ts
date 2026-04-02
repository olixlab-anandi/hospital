import mongoose from "mongoose";

const ChatMessageSchema = new mongoose.Schema({
  user: { type: String, required: true }, // "patient" or "bot"
  message: { type: String, required: true },
  userId: { type: String, required: true }, // User ID from authentication
  userEmail: { type: String, required: true }, // User email for identification
  timestamp: { type: Date, default: Date.now }
});
if (mongoose.models.ChatMessage) {
    delete mongoose.models.ChatMessage;
}

const ChatMessageModel = mongoose.model("ChatMessage", ChatMessageSchema);
export default ChatMessageModel;
// Avoid model overwrite issue in Next.js
