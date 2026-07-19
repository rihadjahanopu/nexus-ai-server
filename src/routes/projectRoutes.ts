import { Router } from 'express';
import { getProjects, getProject, createProject, updateProject, deleteProject, uploadDocument, deleteDocument } from '../controllers/projectController';
import { protect } from '../middlewares/auth';
import { upload } from '../middlewares/upload';

const router = Router();

router.route('/')
  .get(protect, getProjects)
  .post(protect, createProject);

router.route('/:id')
  .get(protect, getProject)
  .put(protect, updateProject)
  .delete(protect, deleteProject);

router.post('/:id/documents', protect, upload.single('file'), uploadDocument);
router.delete('/:id/documents/:docId', protect, deleteDocument);


export default router;
