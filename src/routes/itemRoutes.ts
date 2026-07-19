import express from 'express';
import { getItems, getMyItems, getItemById, createItem, updateItem, deleteItem } from '../controllers/itemController';
import { protect } from '../middlewares/auth';

const router = express.Router();

router.route('/')
  .get(getItems)
  .post(protect as any, createItem as any);

router.route('/me')
  .get(protect as any, getMyItems as any);

router.route('/:id')
  .get(getItemById)
  .put(protect as any, updateItem as any)
  .delete(protect as any, deleteItem as any);

export default router;
