import React, { useEffect } from 'react';
import axios from 'axios';
import ChatRoomList from './ChatRoomList';
import ChatWindow from './ChatWindow';
import MessageInput from './MessageInput';
import NotificationToast from '../Notification/NotificationToast';
import VideoCall from '../VideoCall/VideoCall';
import { useChatStore } from '../../stores/chatStore';
import { useAuthStore } from '../../stores/authStore';


const ChatApp: React.FC = () => {
    const { user } = useAuthStore();
    const {
        connectSocket,
        disconnectSocket,
        setCurrentUser,
        setChatRooms,
        setMessages,
        currentRoom,
        notifications
    } = useChatStore();

    useEffect(() => {
        if (!user) return;

        setCurrentUser(user);

        const fetchChatRooms = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/chat/rooms', {
                    withCredentials: true
                });
                setChatRooms(response.data);
            } catch (error) {
                console.error('Failed to fetch chat rooms:', error);
            }
        };

        fetchChatRooms();
        connectSocket(''); 

        return () => {
            disconnectSocket();
        };
    }, [user, connectSocket, disconnectSocket, setCurrentUser, setChatRooms]);

    useEffect(() => {
        if (currentRoom) {
            const fetchMessages = async () => {
                try {
                    const response = await axios.get(
                        `http://localhost:3000/api/chat/rooms/${currentRoom._id}/messages`,
                        { withCredentials: true }
                    );
                    setMessages(response.data);
                } catch (error) {
                    console.error('Failed to fetch messages:', error);
                }
            };
            fetchMessages();
        }
    }, [currentRoom, setMessages]);

    return (
        <div className="h-screen flex bg-white relative">
            <ChatRoomList />
            <div className="flex-1 flex flex-col">
                <ChatWindow />
                <MessageInput />
            </div>
            {notifications.length > 0 && <NotificationToast />}
            {currentRoom && <VideoCall currentRoom={currentRoom} />}
        </div>
    );
};

export default ChatApp;
