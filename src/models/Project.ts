import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'archived';
  documents: { _id?: mongoose.Types.ObjectId; url: string; public_id: string; filename: string }[];
  images: { _id?: mongoose.Types.ObjectId; url: string; public_id: string; filename: string }[];
  aiSummary?: string;
  metadata?: Record<string, any>;
  tags: string[];
}

const ProjectSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ['active', 'completed', 'archived'], default: 'active' },
  documents: [{
    url: { type: String },
    public_id: { type: String },
    filename: { type: String }
  }],
  images: [{
    url: { type: String },
    public_id: { type: String },
    filename: { type: String }
  }],
  aiSummary: { type: String },
  metadata: { type: Schema.Types.Mixed },
  tags: [{ type: String }]
}, {
  timestamps: true
});

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
