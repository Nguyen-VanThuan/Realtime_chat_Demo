import React from 'react';
import { useChatStore } from '../../stores/chatStore';

interface User {
    _id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
    online?: boolean;
}

interface ChatRoom {
    _id: string;
    name: string;
    participants: User[];
    type: string;
    createdBy: User;
    updatedAt: string;
}

const ChatRoomList: React.FC = () => {
    const { chatRooms, currentRoom, setCurrentRoom, onlineUsers } = useChatStore();

    const getOtherParticipant = (room: ChatRoom) => {
        return room.participants.find((p: User) => p._id !== useChatStore.getState().currentUser?._id);
    };

    const isUserOnline = (userId: string) => {
        return onlineUsers[userId] || false;
    };

    return (
        <div className="w-80 bg-gradient-to-b from-slate-50 to-slate-100 border-r border-slate-200 flex flex-col shadow-lg">
            <div className="p-6 bg-white border-b border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold text-slate-800">Chat Rooms</h2>
                <p className="text-sm text-slate-500 mt-1">Select a conversation</p>
            </div>
            <div className="flex-1 overflow-y-auto">
                {chatRooms.map((room) => {
                    const otherUser = getOtherParticipant(room);
                    const isOnline = otherUser && isUserOnline(otherUser._id);
                    const isActive = currentRoom?._id === room._id;

                    return (
                        <div
                            key={room._id}
                            onClick={() => setCurrentRoom(room)}
                            className={`p-4 border-b border-slate-100 cursor-pointer transition-all duration-200 hover:bg-slate-50 ${
                                isActive ? 'bg-blue-50 border-l-4 border-l-blue-500 shadow-sm' : ''
                            }`}
                        >
                            <div className="flex items-center space-x-3">
                                <div className="relative">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                                        {otherUser ? otherUser.displayName.charAt(0).toUpperCase() : room.name.charAt(0).toUpperCase()}
                                    </div>
                                    {otherUser && (
                                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                                            isOnline ? 'bg-green-500' : 'bg-gray-400'
                                        }`}></div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <p className={`text-sm font-semibold truncate ${
                                            isActive ? 'text-blue-700' : 'text-slate-800'
                                        }`}>
                                            {otherUser ? otherUser.displayName : room.name}
                                        </p>
                                        <span className="text-xs text-slate-400">
                                            {new Date(room.updatedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between mt-1">
                                        <p className="text-xs text-slate-500 truncate">
                                            {room.participants.length} members
                                        </p>
                                        {otherUser && (
                                            <span className={`text-xs px-2 py-1 rounded-full ${
                                                isOnline 
                                                    ? 'bg-green-100 text-green-700' 
                                                    : 'bg-gray-100 text-gray-600'
                                            }`}>
                                                {isOnline ? 'Online' : 'Offline'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
                {chatRooms.length === 0 && (
                    <div className="p-8 text-center text-slate-500">
                        <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                            💬
                        </div>
                        <p className="text-sm">No conversations yet</p>
                        <p className="text-xs mt-1">Start a new chat to get started</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatRoomList;
