// Fixed ARVRLearningSpace.js
import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { XR, VRButton, ARButton } from '@react-three/xr';
import {
  OrbitControls, Text, Sphere, Cylinder, Html, useGLTF, Environment, ContactShadows 
} from '@react-three/drei';
import { Alert, Box, Button, Card, CardContent, Chip, Grid, LinearProgress, Typography } from '@mui/material';
import { 
  School, 
  Visibility as VisibilityIcon, 
  ThreeDRotation, 
  Psychology, 
  Quiz 
} from '@mui/icons-material';

// Phase 3A: AR/VR Learning Components
// Immersive 3D learning environments with WebXR support

// 3D Learning Environment Component
const LearningEnvironment = ({ lessonContent, interactionMode = 'mouse' }) => {
  const groupRef = useRef();
  const [hoveredObject, setHoveredObject] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Simple geometric objects as placeholders for actual learning content */}
      <Sphere 
        args={[1, 32, 32]} 
        position={[-2, 0, 0]}
        onClick={() => handleObjectSelect('sphere')}
        onPointerOver={() => setHoveredObject('sphere')}
        onPointerOut={() => setHoveredObject(null)}
      >
        <meshStandardMaterial 
          color={hoveredObject === 'sphere' ? '#88ccff' : '#2266cc'} 
          emissive={selectedObject === 'sphere' ? '#553311' : '#000000'}
        />
      </Sphere>
      
      <Cylinder 
        args={[0.75, 0.75, 2, 32]} 
        position={[2, 0, 0]} 
        rotation={[Math.PI / 2, 0, 0]}
        onClick={() => handleObjectSelect('cylinder')}
        onPointerOver={() => setHoveredObject('cylinder')}
        onPointerOut={() => setHoveredObject(null)}
      >
        <meshStandardMaterial 
          color={hoveredObject === 'cylinder' ? '#ffcc88' : '#cc6622'} 
          emissive={selectedObject === 'cylinder' ? '#335511' : '#000000'}
        />
      </Cylinder>
      
      {/* Text labels for educational content */}
      <Text
        position={[-2, 1.5, 0]}
        fontSize={0.25}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {lessonContent.objects?.sphere?.label || 'Learning Object 1'}
      </Text>
      
      <Text
        position={[2, 1.5, 0]}
        fontSize={0.25}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {lessonContent.objects?.cylinder?.label || 'Learning Object 2'}
      </Text>
      
      {/* Floating HTML content */}
      {selectedObject && (
        <Html position={[0, 2.5, 0]} center>
          <div style={{
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            width: '200px',
            textAlign: 'center'
          }}>
            <h3>{selectedObject === 'sphere' ? 'Sphere Object' : 'Cylinder Object'}</h3>
            <p>{
              selectedObject === 'sphere'
                ? (lessonContent.objects?.sphere?.description || 'Detailed information about Learning Object 1')
                : (lessonContent.objects?.cylinder?.description || 'Detailed information about Learning Object 2')
            }</p>
          </div>
        </Html>
      )}
      
      {/* Environment lighting */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <ContactShadows 
        opacity={0.4}
        scale={10}
        blur={1}
        far={10}
        resolution={256}
      />
    </group>
  );
  
  function handleObjectSelect(objectType) {
    setSelectedObject(prevSelected => prevSelected === objectType ? null : objectType);
    
    if (interactionMode === 'xr') {
      // XR-specific interaction handling
      hapticFeedback(0.7, 50);
    }
  }
};

