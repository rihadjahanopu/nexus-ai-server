import { Response } from 'express';
import { Project } from '../models/Project';
import { AuthRequest } from '../middlewares/auth';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary';
import fs from 'fs';

export const getProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const query: any = { user: req.user?._id };

    if (req.query.search) {
      query.title = { $regex: req.query.search, $options: 'i' };
    }
    
    if (req.query.status) {
      query.status = req.query.status;
    }

    const projects = await Project.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Project.countDocuments(query);

    res.status(200).json({
      success: true,
      data: projects,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const project = await Project.findOne({ _id: req.params.id, user: req.user?._id });
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }
    res.status(200).json({ success: true, data: project });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const project = await Project.create({
      ...req.body,
      user: req.user?._id
    });
    res.status(201).json({ success: true, data: project });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let project = await Project.findOne({ _id: req.params.id, user: req.user?._id });
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }
    
    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({ success: true, data: project });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const project = await Project.findOne({ _id: req.params.id, user: req.user?._id });
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }
    
    await project.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const project = await Project.findOne({ _id: req.params.id, user: req.user?._id });
    if (!project) {
      // Clean up temp file if project not found
      if (req.file?.path) fs.unlinkSync(req.file.path);
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded' });
      return;
    }

    const result = await uploadToCloudinary(req.file.path, `nexus/${req.params.id}/documents`);
    
    if (!result) {
      res.status(500).json({ success: false, message: 'Failed to upload file to cloud storage' });
      return;
    }

    const docEntry = {
      url: result.secure_url,
      public_id: result.public_id,
      filename: req.file.originalname
    };

    project.documents.push(docEntry);
    await project.save();

    res.status(200).json({ 
      success: true, 
      data: docEntry,
      message: 'File uploaded successfully'
    });
  } catch (error: any) {
    // Clean up temp file on error
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const project = await Project.findOne({ _id: req.params.id, user: req.user?._id });
    if (!project) {
      res.status(404).json({ success: false, message: 'Project not found' });
      return;
    }

    const docIndex = project.documents.findIndex(d => d._id?.toString() === req.params.docId);
    if (docIndex === -1) {
      res.status(404).json({ success: false, message: 'Document not found' });
      return;
    }

    const doc = project.documents[docIndex];
    if (doc.public_id) {
      await deleteFromCloudinary(doc.public_id);
    }

    project.documents.splice(docIndex, 1);
    await project.save();

    res.status(200).json({ success: true, message: 'Document deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
