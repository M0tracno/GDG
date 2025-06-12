import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { navigateToDashboard } from '../utils/navigationHelpers';
import { useFormInteractionFix } from '../utils/formInteractionFix';
import { Alert, Box, Button, Checkbox, CircularProgress, Fade, FormControlLabel, IconButton, InputAdornment, Link, Paper, Slide, TextField, Typography } from '@mui/material';
import {
  Lock as LockIcon,
  Email as EmailIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  ArrowBack as ArrowBackIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import {
  appleColors,
  appleGradients,
  appleShadows,
  appleTransitions
} from '../styles/appleTheme';

function ParentLogin() {
  useFormInteractionFix();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [remember, setRemember] = useState(false);

  const { login, currentUser, userRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser && userRole === 'parent') {
      navigateToDashboard(navigate, 'parent', { replace: true });
    }
  }, [navigate, currentUser, userRole]);

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    // Validation
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(email, password, 'parent');
      navigateToDashboard(navigate, 'parent', { replace: true });
    } catch (error) {
      console.error('Parent login error:', error);
      setError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
        background: appleGradients.parent?.main || 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(255, 255, 255, 0.06) 0%, transparent 50%)
          `,
          animation: 'backgroundFloat 20s ease-in-out infinite',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          animation: 'patternFloat 30s linear infinite',
          opacity: 0.3,
        },
        '@keyframes backgroundFloat': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(30px, -30px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
        },
        '@keyframes patternFloat': {
          '0%': { transform: 'translateX(0) translateY(0)' },
          '100%': { transform: 'translateX(-60px) translateY(-60px)' },
        },
      }}
    >
      <Fade in={true} timeout={800}>
        <Paper
          elevation={0}
          sx={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            maxWidth: 420,
            width: '100%',
            padding: '40px 32px',
            borderRadius: '24px',
            position: 'relative',
            zIndex: 1,
            animation: 'slideUpBounce 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            '@keyframes slideUpBounce': {
              '0%': {
                opacity: 0,
                transform: 'translateY(50px) scale(0.95)'
              },
              '50%': {
                opacity: 0.8,
                transform: 'translateY(-5px) scale(1.02)'
              },
              '100%': {
                opacity: 1,
                transform: 'translateY(0) scale(1)'
              }
            }
          }}
        >
          {/* Enhanced Floating Icon */}
          <Slide direction="down" in={true} timeout={1000}>
            <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 32px rgba(139, 92, 246, 0.4)',
                  animation: 'floatPulse 3s ease-in-out infinite',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -5,
                    left: -5,
                    right: -5,
                    bottom: -5,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                    opacity: 0.3,
                    animation: 'pulseRing 2s ease-out infinite',
                  },
                  '@keyframes floatPulse': {
                    '0%, 100%': { transform: 'translateY(0) scale(1)' },
                    '50%': { transform: 'translateY(-8px) scale(1.05)' }
                  },
                  '@keyframes pulseRing': {
                    '0%': { transform: 'scale(0.8)', opacity: 0.8 },
                    '100%': { transform: 'scale(1.4)', opacity: 0 }
                  }
                }}
              >
                <PeopleIcon
                  sx={{
                    fontSize: 40,
                    color: 'white',
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                    animation: 'iconFloat 4s ease-in-out infinite',
                    '@keyframes iconFloat': {
                      '0%, 100%': { transform: 'rotate(0deg)' },
                      '50%': { transform: 'rotate(5deg)' }
                    }
                  }}
                />
              </Box>
            </Box>
          </Slide>

          {/* Enhanced Title with Gradient Animation */}
          <Fade in={true} timeout={1200}>
            <Typography
              variant="h4"
              sx={{
                textAlign: 'center',
                marginBottom: '8px',
                background: 'linear-gradient(45deg, #8b5cf6 30%, #7c3aed 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 700,
                fontSize: '2.2rem',
                position: 'relative',
                animation: 'titleShimmer 3s ease-in-out infinite',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -8,
                  left: '50%',
                  width: 60,
                  height: 3,
                  background: 'linear-gradient(45deg, #8b5cf6, #7c3aed)',
                  borderRadius: 2,
                  transform: 'translateX(-50%)',
                  animation: 'underlineGrow 0.8s ease-out 0.5s both',
                },
                '@keyframes titleShimmer': {
                  '0%, 100%': { backgroundPosition: '0% 50%' },
                  '50%': { backgroundPosition: '100% 50%' },
                },
                '@keyframes underlineGrow': {
                  '0%': { width: 0, opacity: 0 },
                  '100%': { width: 60, opacity: 1 },
                },
              }}
            >
              Parent Portal
            </Typography>
          </Fade>

          <Fade in={true} timeout={1400}>
            <Typography
              variant="body2"
              sx={{
                textAlign: 'center',
                color: 'rgba(255, 255, 255, 0.8)',
                marginBottom: '32px',
                fontSize: '1rem',
                animation: 'fadeInUp 0.6s ease-out 0.8s both',
                '@keyframes fadeInUp': {
                  '0%': { opacity: 0, transform: 'translateY(20px)' },
                  '100%': { opacity: 1, transform: 'translateY(0)' },
                },
              }}
            >
              Connect with your child's education
            </Typography>
          </Fade>

          {/* Enhanced Error Alert */}
          {error && (
            <Slide direction="down" in={!!error} timeout={300}>
              <Alert
                severity="error"
                sx={{
                  marginBottom: '24px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(139, 92, 246, 0.1)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  backdropFilter: 'blur(10px)',
                  animation: 'alertPulse 0.5s ease-out',
                  '& .MuiAlert-icon': {
                    color: '#8b5cf6'
                  },
                  '@keyframes alertPulse': {
                    '0%': { transform: 'scale(0.95)' },
                    '50%': { transform: 'scale(1.02)' },
                    '100%': { transform: 'scale(1)' },
                  }
                }}
              >
                {error}
              </Alert>
            </Slide>
          )}

          {/* Enhanced Login Form */}
          <Fade in={true} timeout={1600}>
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Parent Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  marginBottom: '20px',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 24px rgba(139, 92, 246, 0.15)',
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3)',
                      transform: 'translateY(-2px)',
                      border: '1px solid rgba(139, 92, 246, 0.5)',
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                    '&.Mui-focused': {
                      color: '#8b5cf6',
                    }
                  },
                  '& .MuiOutlinedInput-input': {
                    color: 'white',
                  }
                }}
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
                        sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  marginBottom: '24px',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 24px rgba(139, 92, 246, 0.15)',
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3)',
                      transform: 'translateY(-2px)',
                      border: '1px solid rgba(139, 92, 246, 0.5)',
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.7)',
                    '&.Mui-focused': {
                      color: '#8b5cf6',
                    }
                  },
                  '& .MuiOutlinedInput-input': {
                    color: 'white',
                  }
                }}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    disabled={loading}
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      '&.Mui-checked': {
                        color: '#8b5cf6',
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                      }
                    }}
                  />
                }
                label="Remember me"
                sx={{
                  marginBottom: '24px',
                  color: 'rgba(255, 255, 255, 0.8)',
                  '& .MuiFormControlLabel-label': {
                    fontSize: '0.9rem',
                  }
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  height: 56,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  boxShadow: '0 8px 24px rgba(139, 92, 246, 0.4)',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  border: 'none',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                    transition: 'left 0.5s',
                  },
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 12px 32px rgba(139, 92, 246, 0.6)',
                    '&::before': {
                      left: '100%',
                    }
                  },
                  '&:active': {
                    transform: 'translateY(-1px)',
                  },
                  '&:disabled': {
                    background: 'rgba(139, 92, 246, 0.3)',
                    color: 'rgba(255, 255, 255, 0.7)',
                    transform: 'none',
                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.2)',
                  }
                }}
              >
                {loading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} sx={{ color: 'white' }} />
                    Signing In...
                  </Box>
                ) : (
                  'Sign In as Parent'
                )}
              </Button>
            </Box>
          </Fade>

          {/* Enhanced Divider and Back Link */}
          <Fade in={true} timeout={2000}>
            <Box
              sx={{
                textAlign: 'center',
                margin: '32px 0 16px',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '50%',
                  left: 0,
                  right: 0,
                  height: '1px',
                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
                },
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  backgroundColor: 'rgba(139, 92, 246, 0.1)',
                  color: 'rgba(255, 255, 255, 0.8)',
                  padding: '6px 16px',
                  borderRadius: '12px',
                  display: 'inline-block',
                  fontSize: '0.8rem',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                OR
              </Typography>
            </Box>
          </Fade>

          <Fade in={true} timeout={2200}>
            <Box sx={{ textAlign: 'center' }}>
              <Link
                href="/"
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(139, 92, 246, 0.2)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                  }
                }}
              >
                <ArrowBackIcon sx={{ fontSize: 18 }} />
                Back to Role Selection
              </Link>
            </Box>
          </Fade>
        </Paper>
      </Fade>
    </Box>
  );
}

export default ParentLogin;

