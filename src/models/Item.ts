import mongoose, { Document, Schema } from 'mongoose';

export interface IItem extends Document {
  title: string;
  shortDescription: string;
  fullDescription?: string;
  price: string;
  numericPrice?: number;
  imageUrl?: string;
  category?: string;
  location?: string;
  status: 'Active' | 'Inactive';
  rating: number;
  owner: mongoose.Types.ObjectId;
}

const ItemSchema: Schema = new Schema({
  title: { type: String, required: true },
  shortDescription: { type: String, required: true },
  fullDescription: { type: String },
  price: { type: String, required: true },
  numericPrice: { type: Number },
  imageUrl: { type: String },
  category: { type: String, default: 'Other' },
  location: { type: String },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  rating: { type: Number, default: 0 },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
});

export const Item = mongoose.model<IItem>('Item', ItemSchema);
