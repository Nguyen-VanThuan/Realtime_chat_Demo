import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';

interface User {
    _id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
    online?: boolean;
}

interface Message {
    _id: string;
    chatRoomId: string;
    senderId: User;
    content: string;
    messageType: 'text' | 'image' | 'video' | 'file';
    fileUrl?: string;
    fileName?: string;
    createdAt: string;
}

interface ChatRoom {
    _id: string;
    name: string;
    participants: User[];
    type: string;
    createdBy: User;
    updatedAt: string;
}

interface VideoCallState {
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    callUser: string | null;
    receivingCall: boolean;
    callEnded: boolean;
}

interface ChatState {
    socket: Socket | null;
    currentUser: User | null;
    chatRooms: ChatRoom[];
    currentRoom: ChatRoom | null;
    messages: Message[];
    isConnected: boolean;
    onlineUsers: Record<string, boolean>;
    videoCall: VideoCallState;
    notifications: Message[];

    // Actions
    connectSocket: (token: string) => void;
    disconnectSocket: () => void;
    setCurrentUser: (user: User) => void;
    setChatRooms: (rooms: ChatRoom[]) => void;
    setCurrentRoom: (room: ChatRoom | null) => void;
    setMessages: (messages: Message[]) => void;
    addMessage: (message: Message) => void;
    joinRoom: (roomId: string) => void;
    leaveRoom: (roomId: string) => void;
    sendMessage: (data: { content?: string; roomId: string; messageType?: string; fileUrl?: string; fileName?: string }) => Promise<void>;
    uploadFile: (file: File) => Promise<{ fileUrl: string; fileName: string; messageType: string }>;
    updateOnlineStatus: (userId: string, online: boolean) => void;
    startCall: (userId: string) => void;
    answerCall: () => void;
    endCall: () => void;
    setLocalStream: (stream: MediaStream) => void;
    setRemoteStream: (stream: MediaStream) => void;
    addNotification: (message: Message) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
    socket: null,
    currentUser: null,
    chatRooms: [],
    currentRoom: null,
    messages: [],
    isConnected: false,
    onlineUsers: {},
    videoCall: {
        localStream: null,
        remoteStream: null,
        callUser: null,
        receivingCall: false,
        callEnded: false
    },
    notifications: [],

    connectSocket: (token: string) => {
        const socket = io('http://localhost:3000', {
            auth: { token },
            transports: ['websocket', 'polling']
        });

        socket.on('connect', () => {
            console.log('Connected to chat server');
            set({ isConnected: true });
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from chat server');
            set({ isConnected: false });
        });

        socket.on('receiveMessage', (message: Message) => {
            get().addMessage(message);
            const currentRoom = get().currentRoom;
            if (!currentRoom || message.chatRoomId !== currentRoom._id) {
                get().addNotification(message);
            }
        });

        socket.on('user:online', (data: { userId: string; online: boolean }) => {
            set((state) => ({
                onlineUsers: { ...state.onlineUsers, [data.userId]: data.online }
            }));
        });

        socket.on('call:offered', (data) => {
            set({ videoCall: { ...get().videoCall, receivingCall: true, callUser: data.from } });
        });

        socket.on('call:answered', () => {
            console.log('Call answered');
        });

        socket.on('call:ice-candidate', () => {
            // Handle ICE candidate
            console.log('ICE candidate received');
        });

        socket.on('call:ended', () => {
            set({ 
                videoCall: {
                    localStream: null,
                    remoteStream: null,
                    callUser: null,
                    receivingCall: false,
                    callEnded: true
                }
            });
        });

        set({ socket });
    },

    disconnectSocket: () => {
        const { socket } = get();
        if (socket) {
            socket.disconnect();
            set({ socket: null, isConnected: false });
        }
    },

    setCurrentUser: (user) => set({ currentUser: user }),

    setChatRooms: (rooms) => set({ chatRooms: rooms }),

    setCurrentRoom: (room) => {
        set({ currentRoom: room });
        if (room) {
            get().joinRoom(room._id);
        }
    },

    setMessages: (messages) => set({ messages }),

    addMessage: (message) => set((state) => ({
        messages: [...state.messages, message]
    })),

    joinRoom: (roomId) => {
        const { socket } = get();
        if (socket) {
            socket.emit('joinRoom', roomId);
        }
    },

    leaveRoom: (roomId) => {
        const { socket } = get();
        if (socket) {
            socket.emit('leaveRoom', roomId);
        }
    },

    sendMessage: async (data) => {
        const { currentRoom, socket } = get();
        if (!currentRoom) return;
        data.roomId ||= currentRoom._id;
        try {
            const response = await axios.post('http://localhost:3000/api/chat/messages', data, { withCredentials: true });
            const message = response.data;
            get().addMessage(message);
            if (socket) {
                socket.emit('sendMessage', {
                    roomId: data.roomId,
                    message
                });
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    },

    uploadFile: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await axios.post('http://localhost:3000/api/chat/upload', formData, {
            withCredentials: true,
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    updateOnlineStatus: (userId: string, online: boolean) => set((state) => ({
        onlineUsers: { ...state.onlineUsers, [userId]: online }
    })),

    startCall: (userId: string) => {
        const { socket } = get();
        if (socket) {
            socket.emit('call:user', { to: userId });
        }
    },

    answerCall: () => {
        const { socket, videoCall } = get();
        if (socket && videoCall.callUser) {
            socket.emit('call:answer', { to: videoCall.callUser });
        }
    },

    endCall: () => {
        const { socket, videoCall } = get();
        if (socket && videoCall.callUser) {
            socket.emit('call:end', { to: videoCall.callUser });
        }
        set({ 
            videoCall: {
                localStream: null,
                remoteStream: null,
                callUser: null,
                receivingCall: false,
                callEnded: true
            }
        });
    },

    setLocalStream: (stream) => set((state) => ({
        videoCall: { ...state.videoCall, localStream: stream }
    })),

    setRemoteStream: (stream) => set((state) => ({
        videoCall: { ...state.videoCall, remoteStream: stream }
    })),

    addNotification: (message) => set((state) => ({
        notifications: [message, ...state.notifications.slice(0, 9)]
    }))
}));

