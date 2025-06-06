'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  Divider,
  useTheme,
  useMediaQuery,
  SelectChangeEvent,
  CircularProgress,
  Tooltip,
  Fade,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import FeedbackIcon from '@mui/icons-material/RateReview';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import { SKILLS, LEVELS, WELCOMING_VISITORS_B1, Module, Course, TargetLanguage } from '@/utils/courseData';

// Mock target language phrases - in real app, these would come from your course data
const MOCK_TARGET_LANGUAGE = [
  "I'd like to discuss the terms of...",
  "Could you clarify your position on...",
  "Let me propose an alternative...",
  "What are your thoughts on...",
  "I understand your concern about...",
  "Let's explore some options...",
  "From my perspective...",
  "To summarize our discussion...",
];

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  audioUrl?: string;
  isPlaying: boolean;
}

export default function Home() {
  const [skill, setSkill] = useState('');
  const [level, setLevel] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  
  // Add states for optional settings
  const [jobTitle, setJobTitle] = useState('');
  const [taskObjective, setTaskObjective] = useState('');
  const [audience, setAudience] = useState('');
  const [formality, setFormality] = useState('');
  const [setting, setSetting] = useState('');
  const [industry, setIndustry] = useState('');
  const [feedbackStyle, setFeedbackStyle] = useState('');
  const [timeLimit, setTimeLimit] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConversation, setShowConversation] = useState(false);

  // Add device detection
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  // Add Safari detection
  const isSafari = useRef(false);

  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [audioPlaying, setAudioPlaying] = useState<string | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Add iOS detection
  const isIOS = useRef(false);

  // Add new state for conversation type
  const [conversationType, setConversationType] = useState<'skill' | 'open' | null>(null);
  const [customTaskObjective, setCustomTaskObjective] = useState('');
  const [customIndustry, setCustomIndustry] = useState('');

  // Add new state for custom job title
  const [customJobTitle, setCustomJobTitle] = useState('');

  // Predefined options
  const TASK_OBJECTIVES = [
    'Job Interview',
    'Business Meeting',
    'Client Presentation',
    'Small Talk',
    'Networking',
    'Customer Service',
    'Problem Solving',
    'Team Discussion',
    'Other'
  ];

  const INDUSTRIES = [
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Manufacturing',
    'Retail',
    'Hospitality',
    'Professional Services',
    'Other'
  ];

  // Add job titles array
  const JOB_TITLES = [
    'Sales Manager',
    'Marketing Director',
    'Software Engineer',
    'Project Manager',
    'Business Analyst',
    'HR Manager',
    'Financial Advisor',
    'Operations Manager',
    'Product Manager',
    'Account Executive',
    'Other'
  ];

  // Add ref for current audio element
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Detect mobile device on component mount
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor;
      const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      setIsMobileDevice(isMobile);
      console.log('Device type:', isMobile ? 'mobile' : 'desktop');
    };

    checkMobile();
  }, []);

  // Add iOS detection
  useEffect(() => {
    const checkIOS = () => {
      const userAgent = navigator.userAgent || navigator.vendor;
      isIOS.current = /ipad|iphone|ipod/.test(userAgent.toLowerCase()) && !(window as any).MSStream;
      console.log('Device type:', isIOS.current ? 'iOS' : 'other');
    };
    checkIOS();
  }, []);

  // Add Safari detection
  useEffect(() => {
    const checkBrowser = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      isSafari.current = /^((?!chrome|android).)*safari/i.test(userAgent);
      console.log('Browser type:', isSafari.current ? 'Safari' : 'other');
    };
    checkBrowser();
  }, []);

  const getAudioConstraints = () => {
    const baseConstraints = {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    };

    if (isMobileDevice) {
      return {
        ...baseConstraints,
        channelCount: 1,
        sampleRate: 44100
      };
    }

    if (isSafari.current) {
      return {
        ...baseConstraints,
        channelCount: 1,
        sampleRate: 44100,
        sampleSize: 16
      };
    }

    return baseConstraints;
  };

  const startRecording = async () => {
    try {
      console.log(`Starting recording on ${isSafari.current ? 'Safari' : isMobileDevice ? 'mobile' : 'desktop'}...`);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: getAudioConstraints()
      });

      let options: MediaRecorderOptions = {};
      
      // Safari-specific handling
      if (isSafari.current) {
        options = {
          mimeType: 'audio/mp4'
        };
      } else {
        options = {
          mimeType: 'audio/webm;codecs=opus'
        };
      }

      let mediaRecorder;
      try {
        mediaRecorder = new MediaRecorder(stream, options);
      } catch (e) {
        console.log('Preferred codec not supported, falling back to default codec');
        mediaRecorder = new MediaRecorder(stream);
      }

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        console.log(`Audio data available (${isSafari.current ? 'Safari' : isMobileDevice ? 'mobile' : 'desktop'}):`, e.data.size);
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onerror = (e) => {
        console.error('MediaRecorder error:', e);
        const errorMessage = isSafari.current
          ? 'Recording error in Safari. Please ensure microphone permissions are granted.'
          : isMobileDevice
            ? 'Recording error. Please check microphone permissions in your mobile settings.'
            : 'Error during recording. Please check your microphone settings.';
        alert(errorMessage);
      };

      // Collect data more frequently on Safari and mobile
      const interval = isSafari.current || isMobileDevice ? 500 : 1000;
      mediaRecorder.start(interval);
      console.log(`Recording started (${interval}ms intervals)`);
      setIsRecording(true);
    } catch (error) {
      console.error('Microphone access error:', error);
      const errorMessage = isSafari.current
        ? 'Unable to access microphone in Safari. Please check your browser settings and ensure microphone access is allowed.'
        : isMobileDevice
          ? 'Unable to access microphone. Please check permissions in both app and browser settings.'
          : 'Unable to access microphone. Please ensure microphone permissions are granted.';
      alert(errorMessage);
    }
  };

  // Initialize audio context for iOS
  const initializeIOSAudio = async () => {
    try {
      if (!audioContext) {
        console.log('Initializing iOS audio context...');
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContext({ sampleRate: 44100 });
        
        if (ctx.state === 'suspended') {
          await ctx.resume();
          console.log('Audio context resumed');
        }
        
        setAudioContext(ctx);
        console.log('iOS Audio Context initialized:', ctx.state);
        return ctx;
      }
      return audioContext;
    } catch (error) {
      console.error('Error initializing iOS audio context:', error);
      return null;
    }
  };

  // Add Safari-specific audio conversion utility
  const convertSafariAudioToWav = async (audioBlob: Blob): Promise<Blob> => {
    if (!isSafari.current || isIOS.current) {
      // Only convert for desktop Safari
      return audioBlob;
    }

    try {
      console.log('Starting Safari audio conversion to WAV...');
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext({ sampleRate: 16000 });

      // Read the blob as array buffer
      const arrayBuffer = await audioBlob.arrayBuffer();
      
      // Decode the audio data
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      // Create WAV file
      const numberOfChannels = 1;
      const length = audioBuffer.length;
      const sampleRate = audioBuffer.sampleRate;
      const wavBuffer = new ArrayBuffer(44 + length * 2);
      const view = new DataView(wavBuffer);
      
      // Write WAV header
      const writeString = (view: DataView, offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      };

      writeString(view, 0, 'RIFF');
      view.setUint32(4, 36 + length * 2, true);
      writeString(view, 8, 'WAVE');
      writeString(view, 12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, numberOfChannels, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true);
      view.setUint16(32, numberOfChannels * 2, true);
      view.setUint16(34, 16, true);
      writeString(view, 36, 'data');
      view.setUint32(40, length * 2, true);

      // Write audio data
      const channel = audioBuffer.getChannelData(0);
      let offset = 44;
      for (let i = 0; i < length; i++) {
        const sample = Math.max(-1, Math.min(1, channel[i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }

      console.log('Safari audio conversion completed');
      return new Blob([wavBuffer], { type: 'audio/wav' });
    } catch (error) {
      console.error('Safari audio conversion error:', error);
      // On conversion failure, return original blob
      return audioBlob;
    }
  };

  const handleAudioSubmission = async (audioData: Blob[]) => {
    try {
      console.log('Starting audio submission...');
      setIsProcessing(true);

      // Create initial blob with browser-appropriate type
      const initialBlob = new Blob(audioData, { 
        type: isSafari.current && !isIOS.current ? 'audio/mp4' : 'audio/webm;codecs=opus' 
      });

      // Convert audio for Safari if needed
      const userAudioBlob = isSafari.current && !isIOS.current
        ? await convertSafariAudioToWav(initialBlob)
        : initialBlob;

      if (userAudioBlob.size === 0) {
        throw new Error('No audio detected. Please try speaking again.');
      }

      // Create FormData for speech-to-text
      const formData = new FormData();
      formData.append('audio', userAudioBlob);
      formData.append('browser', isSafari.current ? 'safari' : 'other');

      // Speech to text
      const transcriptionResponse = await fetch('/api/speech-to-text', {
        method: 'POST',
        body: formData
      });

      if (!transcriptionResponse.ok) {
        throw new Error('Failed to convert speech to text');
      }

      const { text } = await transcriptionResponse.json();
      
      if (!text?.trim()) {
        throw new Error('No speech detected. Please try speaking again.');
      }

      // Add user message
      setMessages(prev => [...prev, {
        role: 'user',
        content: text,
        timestamp: new Date(),
        isPlaying: false
      } as Message]);

      // Chat API call
      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context: {
            conversationType,
            level,
            ...(conversationType === 'skill' ? {
              skill,
              moduleId: selectedModule,
              courseId: selectedCourse,
              isFullModule: selectedCourse === `${selectedModule}_practice`,
              moduleTitle: getAvailableModules().find(m => m.id === selectedModule)?.title || ''
            } : {
              jobTitle,
              customJobTitle: jobTitle === 'Other' ? customJobTitle : undefined,
              taskObjective,
              customTaskObjective: taskObjective === 'Other' ? customTaskObjective : undefined,
              audience,
              formality,
              industry,
              customIndustry: industry === 'Other' ? customIndustry : undefined,
              feedbackStyle,
              timeLimit
            })
          }
        })
      });

      if (!chatResponse.ok) {
        throw new Error('Failed to get AI response');
      }

      const { response: aiResponse } = await chatResponse.json();

      // Add AI message first
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        isPlaying: false
      } as Message]);

      // Text to speech
      const ttsResponse = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: aiResponse,
          level,
          browser: isSafari.current ? 'safari' : 'other'
        })
      });

      if (!ttsResponse.ok) {
        throw new Error('Failed to convert text to speech');
      }

      const audioBlob = await ttsResponse.blob();
      
      if (audioBlob.size === 0) {
        throw new Error('Received empty audio response');
      }

      const audioUrl = URL.createObjectURL(
        isSafari.current && !isIOS.current
          ? new Blob([audioBlob], { type: 'audio/mpeg' })
          : audioBlob
      );

      // Update the last message with audio URL
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage && lastMessage.role === 'assistant') {
          lastMessage.audioUrl = audioUrl;
        }
        return newMessages;
      });

      // Try to play audio automatically on desktop
      if (!isIOS.current && !isMobileDevice) {
        try {
          await handleAudioPlayback(audioUrl, messages.length);
        } catch (error) {
          console.warn('Desktop audio playback failed:', error);
        }
      }

    } catch (error: any) {
      console.error('Processing error:', error);
      let userMessage = 'An error occurred. Please try again.';
      
      if (error.message?.includes('speech to text')) {
        userMessage = 'Failed to process speech. Please try speaking again.';
      } else if (error.message?.includes('AI response')) {
        userMessage = 'Failed to get AI response. Please try again.';
      } else if (error.message?.includes('text to speech')) {
        userMessage = 'Failed to generate audio. The response is still visible and you can try recording again.';
      } else if (error.message) {
        userMessage = error.message;
      }
      
      alert(userMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const stopRecording = () => {
    console.log('Stopping recording...');
    if (!mediaRecorderRef.current || !isRecording) {
      console.log('No active recording to stop');
      return;
    }

    mediaRecorderRef.current.onstop = () => {
      console.log('Recording stopped, processing chunks...');
      console.log('Number of chunks:', chunksRef.current.length);
      
      // Pass the chunks directly to handleAudioSubmission
      handleAudioSubmission(chunksRef.current);
      
      // Clean up
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => {
          track.stop();
          console.log('Audio track stopped');
        });
      }
      setIsRecording(false);
    };

    mediaRecorderRef.current.stop();
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const playAudioResponse = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.play();
  };

  // Get available modules based on selected skill and level
  const getAvailableModules = () => {
    if (skill === 'Welcoming Visitors' && level === 'B1') {
      return WELCOMING_VISITORS_B1.modules;
    }
    return [];
  };

  // Get available courses based on selected module
  const getAvailableCourses = () => {
    const modules = getAvailableModules();
    const currentModule = modules.find(m => m.id === selectedModule);
    return currentModule?.courses || [];
  };

  // Simplify getTargetLanguage to only handle single course
  const getTargetLanguage = () => {
    const module = getAvailableModules().find(m => m.id === selectedModule);
    const course = module?.courses.find(c => c.id === selectedCourse);
    return course?.targetLanguage ? [{ courseTitle: course.title, targetLanguage: course.targetLanguage }] : [];
  };

  const targetLanguageData = getTargetLanguage();

  // Update handleAudioPlayback function
  const handleAudioPlayback = async (audioUrl: string, messageIndex: number) => {
    try {
      console.log('Starting audio playback...');
      
      // If there's already an audio playing, stop it
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
        currentAudioRef.current = null;
        setAudioPlaying(null);
        setMessages(prev => prev.map(msg => ({
          ...msg,
          isPlaying: false
        })));
      }

      // If we're clicking on the currently playing audio, just stop it
      if (audioPlaying === audioUrl) {
        setAudioPlaying(null);
        return;
      }

      // For Safari, we need to handle audio differently
      if (isSafari.current && !isIOS.current) {
        console.log('Safari desktop playback...');
        try {
          const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
          const audioCtx = new AudioContext();
          
          const response = await fetch(audioUrl);
          const arrayBuffer = await response.arrayBuffer();
          
          const audioSource = audioCtx.createBufferSource();
          const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
          audioSource.buffer = audioBuffer;
          
          audioSource.connect(audioCtx.destination);
          
          setMessages(prev => prev.map((msg, idx) => ({
            ...msg,
            isPlaying: idx === messageIndex
          })));
          setAudioPlaying(audioUrl);
          
          audioSource.start(0);
          audioSource.onended = () => {
            console.log('Safari audio playback completed');
            setAudioPlaying(null);
            setMessages(prev => prev.map(msg => ({
              ...msg,
              isPlaying: false
            })));
          };
        } catch (error) {
          console.error('Safari audio playback error:', error);
          throw error;
        }
      } else {
        // Non-Safari browsers use standard Audio API
        console.log('Standard audio playback...');
        const audio = new Audio(audioUrl);
        currentAudioRef.current = audio;
        
        // Mobile specific settings
        if (isIOS.current || isMobileDevice) {
          audio.preload = 'auto';
          (audio as any).playsinline = true;
          (audio as any).webkitPlaysinline = true;
          audio.setAttribute('webkit-playsinline', 'true');
          audio.volume = 1.0;
        }

        // Update UI before attempting playback
        setMessages(prev => prev.map((msg, idx) => ({
          ...msg,
          isPlaying: idx === messageIndex
        })));
        
        setAudioPlaying(audioUrl);

        audio.addEventListener('ended', () => {
          console.log('Audio playback completed');
          currentAudioRef.current = null;
          setAudioPlaying(null);
          setMessages(prev => prev.map(msg => ({
            ...msg,
            isPlaying: false
          })));
        });

        try {
          await audio.play();
          console.log('Audio playback successful');
        } catch (error) {
          console.error('Audio playback failed:', error);
          throw error;
        }
      }
    } catch (error) {
      console.error('Audio playback error:', error);
      currentAudioRef.current = null;
      setAudioPlaying(null);
      setMessages(prev => prev.map(msg => ({
        ...msg,
        isPlaying: false
      })));
      
      if (isSafari.current) {
        alert('Audio playback failed. Please ensure your Safari settings allow audio playback.');
      } else if (isIOS.current || isMobileDevice) {
        alert('Audio playback failed. Try tapping the play button or check if your device is in silent mode.');
      }
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 2, px: { xs: 1, sm: 2 } }}>
        <Fade in={!showConversation}>
          <Box sx={{ display: showConversation ? 'none' : 'block' }}>
            <Typography variant="h5" align="center" gutterBottom>
              Please select the type of conversation
            </Typography>

            {!conversationType && (
              <Grid container spacing={2} justifyContent="center">
                <Grid item xs={12} md={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    size="large"
                    onClick={() => setConversationType('skill')}
                  >
                    Skill Express Conversation
                  </Button>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Button
                    variant="outlined"
                    fullWidth
                    size="large"
                    onClick={() => setConversationType('open')}
                  >
                    Open Conversation
                  </Button>
                </Grid>
              </Grid>
            )}

            {conversationType && (
              <Box sx={{ mt: 2 }}>
                <Button
                  startIcon={<ArrowBackIcon />}
                  onClick={() => {
                    setConversationType(null);
                    // Reset all form fields
                    setSkill('');
                    setLevel('');
                    setSelectedModule('');
                    setSelectedCourse('');
                    setJobTitle('');
                    setCustomJobTitle('');
                    setTaskObjective('');
                    setCustomTaskObjective('');
                    setAudience('');
                    setFormality('');
                    setSetting('');
                    setIndustry('');
                    setCustomIndustry('');
                    setFeedbackStyle('');
                    setTimeLimit('');
                  }}
                >
                  Back to Conversation Type
                </Button>
              </Box>
            )}

            <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, mt: 2 }}>
              {conversationType === 'skill' && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Skill Express Practice Settings
                  </Typography>
                  {/* Existing Skill Express fields */}
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Skill</InputLabel>
                        <Select
                          value={skill}
                          label="Skill"
                          onChange={(e) => setSkill(e.target.value)}
                        >
                          {SKILLS.map((s) => (
                            <MenuItem key={s} value={s}>
                              {s}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>Speaking Level</InputLabel>
                        <Select
                          value={level}
                          label="Speaking Level"
                          onChange={(e: SelectChangeEvent<string>) => setLevel(e.target.value)}
                        >
                          {LEVELS.map((level) => (
                            <MenuItem key={level} value={level}>
                              {level}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>Module</InputLabel>
                        <Select
                          value={selectedModule}
                          label="Module"
                          onChange={(e: SelectChangeEvent<string>) => {
                            setSelectedModule(e.target.value);
                            setSelectedCourse(''); // Reset course when module changes
                          }}
                          disabled={!skill || !level}
                        >
                          {getAvailableModules().map((module, index) => (
                            <MenuItem 
                              key={module.id} 
                              value={module.id}
                              sx={{
                                whiteSpace: 'normal',
                                py: 1
                              }}
                            >
                              <Typography>Module {index + 1}: {module.title}</Typography>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>Course</InputLabel>
                        <Select
                          value={selectedCourse}
                          label="Course"
                          onChange={(e: SelectChangeEvent<string>) => {
                            setSelectedCourse(e.target.value);
                          }}
                          disabled={!selectedModule}
                        >
                          {/* Show individual courses */}
                          {getAvailableCourses().map((course, index) => (
                            <MenuItem 
                              key={course.id} 
                              value={course.id}
                              sx={{
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                whiteSpace: 'normal',
                                py: 1,
                                '& .description': {
                                  fontSize: '0.8rem',
                                  color: 'text.secondary',
                                  mt: 0.5
                                }
                              }}
                            >
                              <Typography>Course {index + 1}: {course.title}</Typography>
                              <Typography className="description">
                                {course.description}
                              </Typography>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </>
              )}

              {conversationType === 'open' && (
                <>
                  <Typography variant="h6" gutterBottom>
                    Open Conversation Settings
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Speaking Level</InputLabel>
                        <Select
                          value={level}
                          label="Speaking Level"
                          onChange={(e) => setLevel(e.target.value)}
                        >
                          {LEVELS.map((l) => (
                            <MenuItem key={l} value={l}>
                              {l}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Job Title</InputLabel>
                        <Select
                          value={jobTitle}
                          label="Job Title"
                          onChange={(e) => {
                            setJobTitle(e.target.value);
                            if (e.target.value !== 'Other') {
                              setCustomJobTitle('');
                            }
                          }}
                        >
                          {JOB_TITLES.map((title) => (
                            <MenuItem key={title} value={title}>
                              {title}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      {jobTitle === 'Other' && (
                        <TextField
                          fullWidth
                          label="Custom Job Title"
                          value={customJobTitle}
                          onChange={(e) => setCustomJobTitle(e.target.value)}
                          sx={{ mt: 1 }}
                        />
                      )}
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Task/Objective</InputLabel>
                        <Select
                          value={taskObjective}
                          label="Task/Objective"
                          onChange={(e) => {
                            setTaskObjective(e.target.value);
                            if (e.target.value !== 'Other') {
                              setCustomTaskObjective('');
                            }
                          }}
                        >
                          {TASK_OBJECTIVES.map((task) => (
                            <MenuItem key={task} value={task}>
                              {task}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      {taskObjective === 'Other' && (
                        <TextField
                          fullWidth
                          label="Custom Task/Objective"
                          value={customTaskObjective}
                          onChange={(e) => setCustomTaskObjective(e.target.value)}
                          sx={{ mt: 1 }}
                        />
                      )}
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Industry/Sector</InputLabel>
                        <Select
                          value={industry}
                          label="Industry/Sector"
                          onChange={(e) => {
                            setIndustry(e.target.value);
                            if (e.target.value !== 'Other') {
                              setCustomIndustry('');
                            }
                          }}
                        >
                          {INDUSTRIES.map((ind) => (
                            <MenuItem key={ind} value={ind}>
                              {ind}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      {industry === 'Other' && (
                        <TextField
                          fullWidth
                          label="Custom Industry/Sector"
                          value={customIndustry}
                          onChange={(e) => setCustomIndustry(e.target.value)}
                          sx={{ mt: 1 }}
                        />
                      )}
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Audience</InputLabel>
                        <Select
                          value={audience}
                          label="Audience"
                          onChange={(e) => setAudience(e.target.value)}
                        >
                          <MenuItem value="">None</MenuItem>
                          <MenuItem value="clients">Clients</MenuItem>
                          <MenuItem value="colleagues">Colleagues</MenuItem>
                          <MenuItem value="superiors">Superiors</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Formality</InputLabel>
                        <Select
                          value={formality}
                          label="Formality"
                          onChange={(e) => setFormality(e.target.value)}
                        >
                          <MenuItem value="">None</MenuItem>
                          <MenuItem value="formal">Formal</MenuItem>
                          <MenuItem value="semiformal">Semi-formal</MenuItem>
                          <MenuItem value="informal">Informal</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>AI Feedback Style</InputLabel>
                        <Select
                          value={feedbackStyle}
                          label="AI Feedback Style"
                          onChange={(e) => setFeedbackStyle(e.target.value)}
                        >
                          <MenuItem value="">None</MenuItem>
                          <MenuItem value="frequent">Correct me often</MenuItem>
                          <MenuItem value="minimal">Let me speak</MenuItem>
                          <MenuItem value="rephrase">Rephrase my answers</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Time Limit</InputLabel>
                        <Select
                          value={timeLimit}
                          label="Time Limit"
                          onChange={(e) => setTimeLimit(e.target.value)}
                        >
                          <MenuItem value="">None</MenuItem>
                          <MenuItem value="1">1 minute</MenuItem>
                          <MenuItem value="2">2 minutes</MenuItem>
                          <MenuItem value="3">3 minutes</MenuItem>
                          <MenuItem value="4">4 minutes</MenuItem>
                          <MenuItem value="5">5 minutes</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </>
              )}

              {/* Start Conversation Button */}
              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                sx={{ mt: 3 }}
                onClick={() => setShowConversation(true)}
                disabled={
                  conversationType === 'skill'
                    ? !skill || !level || !selectedCourse
                    : !level || !(taskObjective && (taskObjective !== 'Other' || customTaskObjective)) || !(industry && (industry !== 'Other' || customIndustry))
                }
              >
                Start Conversation
              </Button>
            </Paper>
          </Box>
        </Fade>

        <Fade in={showConversation}>
          <Box sx={{ display: showConversation ? 'block' : 'none' }}>
            <Grid container spacing={2}>
              {/* Target Language - Only show for Skill Express */}
              {conversationType === 'skill' && (
                <Grid item xs={12} md={6}>
                  <Paper 
                    elevation={3} 
                    sx={{ 
                      p: { xs: 2, sm: 4 }, 
                      height: '100%',
                      minHeight: { xs: '300px', sm: '400px' }
                    }}
                  >
                    <Typography variant="h5" gutterBottom>
                      Target Language
                    </Typography>

                    {/* Target Language List */}
                    <List sx={{ 
                      overflowY: 'auto', 
                      maxHeight: { xs: '250px', sm: '350px' }
                    }}>
                      {!selectedModule ? (
                        <ListItem>
                          <ListItemText primary="Please select a module" sx={{ color: 'text.secondary' }} />
                        </ListItem>
                      ) : !selectedCourse ? (
                        <ListItem>
                          <ListItemText primary="Please select a course" sx={{ color: 'text.secondary' }} />
                        </ListItem>
                      ) : targetLanguageData.length === 0 ? (
                        <ListItem>
                          <ListItemText primary="No target language available" sx={{ color: 'text.secondary' }} />
                        </ListItem>
                      ) : (
                        targetLanguageData.map((courseData) => (
                          courseData.targetLanguage.map((category, catIndex) => (
                            <Box key={catIndex} sx={{ mb: 2 }}>
                              <Typography
                                variant="subtitle1"
                                sx={{
                                  fontWeight: 'bold',
                                  color: 'text.primary',
                                  mb: 1
                                }}
                              >
                                {category.category}
                              </Typography>
                              <List sx={{ pl: 2 }}>
                                {category.expressions.map((expression, exprIndex) => (
                                  <ListItem key={exprIndex} dense>
                                    <ListItemText
                                      primary={expression}
                                      sx={{
                                        '& .MuiListItemText-primary': {
                                          fontSize: '0.9rem',
                                          color: 'text.secondary'
                                        }
                                      }}
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            </Box>
                          ))
                        ))
                      )}
                    </List>
                  </Paper>
                </Grid>
              )}

              {/* Conversation Area */}
              <Grid item xs={12} md={conversationType === 'skill' ? 6 : 12}>
                <Paper 
                  elevation={3} 
                  sx={{ 
                    p: { xs: 2, sm: 4 }, 
                    height: '100%',
                    minHeight: { xs: '300px', sm: '400px' },
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative' // Added for absolute positioning of mobile elements
                  }}
                >
                  {/* Header */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mb: 2,
                    ...(isMobileDevice && {
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 1
                    })
                  }}>
                    <Typography variant="h5">
                      Conversation
                    </Typography>
                  </Box>
              
                  {/* Messages area */}
                  <Box sx={{ 
                    flexGrow: 1, 
                    overflowY: 'auto', 
                    mb: 2,
                    minHeight: { 
                      xs: isMobileDevice ? '250px' : '200px', 
                      sm: '300px' 
                    },
                    maxHeight: { 
                      xs: isMobileDevice ? '350px' : '250px', 
                      sm: '350px' 
                    },
                    bgcolor: 'background.default',
                    p: 2,
                    borderRadius: 1,
                    '&::-webkit-scrollbar': {
                      width: '8px',
                    },
                    '&::-webkit-scrollbar-track': {
                      backgroundColor: 'rgba(0,0,0,0.1)',
                      borderRadius: '4px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: 'rgba(0,0,0,0.2)',
                      borderRadius: '4px',
                      '&:hover': {
                        backgroundColor: 'rgba(0,0,0,0.3)',
                      },
                    },
                  }}>
                    {messages.map((message, index) => (
                      <Box
                        key={index}
                        sx={{
                          mb: 2,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: message.role === 'user' ? 'flex-end' : 'flex-start'
                        }}
                      >
                        <Paper
                          sx={{
                            p: { xs: 1.5, sm: 2 },
                            maxWidth: '85%',
                            bgcolor: message.role === 'user' ? 'primary.light' : 'background.paper',
                            color: message.role === 'user' ? 'primary.contrastText' : 'text.primary'
                          }}
                        >
                          <Typography variant="body1" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                            {message.content}
                          </Typography>
                          {message.role === 'assistant' && message.audioUrl && (
                            <IconButton
                              size={isMobileDevice ? "large" : "small"}
                              onClick={() => handleAudioPlayback(message.audioUrl!, index)}
                              sx={{
                                marginTop: 1,
                                ...(isMobileDevice && {
                                  '& svg': {
                                    fontSize: '2rem'
                                  }
                                })
                              }}
                            >
                              {message.isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                            </IconButton>
                          )}
                        </Paper>
                        <Typography variant="caption" sx={{ mt: 0.5 }}>
                          {message.timestamp.toLocaleTimeString()}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  {/* Controls Container */}
                  <Box sx={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                    mt: 'auto',
                    ...(isMobileDevice && {
                      position: 'sticky',
                      bottom: 0,
                      bgcolor: 'background.paper',
                      pt: 2,
                      pb: 2
                    })
                  }}>
                    {/* Recording Controls */}
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 1, 
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%'
                    }}>
                      <IconButton 
                        color={isRecording ? 'error' : 'primary'}
                        onClick={toggleRecording}
                        disabled={isProcessing}
                        sx={{ 
                          p: { xs: 2, sm: 2 },
                          ...(isMobileDevice && {
                            '& svg': {
                              fontSize: '2.5rem'
                            }
                          })
                        }}
                      >
                        {isRecording ? <StopIcon /> : <MicIcon />}
                      </IconButton>
                      {isProcessing && (
                        <CircularProgress 
                          size={isMobileDevice ? 32 : 24} 
                          sx={{ 
                            ml: 1,
                            color: 'primary.main'
                          }} 
                        />
                      )}
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontSize: { xs: '1rem', sm: '0.9rem' },
                          color: isRecording ? 'error.main' : isProcessing ? 'primary.main' : 'text.secondary'
                        }}
                      >
                        {isProcessing
                          ? 'Thinking...'
                          : isRecording 
                            ? 'Click to stop recording...' 
                            : 'Click to start speaking'}
                      </Typography>
                      <Tooltip title="Get feedback on your conversation">
                        <IconButton
                          color="primary"
                          onClick={async () => {
                            try {
                              setIsProcessing(true);
                              // Get only user messages from the conversation
                              const userMessages = messages
                                .filter(m => m.role === 'user')
                                .map(m => m.content)
                                .join('\n');
                              
                              // Request feedback
                              const feedbackResponse = await fetch('/api/chat', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  message: `Please analyze my responses and provide feedback on my language use${
                                    conversationType === 'skill' 
                                      ? ', especially regarding the target expressions'
                                      : ', considering the professional context'
                                  }. Here are my responses:\n${userMessages}`,
                                  context: {
                                    conversationType,
                                    level,
                                    ...(conversationType === 'skill' ? {
                                      skill,
                                      moduleId: selectedModule,
                                      courseId: selectedCourse,
                                      isFullModule: selectedCourse === `${selectedModule}_practice`,
                                      moduleTitle: getAvailableModules().find(m => m.id === selectedModule)?.title || ''
                                    } : {
                                      jobTitle,
                                      customJobTitle: jobTitle === 'Other' ? customJobTitle : undefined,
                                      taskObjective,
                                      customTaskObjective: taskObjective === 'Other' ? customTaskObjective : undefined,
                                      audience,
                                      formality,
                                      industry,
                                      customIndustry: industry === 'Other' ? customIndustry : undefined,
                                      feedbackStyle,
                                      timeLimit
                                    })
                                  }
                                }),
                              });

                              if (!feedbackResponse.ok) throw new Error('Feedback request failed');
                              const { response } = await feedbackResponse.json();

                              // Add feedback as a new message
                              setMessages(prev => [...prev, {
                                role: 'assistant',
                                content: response,
                                timestamp: new Date(),
                                isPlaying: false
                              } as Message]);

                              // Convert feedback to speech
                              const ttsResponse = await fetch('/api/text-to-speech', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  text: response,
                                  level,
                                  browser: isSafari.current ? 'safari' : 'other'
                                }),
                              });

                              if (!ttsResponse.ok) throw new Error('Text to speech failed');
                              const audioBlob = await ttsResponse.blob();
                              const audioUrl = URL.createObjectURL(
                                isSafari.current && !isIOS.current
                                  ? new Blob([audioBlob], { type: 'audio/mpeg' })
                                  : audioBlob
                              );

                              // Update the message with audio
                              setMessages(prev => {
                                const newMessages = [...prev];
                                const lastMessage = newMessages[newMessages.length - 1];
                                if (lastMessage && lastMessage.role === 'assistant') {
                                  lastMessage.audioUrl = audioUrl;
                                }
                                return newMessages;
                              });

                              // Try to play audio automatically on desktop
                              if (!isIOS.current && !isMobileDevice) {
                                try {
                                  await handleAudioPlayback(audioUrl, messages.length);
                                } catch (error) {
                                  console.warn('Desktop audio playback failed:', error);
                                }
                              }

                            } catch (error) {
                              console.error('Error getting feedback:', error);
                              alert('Error getting feedback. Please try again.');
                            } finally {
                              setIsProcessing(false);
                            }
                          }}
                          disabled={!messages.length || isProcessing}
                          sx={{ 
                            ml: 2,
                            p: { xs: 2, sm: 2 },
                            ...(isMobileDevice && {
                              '& svg': {
                                fontSize: '2.5rem'
                              }
                            })
                          }}
                        >
                          <FeedbackIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    {/* Stop Conversation Button - Mobile Specific Styling */}
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => {
                        setShowConversation(false);
                        setMessages([]);
                      }}
                      sx={{ 
                        mt: 1,
                        ...(isMobileDevice && {
                          width: '100%',
                          py: 1.5,
                          fontSize: '1rem',
                          borderRadius: '8px'
                        })
                      }}
                    >
                      Stop Conversation
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Fade>
      </Box>
    </Container>
  );
}
