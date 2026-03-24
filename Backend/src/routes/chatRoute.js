import express from 'express';
import {
    createChatRoom,
    getChatRooms,
    getMessages,
    sendMessage
} from '../controllers/chatController.js';

import multer from 'multer';
import { uploadFile } from '../controllers/chatController.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

const router = express.Router();

router.post('/rooms', createChatRoom);
router.get('/rooms', getChatRooms);
router.get('/rooms/:roomId/messages', getMessages);
router.post('/messages', sendMessage);
router.post('/upload', upload.single('file'), uploadFile);

export default router;

