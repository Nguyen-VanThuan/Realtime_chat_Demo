import ChatRoom from "../models/ChatRoom.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

// Tạo phòng chat mới
export const createChatRoom = async (req, res) => {
    try {
        const { name, participants, type } = req.body;
        const userId = req.user.userId;

        if (!participants || participants.length === 0) {
            return res.status(400).json({ message: "Cần ít nhất một người tham gia" });
        }

        // Thêm người tạo vào participants nếu chưa có
        if (!participants.includes(userId)) {
            participants.push(userId);
        }

        const chatRoom = new ChatRoom({
            name: name || `Chat với ${participants.length} người`,
            participants,
            type: type || "private",
            createdBy: userId
        });

        await chatRoom.save();

        // Populate participants
        await chatRoom.populate('participants', 'username displayName avatarUrl');

        res.status(201).json(chatRoom);
    } catch (error) {
        console.error("Lỗi tạo phòng chat:", error);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

// Lấy danh sách phòng chat của user
export const getChatRooms = async (req, res) => {
    try {
        const userId = req.user.userId;

        const chatRooms = await ChatRoom.find({ participants: userId })
            .populate('participants', 'username displayName avatarUrl')
            .populate('createdBy', 'username displayName')
            .sort({ updatedAt: -1 });

        res.json(chatRooms);
    } catch (error) {
        console.error("Lỗi lấy phòng chat:", error);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

// Lấy tin nhắn của phòng chat
export const getMessages = async (req, res) => {
    try {
        const { roomId } = req.params;
        const userId = req.user.userId;

        // Kiểm tra user có trong phòng không
        const chatRoom = await ChatRoom.findOne({ _id: roomId, participants: userId });
        if (!chatRoom) {
            return res.status(403).json({ message: "Không có quyền truy cập phòng chat này" });
        }

        const messages = await Message.find({ chatRoomId: roomId })
            .populate('senderId', 'username displayName avatarUrl')
            .sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        console.error("Lỗi lấy tin nhắn:", error);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

// Gửi tin nhắn
export const sendMessage = async (req, res) => {
    try {
        const { roomId, content, messageType, fileUrl, fileName } = req.body;
        const userId = req.user.userId;

        // Kiểm tra user có trong phòng không
        const chatRoom = await ChatRoom.findOne({ _id: roomId, participants: userId });
        if (!chatRoom) {
            return res.status(403).json({ message: "Không có quyền gửi tin nhắn vào phòng này" });
        }

        const message = new Message({
            chatRoomId: roomId,
            senderId: userId,
            content,
            messageType: messageType || "text",
            fileUrl,
            fileName
        });

        await message.save();
        await message.populate('senderId', 'username displayName avatarUrl');

        // Cập nhật updatedAt của chatRoom
        await ChatRoom.findByIdAndUpdate(roomId, { updatedAt: new Date() });

        res.status(201).json(message);
    } catch (error) {
        console.error("Lỗi gửi tin nhắn:", error);
        res.status(500).json({ message: "Lỗi hệ thống" });
    }
};

// Upload file
export const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const fileUrl = `/uploads/${req.file.filename}`;
        res.json({ 
            fileUrl, 
            fileName: req.file.originalname,
            messageType: req.file.mimetype.startsWith('image/') ? 'image' : req.file.mimetype.startsWith('video/') ? 'video' : 'file'
        });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ message: "Upload failed" });
    }
};

