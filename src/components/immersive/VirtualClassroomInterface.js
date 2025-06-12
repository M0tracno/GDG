import React, { useState, useEffect, useRef } from 'react';
import { 
  CameraAlt, 
  Chat, 
  Fullscreen, 
  FullscreenExit, 
  Mic, 
  MicOff, 
  PanTool, 
  People, 
  RecordVoiceOver, 
  School, 
  ScreenShare, 
  Send as SendIcon, 
  Settings, 
  Stop, 
  StopScreenShare, 
  ThreeDRotation, 
  VideocamOff, 
  VolumeOff, 
  VolumeUp 
} from '@mui/icons-material';
import VirtualClassroomService from '../../services/VirtualClassroomService';
import ARVRLearningSpace from './ARVRLearningSpace';

import { Alert, Avatar, Box, Card, CardContent, Chip, FormControlLabel, Grid, IconButton, LinearProgress, List, ListItem, ListItemAvatar, ListItemText, Switch, TextField, Tooltip, Typography } from '@mui/material';
// Phase 3A: Virtual Classroom Interface
// Complete virtual classroom UI with video conferencing and collaborative tools

const VirtualClassroomInterface = ({ 
  classroomId, 
  userRole = 'student',
  userName = 'User',
  onClassroomJoin,
  onClassroomLeave 
}) => {
  // State management
  const [isConnected, setIsConnected] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [participants, setParticipants] = useState(new Map());
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  // Media controls
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [recording, setRecording] = useState(false);
  const [speakerEnabled, setSpeakerEnabled] = useState(true);
  
  // UI controls
  const [chatOpen, setChatOpen] = useState(false);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [arvrEnabled, setArvrEnabled] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  
  // Refs
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const messagesEndRef = useRef(null);
  const classroomService = useRef(null);

  useEffect(() => {
    initializeClassroom();
    return () => {
      cleanup();
    };
  }, [classroomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeClassroom = async () => {
    try {
      setIsInitializing(true);
      
      // Initialize the virtual classroom service
      classroomService.current = new VirtualClassroomService();
      await classroomService.current.initialize();
      
      // Setup event listeners
      setupEventListeners();
      
      // Join the classroom
      const result = await classroomService.current.initializeVirtualClassroom(
        classroomId, 
        userRole,
        {
          mediaSettings: {
            video: cameraEnabled,
            audio: micEnabled
          },
          enableARVR: false // Start with traditional mode
        }
      );
      
      if (result.success) {
        setIsConnected(true);
        setParticipants(new Map(result.participants?.map(p => [p.id, p]) || []));
        
        if (onClassroomJoin) {
          onClassroomJoin(result);
        }
        
        // Add welcome message
        addSystemMessage(`Welcome to virtual classroom ${classroomId}!`);
      }
    } catch (error) {
      console.error('Failed to initialize classroom:', error);
      addSystemMessage(`Failed to join classroom: ${error.message}`, 'error');
    } finally {
      setIsInitializing(false);
    }
  };

  const setupEventListeners = () => {
    if (!classroomService.current) return;

    const service = classroomService.current;
    
    service.on('participant-joined', handleParticipantJoined);
    service.on('participant-left', handleParticipantLeft);
    service.on('screen-share-started', handleScreenShareStarted);
    service.on('screen-share-stopped', handleScreenShareStopped);
    service.on('recording-started', handleRecordingStarted);
    service.on('recording-stopped', handleRecordingsStopped);
    service.on('media-ready', handleMediaReady);
    service.on('error', handleServiceError);
  };

  const handleParticipantJoined = (participant) => {
    setParticipants(prev => new Map(prev.set(participant.id, participant)));
    addSystemMessage(`${participant.name || 'Someone'} joined the classroom`);
  };

  const handleParticipantLeft = (participantId) => {
    const participant = participants.get(participantId);
    setParticipants(prev => {
      const newMap = new Map(prev);
      newMap.delete(participantId);
      return newMap;
    });
    addSystemMessage(`${participant?.name || 'Someone'} left the classroom`);
  };

  const handleScreenShareStarted = () => {
    setScreenSharing(true);
    addSystemMessage('Screen sharing started');
  };

  const handleScreenShareStopped = () => {
    setScreenSharing(false);
    addSystemMessage('Screen sharing stopped');
  };

  const handleRecordingStarted = () => {
    setRecording(true);
    addSystemMessage('Session recording started');
  };

  const handleRecordingsStopped = () => {
    setRecording(false);
    addSystemMessage('Session recording stopped');
  };

  const handleMediaReady = (mediaStatus) => {
    console.log('Media ready:', mediaStatus);
  };

  const handleServiceError = (error) => {
    console.error('Classroom service error:', error);
    addSystemMessage(`Error: ${error.message}`, 'error');
  };

  const addSystemMessage = (text, type = 'info') => {
    const message = {
      id: Date.now(),
      type: 'system',
      text,
      timestamp: new Date().toLocaleTimeString(),
      severity: type
    };
    setMessages(prev => [...prev, message]);
  };

  const addChatMessage = (text, sender = userName) => {
    const message = {
      id: Date.now(),
      type: 'chat',
      text,
      sender,
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, message]);
  };

  const toggleCamera = async () => {
    try {
      // Implementation would interact with VirtualClassroomService
      setCameraEnabled(!cameraEnabled);
      addSystemMessage(`Camera ${!cameraEnabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Failed to toggle camera:', error);
    }
  };

  const toggleMicrophone = async () => {
    try {
      setMicEnabled(!micEnabled);
      addSystemMessage(`Microphone ${!micEnabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Failed to toggle microphone:', error);
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!screenSharing) {
        await classroomService.current?.startScreenShare();
      } else {
        await classroomService.current?.stopScreenShare();
      }
    } catch (error) {
      console.error('Failed to toggle screen share:', error);
      addSystemMessage(`Screen sharing failed: ${error.message}`, 'error');
    }
  };

  const toggleRecording = async () => {
    try {
      if (!recording) {
        await classroomService.current?.startSessionRecording();
      } else {
        classroomService.current?.stopSessionRecording();
      }
    } catch (error) {
      console.error('Failed to toggle recording:', error);
      addSystemMessage(`Recording failed: ${error.message}`, 'error');
    }
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      addChatMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const toggleFullscreen = () => {
    if (!fullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setFullscreen(!fullscreen);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const cleanup = async () => {
    try {
      if (classroomService.current) {
        await classroomService.current.cleanup();
      }
      if (onClassroomLeave) {
        onClassroomLeave();
      }
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  };

  if (isInitializing) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Connecting to Virtual Classroom...
          </Typography>
          <LinearProgress sx={{ mt: 2 }} />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Initializing video, audio, and collaborative features
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      {/* Header */}
      <Card sx={{ mb: 1 }}>
        <CardContent sx={{ py: 1 }}>
          <Grid container alignItems="center" justifyContent="space-between">
            <Grid item>
              <Typography variant="h6">
                Virtual Classroom: {classroomId}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {participants.size} participants • {userRole} • {isConnected ? 'Connected' : 'Disconnected'}
              </Typography>
            </Grid>
            <Grid item>
              <Chip
                label={recording ? 'Recording' : 'Not Recording'}
                color={recording ? 'error' : 'default'}
                size="small"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Grid container sx={{ flex: 1, height: 'calc(100vh - 200px)' }}>
        {/* Video Area */}
        <Grid size={{xs:12,md:6,lg:9}}>
          <Card sx={{ height: '100%', position: 'relative' }}>
            <CardContent sx={{ height: '100%', p: 1 }}>
              {arvrEnabled ? (
                <ARVRLearningSpace
                  lessonContent={{
                    title: "Virtual Classroom Session",
                    description: "Interactive 3D classroom environment",
                    models: [
                      { id: 'whiteboard', type: 'box', title: 'Virtual Whiteboard', position: [0, 1, -2], color: '#ffffff' },
                      { id: 'desk', type: 'box', title: 'Teacher Desk', position: [0, -1, -1], color: '#8b4513' }
                    ]
                  }}
                  onInteraction={(data) => addSystemMessage(`AR/VR Interaction: ${data.type}`)}
                />
              ) : (
                <Box sx={{ 
                  height: '100%', 
                  bgcolor: 'grey.900', 
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                  {/* Main video display */}
                  <video
                    ref={remoteVideoRef}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: 8
                    }}
                    autoPlay
                    playsInline
                  />
                  
                  {/* Local video (picture-in-picture) */}
                  <Box sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    width: 200,
                    height: 150,
                    bgcolor: 'grey.800',
                    borderRadius: 1,
                    overflow: 'hidden'
                  }}>
                    <video
                      ref={localVideoRef}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                      autoPlay
                      playsInline
                      muted
                    />
                  </Box>

                  {/* Screen sharing indicator */}
                  {screenSharing && (
                    <Chip
                      label="Screen Sharing Active"
                      color="primary"
                      sx={{ position: 'absolute', top: 16, left: 16 }}
                    />
                  )}

                  {/* No video placeholder */}
                  {!isConnected && (
                    <Box sx={{ textAlign: 'center', color: 'white' }}>
                      <School sx={{ fontSize: 48, mb: 1 }} />
                      <Typography variant="h6">
                        Virtual Classroom
                      </Typography>
                      <Typography variant="body2">
                        Connect to start your learning experience
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>        {/* Sidebar */}
        <Grid size={{xs:12, md: chatOpen || participantsOpen ? 6 : 3}}>
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
            {/* Participants */}
            <Card sx={{ flex: 1 }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  <People sx={{ mr: 1 }} />
                  Participants ({participants.size})
                </Typography>
                <List dense>
                  {Array.from(participants.values()).map((participant) => (
                    <ListItem key={participant.id}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {participant.name?.[0] || 'U'}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={participant.name || 'Anonymous'}
                        secondary={participant.role}
                      />
                      {participant.handRaised && (
                        <PanTool color="warning" />
                      )}
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>

            {/* Chat */}
            <Card sx={{ flex: 2 }}>
              <CardContent sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" gutterBottom>
                  <Chat sx={{ mr: 1 }} />
                  Chat
                </Typography>
                
                <Box sx={{ flex: 1, overflow: 'auto', mb: 2 }}>
                  {messages.map((message) => (
                    <Box key={message.id} sx={{ mb: 1 }}>
                      {message.type === 'system' ? (
                        <Alert severity={message.severity || 'info'} sx={{ py: 0 }}>
                          <Typography variant="caption">
                            {message.timestamp} - {message.text}
                          </Typography>
                        </Alert>
                      ) : (
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            {message.timestamp} - {message.sender}:
                          </Typography>
                          <Typography variant="body2">
                            {message.text}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  ))}
                  <div ref={messagesEndRef} />
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    size="small"
                    fullWidth
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <IconButton onClick={sendMessage} color="primary">
                    <SendIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>

      {/* Controls Bar */}
      <Card sx={{ mt: 1 }}>
        <CardContent sx={{ py: 1 }}>
          <Grid container alignItems="center" justifyContent="space-between">
            {/* Media Controls */}
            <Grid item>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title={cameraEnabled ? 'Turn off camera' : 'Turn on camera'}>
                  <IconButton 
                    onClick={toggleCamera}
                    color={cameraEnabled ? 'primary' : 'default'}                  >
                    {cameraEnabled ? <CameraAlt /> : <VideocamOff />}
                  </IconButton>
                </Tooltip>
                
                <Tooltip title={micEnabled ? 'Mute microphone' : 'Unmute microphone'}>
                  <IconButton 
                    onClick={toggleMicrophone}
                    color={micEnabled ? 'primary' : 'default'}
                  >
                    {micEnabled ? <Mic /> : <MicOff />}
                  </IconButton>
                </Tooltip>
                
                <Tooltip title={speakerEnabled ? 'Mute speaker' : 'Unmute speaker'}>
                  <IconButton 
                    onClick={() => setSpeakerEnabled(!speakerEnabled)}
                    color={speakerEnabled ? 'primary' : 'default'}
                  >
                    {speakerEnabled ? <VolumeUp /> : <VolumeOff />}
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>

            {/* Feature Controls */}
            <Grid item>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Tooltip title={screenSharing ? 'Stop screen sharing' : 'Start screen sharing'}>
                  <IconButton 
                    onClick={toggleScreenShare}
                    color={screenSharing ? 'secondary' : 'default'}
                  >
                    {screenSharing ? <StopScreenShare /> : <ScreenShare />}
                  </IconButton>
                </Tooltip>
                
                <Tooltip title={recording ? 'Stop recording' : 'Start recording'}>
                  <IconButton 
                    onClick={toggleRecording}
                    color={recording ? 'error' : 'default'}
                  >
                    {recording ? <Stop /> : <RecordVoiceOver />}
                  </IconButton>
                </Tooltip>                <Tooltip title="Raise hand">
                  <IconButton 
                    onClick={() => setHandRaised(!handRaised)}
                    color={handRaised ? 'warning' : 'default'}
                  >
                    <PanTool />
                  </IconButton>
                </Tooltip>

                <FormControlLabel
                  control={
                    <Switch
                      checked={arvrEnabled}
                      onChange={(e) => setArvrEnabled(e.target.checked)}
                      size="small"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <ThreeDRotation fontSize="small" />
                      AR/VR
                    </Box>
                  }
                />
              </Box>
            </Grid>

            {/* Utility Controls */}
            <Grid item>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}>
                  <IconButton onClick={toggleFullscreen}>
                    {fullscreen ? <FullscreenExit /> : <Fullscreen />}
                  </IconButton>
                </Tooltip>
                
                <IconButton>
                  <Settings />
                </IconButton>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default VirtualClassroomInterface;

