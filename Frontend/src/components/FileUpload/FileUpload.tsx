import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useChatStore } from '../../stores/chatStore';
import { Image, File, Video } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File, messageType: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const { uploadFile } = useChatStore();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      // Upload file
      try {
        const uploadResult = await uploadFile(file);
        onFileSelect(file, uploadResult.messageType);
      } catch (error) {
        console.error('Upload failed', error);
      }
    }
  }, [uploadFile, onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': [],
      'video/*': [],
      '.pdf': [],
      '.doc': [],
      '.docx': [],
      '.zip': [],
      '.rar': [],
    },
    maxFiles: 1
  });

  return (
    <div 
      {...getRootProps()}
      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p className="text-blue-500">
          <File className="mx-auto h-12 w-12 mb-4" />
          Drop the files here ...
        </p>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-4 text-gray-500">
            <Image className="h-8 w-8" />
            <Video className="h-8 w-8" />
            <File className="h-8 w-8" />
          </div>
          <p className="text-lg font-medium text-gray-900">
            Drag & drop or click to upload
          </p>
          <p className="text-sm text-gray-500">
            Images, videos, documents, folders (PNG, JPG, MP4, PDF, ZIP...)
          </p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;

