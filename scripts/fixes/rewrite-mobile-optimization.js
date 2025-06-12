const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'mobile', 'MobileOptimization.js');

const newContent = `// filepath: c:\\Users\\AYUSHMAN NANDA\\OneDrive\\Desktop\\GDC\\src\\components\\mobile\\MobileOptimization.js
import React, { useRef, useEffect, useState } from 'react';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// Mobile optimization utilities and touch gesture support

// Touch gesture detection hook
export const useGestureDetection = (element, options = {}) => {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onPinch,
    onTap,
    onDoubleTap,
    onLongPress,
    threshold = 50,
    longPressDelay = 500
  } = options;

  const [touchState, setTouchState] = useState({
    isTouching: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    startDistance: 0,
    currentDistance: 0,
    startTime: 0,
    tapCount: 0
  });

  useEffect(() => {
    if (!element) return;

    const el = typeof element === 'function' ? element() : element;
    if (!el) return;

    let longPressTimer = null;
    let doubleTapTimer = null;

    const handleTouchStart = (e) => {
      e.preventDefault();
      
      const touch = e.touches[0];
      
      setTouchState({
        isTouching: true,
        startX: touch.clientX,
        startY: touch.clientY,
        currentX: touch.clientX,
        currentY: touch.clientY,
        startDistance: e.touches.length > 1 ? getDistance(e.touches[0], e.touches[1]) : 0,
        currentDistance: e.touches.length > 1 ? getDistance(e.touches[0], e.touches[1]) : 0,
        startTime: Date.now(),
        tapCount: touchState.tapCount
      });

      if (onLongPress) {
        longPressTimer = setTimeout(() => {
          onLongPress(e);
        }, longPressDelay);
      }
    };

    const handleTouchMove = (e) => {
      if (!touchState.isTouching) return;

      const touch = e.touches[0];
      
      setTouchState(prev => ({
        ...prev,
        currentX: touch.clientX,
        currentY: touch.clientY,
        currentDistance: e.touches.length > 1 ? getDistance(e.touches[0], e.touches[1]) : prev.currentDistance
      }));

      // Pinch detection
      if (e.touches.length > 1 && onPinch) {
        const currentDistance = getDistance(e.touches[0], e.touches[1]);
        const initialDistance = touchState.startDistance || currentDistance; // Fallback if not set
        
        const scale = currentDistance / initialDistance;
        onPinch({
          scale,
          center: {
            x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
            y: (e.touches[0].clientY + e.touches[1].clientY) / 2
          }
        });
      }

      // Cancel long press if moved too much
      if (longPressTimer) {
        const deltaX = touch.clientX - touchState.startX;
        const deltaY = touch.clientY - touchState.startY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        if (distance > 10) { // Small threshold for movement
          clearTimeout(longPressTimer);
          longPressTimer = null;
        }
      }
    };

    const handleTouchEnd = (e) => {
      if (!touchState.isTouching) return;

      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
      
      const deltaX = touchState.currentX - touchState.startX;
      const deltaY = touchState.currentY - touchState.startY;
      const deltaTime = Date.now() - touchState.startTime;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // Swipe detection
      if (distance > threshold && deltaTime < 500) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          if (deltaX > 0 && onSwipeRight) onSwipeRight(e);
          if (deltaX < 0 && onSwipeLeft) onSwipeLeft(e);
        } else {
          if (deltaY > 0 && onSwipeDown) onSwipeDown(e);
          if (deltaY < 0 && onSwipeUp) onSwipeUp(e);
        }
      }

      // Tap detection
      if (distance < 10 && deltaTime < 300) {
        setTouchState(prev => ({ ...prev, tapCount: prev.tapCount + 1 }));

        if (doubleTapTimer) {
          clearTimeout(doubleTapTimer);
          doubleTapTimer = null;
          if (onDoubleTap) onDoubleTap(e);
          setTouchState(prev => ({ ...prev, tapCount: 0 }));
        } else {
          doubleTapTimer = setTimeout(() => {
            if (touchState.tapCount === 1 && onTap) onTap(e);
            setTouchState(prev => ({ ...prev, tapCount: 0 }));
            doubleTapTimer = null;
          }, 250);
        }
      }
    };

    const getDistance = (touch1, touch2) => {
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: false });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
      if (longPressTimer) clearTimeout(longPressTimer);
      if (doubleTapTimer) clearTimeout(doubleTapTimer);
    };
  }, [element, options, touchState]);

  return touchState;
};

// Responsive design hook
export const useResponsiveDesign = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));

  const [orientation, setOrientation] = useState(
    window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
  );

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(
        window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      );
    };

    window.addEventListener('resize', handleOrientationChange);
    return () => window.removeEventListener('resize', handleOrientationChange);
  }, []);

  // Detect if running on a mobile device
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  
  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
    setIsMobileDevice(isMobile);
  }, []);

  return {
    isDesktop,
    isLargeScreen,
    isMobile: !isDesktop,
    isMobileDevice,
    orientation
  };
};

// Mobile navigation optimization
export const useMobileNavigation = (options = {}) => {
  const {
    bottomNavItems = [],
    sideNavItems = [],
    breakpoint = 'md'
  } = options;
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down(breakpoint));
  const [activeNavItem, setActiveNavItem] = useState(null);
  
  // Show bottom nav on mobile, side nav on desktop
  const navItems = isMobile ? bottomNavItems : sideNavItems;
  
  const handleNavChange = (item) => {
    setActiveNavItem(item);
    if (item.onClick) item.onClick();
  };
  
  return {
    isMobile,
    navItems,
    activeNavItem,
    handleNavChange
  };
};

// Optimize images for mobile devices
export const useOptimizedImages = (images = [], options = {}) => {
  const {
    mobileSizes = [300, 600],
    desktopSizes = [800, 1200, 1600],
    lazyLoad = true,
    quality = 80
  } = options;
  
  const { isMobile } = useResponsiveDesign();
  const sizes = isMobile ? mobileSizes : desktopSizes;
  
  const optimizedImages = images.map(image => {
    // For demo purposes, just creating srcSet
    const srcSet = sizes.map(size => 
      \`\${image.url}?w=\${size}&q=\${quality} \${size}w\`
    ).join(', ');
    
    return {
      ...image,
      srcSet,
      sizes: isMobile 
        ? '(max-width: 600px) 100vw, 600px' 
        : '(max-width: 1600px) 50vw, 800px',
      loading: lazyLoad ? 'lazy' : 'eager'
    };
  });
  
  return optimizedImages;
};

// Mobile data saving mode
export const useDataSavingMode = () => {
  const [dataSavingEnabled, setDataSavingEnabled] = useState(false);
  const [savedDataEstimate, setSavedDataEstimate] = useState(0);
  
  // Check if user has enabled data saving in their browser
  useEffect(() => {
    if ('connection' in navigator) {
      const conn = navigator.connection;
      if (conn && 'saveData' in conn) {
        setDataSavingEnabled(conn.saveData);
      }
    }
  }, []);
  
  // API to optimize requests based on data saving mode
  const optimizeRequest = (options) => {
    const {
      url,
      quality = 'high',
      priority = 'normal'
    } = options;
    
    // If data saving is on, reduce quality
    const optimizedQuality = dataSavingEnabled 
      ? (quality === 'high' ? 'medium' : 'low')
      : quality;
    
    // Simulate data saving calculation
    if (dataSavingEnabled) {
      setSavedDataEstimate(prev => prev + Math.random() * 0.5); // Mock data saving
    }
    
    return {
      url,
      quality: optimizedQuality,
      priority: dataSavingEnabled && priority === 'normal' ? 'low' : priority
    };
  };
  
  const toggleDataSaving = () => {
    setDataSavingEnabled(prev => !prev);
  };
  
  return {
    dataSavingEnabled,
    savedDataEstimate,
    toggleDataSaving,
    optimizeRequest
  };
};

// Handle offline mode and caching
export const useOfflineMode = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineReadyContent, setOfflineReadyContent] = useState([]);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Add content to offline cache
  const addToOfflineCache = (content) => {
    setOfflineReadyContent(prev => [...prev, content]);
    // In a real app, we would use Cache API or IndexedDB here
  };
  
  return {
    isOnline,
    offlineReadyContent,
    addToOfflineCache
  };
};

export default {
  useGestureDetection,
  useResponsiveDesign,
  useMobileNavigation,
  useOptimizedImages,
  useDataSavingMode,
  useOfflineMode
};`;

// Write the new content to the file
fs.writeFileSync(filePath, newContent);

console.log('MobileOptimization.js has been completely rewritten!');
