import React, { useEffect, useRef, useState } from 'react';
import { PhoneOff, Mic, MicOff, Video, VideoOff, Maximize2, Minimize2, Users } from 'lucide-react';
import { useChatStore } from '../../stores/chatStore';

interface VideoCallProps {
  currentRoom: {
    _id: string;
    participants: Array<{
      _id: string;
      displayName: string;
    }>;
  };
}

const VideoCall: React.FC<VideoCallProps> = ({ currentRoom }) => {
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    videoCall,
    currentUser,
    endCall
  } = useChatStore();

  useEffect(() => {
    if (videoCall.localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = videoCall.localStream;
    }
  }, [videoCall.localStream]);

  useEffect(() => {
    if (videoCall.remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = videoCall.remoteStream;
    }
  }, [videoCall.remoteStream]);

  const toggleMedia = (type: 'video' | 'audio', enabled: boolean) => {
    if (type === 'video') {
      setIsVideoOn(enabled);
    } else {
      setIsMicOn(enabled);
    }

    videoCall.localStream?.getTracks().forEach((track) => {
      if (track.kind === type) {
        track.enabled = enabled;
      }
    });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (!currentRoom) return null;

  const otherUser = currentRoom.participants.find((p: { _id: string; displayName: string }) => p._id !== currentUser?._id);

  return (
    <div ref={containerRef} className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
            {otherUser ? otherUser.displayName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h3 className="text-white font-medium">
              {otherUser ? otherUser.displayName : 'Group Call'}
            </h3>
            <p className="text-gray-300 text-sm">
              {videoCall.callEnded ? 'Call ended' : 
               videoCall.receivingCall ? 'Incoming call...' : 
               'Connected'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-gray-800/50 rounded-lg px-3 py-1">
            <Users size={16} className="text-gray-400" />
            <span className="text-white text-sm">{currentRoom.participants.length}</span>
          </div>
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-gray-800/50 hover:bg-gray-700/50 text-white rounded-lg transition-colors"
          >
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
        </div>
      </div>

      {/* Video container */}
      <div className="flex-1 flex gap-4 p-4 relative">
        {/* Remote video */}
        <div className="flex-1 bg-gray-900 rounded-xl overflow-hidden relative shadow-2xl">
          {videoCall.remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                  {otherUser ? otherUser.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
                <p className="text-white text-xl font-medium">
                  {otherUser ? otherUser.displayName : 'Waiting...'}
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  {videoCall.receivingCall ? 'Incoming call...' : 'Connecting...'}
                </p>
                {videoCall.receivingCall && (
                  <div className="mt-4 flex space-x-3">
                    <button className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors">
                      Accept
                    </button>
                    <button 
                      onClick={endCall}
                      className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Connection status overlay */}
          {!videoCall.callEnded && !videoCall.receivingCall && (
            <div className="absolute top-4 left-4 bg-green-500/90 text-white px-3 py-1 rounded-full text-sm font-medium">
              Connected
            </div>
          )}
        </div>

        {/* Local video */}
        <div className="w-72 h-48 bg-gray-900 rounded-xl overflow-hidden absolute bottom-24 right-8 border-2 border-white shadow-2xl">
          {videoCall.localStream && isVideoOn ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full mx-auto mb-3 flex items-center justify-center text-xl font-bold text-white">
                  {currentUser?.displayName?.charAt(0).toUpperCase() || 'Y'}
                </div>
                <p className="text-white text-sm font-medium">You</p>
                {!isVideoOn && <p className="text-gray-400 text-xs">Camera off</p>}
              </div>
            </div>
          )}
          
          {/* Local video label */}
          <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
            You
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 bg-gray-900/80 backdrop-blur-sm border-t border-gray-700">
        <div className="flex items-center justify-center space-x-6">
          {/* Microphone */}
          <button
            onClick={() => toggleMedia('audio', !isMicOn)}
            className={`p-4 rounded-full transition-all duration-200 transform hover:scale-105 shadow-lg ${
              isMicOn
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
          </button>

          {/* Video */}
          <button
            onClick={() => toggleMedia('video', !isVideoOn)}
            className={`p-4 rounded-full transition-all duration-200 transform hover:scale-105 shadow-lg ${
              isVideoOn
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
          >
            {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
          </button>

          {/* End call */}
          <button
            onClick={endCall}
            className="p-4 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <PhoneOff size={24} />
          </button>
        </div>

        {/* Call status */}
        <div className="text-center mt-4">
          <p className="text-white text-sm opacity-75">
            {videoCall.callEnded ? 'Call ended' :
             videoCall.receivingCall ? 'Incoming call...' :
             'Connected'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoCall;

