import mongoose, { Document, Schema } from 'mongoose';

export interface IReview {
  user: mongoose.Types.ObjectId;
  name: string;
  avatar?: string;
  rating: number;
  content: string;
  createdAt: Date;
}

export interface ISpec {
  label: string;
  value: string;
}

export interface IItem extends Document {
  title: string;
  shortDescription: string;
  fullDescription?: string;
  price: string;
  numericPrice?: number;
  imageUrl?: string;       // First image (legacy + convenience)
  images: string[];        // All images array
  category?: string;
  location?: string;
  status: 'Active' | 'Inactive';
  rating: number;
  reviewCount: number;
  specs: ISpec[];
  reviews: IReview[];
  owner: mongoose.Types.ObjectId;
}

const ReviewSchema = new Schema<IReview>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  avatar: { type: String },
  rating: { type: Number, required: true, min: 1, max: 5 },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const SpecSchema = new Schema<ISpec>({
  label: { type: String, required: true },
  value: { type: String, required: true },
}, { _id: false });

const ItemSchema: Schema = new Schema({
  title: { type: String, required: true },
  shortDescription: { type: String, required: true },
  fullDescription: { type: String },
  price: { type: String, required: true },
  numericPrice: { type: Number },
  imageUrl: { type: String },
  images: [{ type: String }],
  category: { type: String, default: 'Other' },
  location: { type: String },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  specs: [SpecSchema],
  reviews: [ReviewSchema],
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
});

export const Item = mongoose.model<IItem>('Item', ItemSchema);
