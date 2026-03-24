import React, { useEffect, useRef } from 'react';
import { useChatStore } from '../../stores/chatStore';

interface Message {
    _id: string;
    chatRoomId: string;
    senderId: {
        _id: string;
        displayName: string;
        avatarUrl?: string;
    };
    content: string;
    messageType: 'text' | 'image' | 'video' | 'file';
    fileUrl?: string;
    fileName?: string;
    createdAt: string;
}

const ChatWindow: React.FC = () => {
    const { currentRoom, messages, currentUser, onlineUsers } = useChatStore();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const renderMessageContent = (message: Message) => {
        switch (message.messageType) {
            case 'image':
                return (
                    <div className="max-w-xs">
                        <img 
                            src={message.fileUrl} 
                            alt={message.fileName} 
                            className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(message.fileUrl, '_blank')}
                        />
                        {message.content && <p className="text-sm mt-2">{message.content}</p>}
                    </div>
                );
            case 'video':
                return (
                    <div className="max-w-xs">
                        <video 
                            controls 
                            className="rounded-lg max-w-full h-auto"
                            src={message.fileUrl}
                        />
                        {message.content && <p className="text-sm mt-2">{message.content}</p>}
                    </div>
                );
            case 'file':
                return (
                    <div className="max-w-xs p-3 bg-gray-50 rounded-lg border">
                        <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{message.fileName}</p>
                                <p className="text-xs text-gray-500">Click to download</p>
                            </div>
                        </div>
                        {message.fileUrl && (
                            <a 
                                href={message.fileUrl} 
                                download={message.fileName}
                                className="mt-2 inline-block text-xs text-blue-600 hover:text-blue-800"
                            >
                                Download
                            </a>
                        )}
                    </div>
                );
            default:
                return <p className="text-sm">{message.content}</p>;
        }
    };

    if (!currentRoom) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
                        💬
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">
                        Select a chat room
                    </h3>
                    <p className="text-slate-600 max-w-sm">
                        Choose a conversation from the sidebar to start chatting
                    </p>
                </div>
            </div>
        );
    }

    const otherUser = currentRoom.participants.find(p => p._id !== currentUser?._id);
    const isOtherUserOnline = otherUser && onlineUsers[otherUser._id];

    return (
        <div className="flex-1 flex flex-col bg-slate-50">
            {/* Header */}
            <div className="p-6 bg-white border-b border-slate-200 shadow-sm flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                            {otherUser ? otherUser.displayName.charAt(0).toUpperCase() : currentRoom.name.charAt(0).toUpperCase()}
                        </div>
                        {otherUser && (
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                                isOtherUserOnline ? 'bg-green-500' : 'bg-gray-400'
                            }`}></div>
                        )}
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800">
                            {otherUser ? otherUser.displayName : currentRoom.name}
                        </h3>
                        <p className="text-sm text-slate-500">
                            {otherUser 
                                ? (isOtherUserOnline ? 'Online' : 'Offline')
                                : `${currentRoom.participants.length} members`
                            }
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <svg className="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                    </button>
                    <button className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <svg className="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                            📭
                        </div>
                        <p className="text-slate-500">No messages yet</p>
                        <p className="text-sm text-slate-400 mt-1">Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((message: Message) => (
                        <div
                            key={message._id}
                            className={`flex ${
                                message.senderId._id === currentUser?._id
                                    ? 'justify-end'
                                    : 'justify-start'
                            }`}
                        >
                            <div
                                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                                    message.senderId._id === currentUser?._id
                                        ? 'bg-blue-500 text-white rounded-br-md'
                                        : 'bg-white border border-slate-200 text-slate-900 rounded-bl-md'
                                }`}
                            >
                                {message.senderId._id !== currentUser?._id && (
                                    <p className="text-xs text-slate-500 mb-1 font-medium">
                                        {message.senderId.displayName}
                                    </p>
                                )}
                                {renderMessageContent(message)}
                                <p className={`text-xs mt-2 opacity-70 ${
                                    message.senderId._id === currentUser?._id ? 'text-right' : 'text-left'
                                }`}>
                                    {new Date(message.createdAt).toLocaleTimeString([], { 
                                        hour: '2-digit', 
                                        minute: '2-digit' 
                                    })}
                                </p>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>
        </div>
    );
};

export default ChatWindow;