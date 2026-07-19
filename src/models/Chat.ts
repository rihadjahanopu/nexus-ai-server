import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage {
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: Date;
}

export interface IChat extends Document {
  project: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  messages: IMessage[];
}

const MessageSchema: Schema = new Schema({
  role: { type: String, enum: ['user', 'model', 'system'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const ChatSchema: Schema = new Schema({
  project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  messages: [MessageSchema]
}, {
  timestamps: true
});

export const Chat = mongoose.model<IChat>('Chat', ChatSchema);
