import { Request, Response } from 'express';
import { Item } from '../models/Item';
import { AuthRequest } from '../middlewares/auth';

// @desc    Get all active items (public)
// @route   GET /api/v1/items
// @access  Public
export const getItems = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, search } = req.query;
    
    let query: any = { status: 'Active' };
    
    if (category && category !== 'All') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const items = await Item.find(query).sort({ createdAt: -1 }).populate('owner', 'name avatar');
    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Get items by logged-in user
// @route   GET /api/v1/items/me
// @access  Private
export const getMyItems = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }
    const items = await Item.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: items.length, data: items });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Get a single item by ID (with related items)
// @route   GET /api/v1/items/:id
// @access  Public
export const getItemById = async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await Item.findById(req.params.id).populate('owner', 'name avatar');
    if (!item) {
      res.status(404).json({ success: false, message: 'Item not found' });
      return;
    }

    // Fetch related items: same category, exclude self, limit 4
    const related = await Item.find({
      _id: { $ne: item._id },
      category: item.category,
      status: 'Active',
    })
      .limit(4)
      .populate('owner', 'name avatar')
      .select('title shortDescription imageUrl images price rating reviewCount location category');

    res.status(200).json({ success: true, data: item, related });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Create a new item
// @route   POST /api/v1/items
// @access  Private
export const createItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }
    
    req.body.owner = req.user._id;

    // Handle numeric price conversion
    if (req.body.price) {
      const numMatch = String(req.body.price).match(/\d+/);
      if (numMatch) {
        req.body.numericPrice = parseInt(numMatch[0], 10);
      }
    }

    // Ensure images array is populated; keep imageUrl as the first image
    if (req.body.images && Array.isArray(req.body.images) && req.body.images.length > 0) {
      req.body.imageUrl = req.body.images[0];
    } else if (req.body.imageUrl) {
      req.body.images = [req.body.imageUrl];
    }

    const item = await Item.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error: any) {
    res.status(400).json({ success: false, message: 'Invalid data', error: error.message });
  }
};

// @desc    Update an item
// @route   PUT /api/v1/items/:id
// @access  Private
export const updateItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let item = await Item.findById(req.params.id);
    
    if (!item) {
      res.status(404).json({ success: false, message: 'Item not found' });
      return;
    }

    if (item.owner.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
      res.status(401).json({ success: false, message: 'Not authorized to update this item' });
      return;
    }

    if (req.body.price) {
      const numMatch = String(req.body.price).match(/\d+/);
      if (numMatch) {
        req.body.numericPrice = parseInt(numMatch[0], 10);
      }
    }

    if (req.body.images && Array.isArray(req.body.images) && req.body.images.length > 0) {
      req.body.imageUrl = req.body.images[0];
    }

    item = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: item });
  } catch (error: any) {
    res.status(400).json({ success: false, message: 'Invalid data', error: error.message });
  }
};

// @desc    Delete an item
// @route   DELETE /api/v1/items/:id
// @access  Private
export const deleteItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const item = await Item.findById(req.params.id);
    
    if (!item) {
      res.status(404).json({ success: false, message: 'Item not found' });
      return;
    }

    if (item.owner.toString() !== req.user?._id.toString() && req.user?.role !== 'admin') {
      res.status(401).json({ success: false, message: 'Not authorized to delete this item' });
      return;
    }

    await item.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};

// @desc    Add a review to an item
// @route   POST /api/v1/items/:id/reviews
// @access  Private
export const addReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authorized' });
      return;
    }

    const { rating, content } = req.body;

    if (!rating || !content) {
      res.status(400).json({ success: false, message: 'Rating and content are required' });
      return;
    }

    const item = await Item.findById(req.params.id);
    if (!item) {
      res.status(404).json({ success: false, message: 'Item not found' });
      return;
    }

    // Check if user already reviewed
    const alreadyReviewed = item.reviews.find(
      (r) => r.user.toString() === req.user!._id.toString()
    );
    if (alreadyReviewed) {
      res.status(400).json({ success: false, message: 'You have already reviewed this item' });
      return;
    }

    const review = {
      user: req.user._id,
      name: req.user.name,
      avatar: (req.user as any).avatar || '',
      rating: Number(rating),
      content,
      createdAt: new Date(),
    };

    item.reviews.push(review as any);
    item.reviewCount = item.reviews.length;
    item.rating =
      item.reviews.reduce((acc, r) => acc + r.rating, 0) / item.reviews.length;

    await item.save();

    res.status(201).json({ success: true, data: item.reviews });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Server Error', error: error.message });
  }
};
