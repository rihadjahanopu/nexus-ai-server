import mongoose, { Document, Schema } from 'mongoose';

export interface IRecommendation extends Document {
  user: mongoose.Types.ObjectId;
  project?: mongoose.Types.ObjectId;
  title: string;
  description: string;
  actionType: string;
  isApplied: boolean;
}

const RecommendationSchema: Schema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  project: { type: Schema.Types.ObjectId, ref: 'Project' },
  title: { type: String, required: true },
  description: { type: String, required: true },
  actionType: { type: String, required: true },
  isApplied: { type: Boolean, default: false }
}, {
  timestamps: true
});

export const Recommendation = mongoose.model<IRecommendation>('Recommendation', RecommendationSchema);