// AR/VR Learning Space Component
const ARVRLearningSpace = ({ lessonId = '1', mode = 'default' }) => {
  const [lessonContent, setLessonContent] = useState({
    title: 'Interactive 3D Learning',
    description: 'Explore concepts in an immersive environment',
    models: [
      { id: '1', type: 'sphere', position: [-2, 0, 0] },
      { id: '2', type: 'cylinder', position: [2, 0, 0] }
    ],
    objects: {
      sphere: {
        label: 'Core Concept',
        description: 'This represents the foundational knowledge for this lesson'
      },
      cylinder: {
        label: 'Applied Knowledge',
        description: 'This demonstrates practical applications of the core concepts'
      }
    },
    interactionCount: 0
  });
  
  const [xrSupported, setXRSupported] = useState(false);
  const [vrEnabled, setVREnabled] = useState(false);
  const [arEnabled, setAREnabled] = useState(false);
  const [error, setError] = useState(null);
  const [canvasRef, setCanvasRef] = useState(null);
  
  // Check XR support on component mount
  useEffect(() => {
    checkXRSupport();
  }, []);
  
  // Function to check XR capability
  async function checkXRSupport() {
    try {
      if (navigator.xr) {
        // Check VR support
        const vrSupported = await navigator.xr.isSessionSupported('immersive-vr');
        setVREnabled(vrSupported);
        
        // Check AR support
        const arSupported = await navigator.xr.isSessionSupported('immersive-ar');
        setAREnabled(arSupported);
        
        setXRSupported(vrSupported || arSupported);
      } else {
        setError('WebXR not supported in this browser');
        console.warn('WebXR not supported');
      }
    } catch (err) {
      console.error('Error checking XR support:', err);
      setError('Error initializing XR environment');
    }
  }
  
  // Handle user interactions
  const handleInteraction = (event) => {
    console.log('XR Interaction:', event);
    
    // Update interaction count and potentially send analytics
    setLessonContent(prev => ({
      ...prev,
      interactionCount: (prev.interactionCount || 0) + 1
    }));
  };
  
  // Helper for haptic feedback in XR controllers
  const hapticFeedback = (strength = 1.0, duration = 100) => {
    // This would need to be implemented with the WebXR Gamepad API
    console.log(`Haptic feedback: ${strength} strength for ${duration}ms`);
    // In a real implementation, we'd do something like:
    // if (xrSession && xrInputSources) { ... }
  };
  
  if (error) {
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <ThreeDRotation sx={{ mr: 1 }} />
                Immersive Learning
              </Typography>
              <Typography paragraph>
                Experience {lessonContent.title} in virtual reality with interactive 3D models.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {xrSupported && (
                  <>
                    {vrEnabled && (
                      <VRButton
                        onClick={() => handleInteraction({ type: 'vr-entered' })}
                      />
                    )}
                    {arEnabled && (
                      <ARButton
                        onClick={() => handleInteraction({ type: 'ar-entered' })}
                      />
                    )}
                  </>
                )}
                <Button
                  variant="outlined"
                  startIcon={<School />}
                  onClick={() => handleInteraction({ type: 'lesson-started' })}
                >
                  Start Lesson
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Psychology sx={{ mr: 1 }} />
                Learning Analytics
              </Typography>
              <Typography paragraph>
                Track your interaction patterns and learning progress in real-time.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label={`Objects: ${lessonContent.models?.length || 0}`} />
                <Chip label={`Interactions: ${lessonContent.interactionCount || 0}`} />
                <Chip label={xrSupported ? 'XR Ready' : 'Standard 3D'} color="primary" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            3D Learning Environment
          </Typography>
          <Canvas 
            ref={canvasRef} 
            style={{ height: '500px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
            camera={{ position: [0, 0, 8], fov: 75 }}
          >
            {xrSupported ? (
              <XR>                
                <LearningEnvironment 
                  lessonContent={lessonContent}
                  interactionMode="xr"
                />
                {/* XR Controllers and Hands - commented out due to API changes */}
                {/* <XRController />
                <Hand /> */}
              </XR>
            ) : (
              <>
                <LearningEnvironment 
                  lessonContent={lessonContent}
                  interactionMode="mouse"
                />
                <OrbitControls 
                  enableZoom 
                  enablePan 
                  enableRotate 
                  maxDistance={15}
                  minDistance={3}
                />
              </>
            )}
          </Canvas>
          
          {/* Controls and information */}
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {xrSupported ? 'Use VR/AR buttons above or mouse to interact' : 'Use mouse to rotate, zoom and explore'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                startIcon={<Quiz />}
                onClick={() => handleInteraction({ type: 'quiz-opened' })}
              >
                Quiz
              </Button>
              <Button
                size="small"
                startIcon={<VisibilityIcon />}
                onClick={() => handleInteraction({ type: 'fullscreen-toggled' })}
              >
                Fullscreen
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ARVRLearningSpace;
