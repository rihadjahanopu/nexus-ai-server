import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { runAgent } from '../services/agentService';
import { Chat } from '../models/Chat';
import mongoose from 'mongoose';

// POST /api/v1/chat/:projectId — Send a message
export const sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const { message } = req.body;
    
    if (!message) {
      res.status(400).json({ success: false, message: 'Message is required' });
      return;
    }

    const responseText = await runAgent({
      userId: (req.user as any)._id.toString(),
      projectId: projectId as string,
      message
    });

    res.status(200).json({ success: true, data: responseText });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/v1/chat/:projectId — Get full chat history
export const getChatHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    
    const chat = await Chat.findOne({ project: projectId, user: req.user?._id });
    
    if (!chat) {
      res.status(200).json({ success: true, data: [] });
      return;
    }

    res.status(200).json({ success: true, data: chat.messages });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/v1/chat/:projectId/clear — Clear all messages
export const clearChat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    
    const chat = await Chat.findOneAndUpdate(
      { project: projectId, user: req.user?._id },
      { $set: { messages: [] } },
      { new: true }
    );

    res.status(200).json({ success: true, message: 'Chat cleared successfully', data: [] });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/v1/chat/:projectId/message/:messageId — Delete a specific message
export const deleteMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId, messageId } = req.params;
    
    const chat = await Chat.findOneAndUpdate(
      { project: projectId, user: req.user?._id },
      { $pull: { messages: { _id: new mongoose.Types.ObjectId(String(messageId)) } } },
      { new: true }
    );

    if (!chat) {
      res.status(404).json({ success: false, message: 'Chat not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'Message deleted', data: chat.messages });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
