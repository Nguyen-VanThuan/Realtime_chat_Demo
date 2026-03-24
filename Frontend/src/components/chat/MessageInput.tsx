import React, { useState, useRef } from 'react';
import { Send, Paperclip, Upload } from 'lucide-react';
import { useChatStore } from '../../stores/chatStore';

const MessageInput: React.FC = () => {
    const [message, setMessage] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { sendMessage, currentRoom, uploadFile } = useChatStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim() && currentRoom && !isUploading) {
            await sendMessage({ content: message.trim(), roomId: currentRoom._id });
            setMessage('');
        }
    };

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !currentRoom) return;
        await processFile(file);
    };

    const processFile = async (file: File) => {
        setIsUploading(true);
        try {
            const uploadResult = await uploadFile(file);
            await sendMessage({
                content: '',
                roomId: currentRoom!._id,
                messageType: uploadResult.messageType,
                fileUrl: uploadResult.fileUrl,
                fileName: uploadResult.fileName
            });
        } catch (error) {
            console.error('File upload failed:', error);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0 && currentRoom) {
            await processFile(files[0]);
        }
    };

    const openFileDialog = () => {
        fileInputRef.current?.click();
    };

    if (!currentRoom) return null;

    return (
        <div className="p-4 bg-white border-t border-slate-200">
            <form onSubmit={handleSubmit} className="flex items-end space-x-3">
                <div className="flex-1 relative">
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`relative border-2 border-dashed rounded-2xl transition-all duration-200 ${
                            isDragOver 
                                ? 'border-blue-400 bg-blue-50' 
                                : 'border-slate-300 hover:border-slate-400'
                        }`}
                    >
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }
                            }}
                            placeholder="Type a message or drag & drop files..."
                            rows={1}
                            className="w-full px-4 py-3 pr-12 bg-transparent border-none outline-none resize-none max-h-32 overflow-y-auto"
                            style={{ minHeight: '48px' }}
                        />
                        <button
                            type="button"
                            onClick={openFileDialog}
                            disabled={isUploading}
                            className="absolute right-3 bottom-3 p-1 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50"
                        >
                            <Paperclip size={18} className="text-slate-500" />
                        </button>
                        
                        {isDragOver && (
                            <div className="absolute inset-0 flex items-center justify-center bg-blue-50 bg-opacity-90 rounded-2xl border-2 border-blue-400 border-dashed">
                                <div className="text-center">
                                    <Upload className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                                    <p className="text-sm font-medium text-blue-700">Drop file here</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={!message.trim() || isUploading}
                    className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
                >
                    {isUploading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <Send size={20} />
                    )}
                </button>
            </form>
            <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                accept="image/*,video/*,.pdf,.doc,.docx,.txt,.zip,.rar"
                className="hidden"
            />
            {isUploading && (
                <div className="mt-2 text-sm text-slate-500 text-center">
                    Uploading file...
                </div>
            )}
        </div>
    );
};

export default MessageInput;