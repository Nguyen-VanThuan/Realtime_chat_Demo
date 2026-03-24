# Realtime Chat Full Feature Implementation TODO

## Approved Plan Summary
- Backend: Socket auth, online status, video signaling, file upload route
- Frontend: Notifications, online/offline display, file uploads, video call UI
- New deps: ✅ simple-peer, react-dropzone, uuid

## Steps (2/15 complete)

### Phase 1: Dependencies [✅]
1. cd Frontend && npm install simple-peer react-dropzone [✅]
2. cd Backend && npm install uuid [✅]

### Phase 2: Backend Socket Enhancements [ ]
3. Edit Backend/src/server.js: Socket auth, online tracking [✅]
4. Edit Backend/src/routes/chatRoute.js: /upload [ ]
4. Edit Backend/src/routes/chatRoute.js: /upload [ ]
5. chatController.js: File uploads [ ]

### Phase 3: Frontend Stores [ ]
6. chatStore.ts: onlineUsers, video call state [✅]

**Next step: Backend socket auth/online status**


### Phase 2: Backend Socket Enhancements [ ]
3. Edit Backend/src/server.js: Add socket auth, online users tracking
4. Edit Backend/src/routes/chatRoute.js: Add /upload endpoint
5. Update chatController.js: Handle file uploads

### Phase 3: Frontend State & Stores [ ]
6. Edit Frontend/src/stores/chatStore.ts: Add onlineUsers, callState, upload, video signaling
7. Add getUserSocketId action

### Phase 4: New Components [ ]
8. Create Frontend/src/components/VideoCall/VideoCall.tsx
9. Create Frontend/src/components/FileUpload/FileUpload.tsx
10. Create Frontend/src/components/Notification/NotificationToast.tsx

### Phase 5: Update Existing UI [ ]
11. Edit ChatRoomList.tsx: Online status dots
12. Edit ChatWindow.tsx: Files preview, call button, notifications
13. Edit MessageInput.tsx: File attach
14. Edit ChatApp.tsx: Integrate new components

### Phase 6: Testing [ ]
15. Test all features, run frontend/backend

**Next step: Install dependencies**

