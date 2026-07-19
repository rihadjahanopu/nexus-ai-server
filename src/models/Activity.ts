import mongoose, { Document, Schema } from 'mongoose';

export interface IActivity extends Document {
  user: mongoose.Types.ObjectId;
  project?: mongoose.Types.ObjectId;
  action: string;
  details?: string;
}

const ActivitySchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  project: { type: Schema.Types.ObjectId, ref: 'Project' },
  action: { type: String, required: true },
  details: { type: String }
}, {
  timestamps: true
});

export const Activity = mongoose.model<IActivity>('Activity', ActivitySchema);
