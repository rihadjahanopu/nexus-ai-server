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

// @desc    Get a single item by ID
// @route   GET /api/v1/items/:id
// @access  Public
export const getItemById = async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await Item.findById(req.params.id).populate('owner', 'name avatar');
    if (!item) {
      res.status(404).json({ success: false, message: 'Item not found' });
      return;
    }
    res.status(200).json({ success: true, data: item });
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
    
    // Add user to req.body
    req.body.owner = req.user._id;

    // Handle numeric price conversion (if price is a string like '$150/night' or '150')
    if (req.body.price) {
      const numMatch = String(req.body.price).match(/\d+/);
      if (numMatch) {
        req.body.numericPrice = parseInt(numMatch[0], 10);
      }
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

    // Make sure user is item owner
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

    // Make sure user is item owner
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
