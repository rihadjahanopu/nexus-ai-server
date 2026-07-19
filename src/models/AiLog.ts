import mongoose, { Document, Schema } from 'mongoose';

export interface IAiLog extends Document {
  user: mongoose.Types.ObjectId;
  project?: mongoose.Types.ObjectId;
  action: string;
  tokensUsed: number;
  durationMs: number;
}

const AiLogSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  project: { type: Schema.Types.ObjectId, ref: 'Project' },
  action: { type: String, required: true },
  tokensUsed: { type: Number, default: 0 },
  durationMs: { type: Number, default: 0 }
}, {
  timestamps: true
});

export const AiLog = mongoose.model<IAiLog>('AiLog', AiLogSchema);
