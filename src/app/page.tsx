'use client';

import { useState, useRef } from 'react';
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

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Error accessing microphone. Please ensure you have granted microphone permissions.');
    }
  };

  const handleAudioSubmission = async (audioData: Blob[]) => {
    try {
      setIsProcessing(true); // Start processing
      const userAudioBlob = new Blob(audioData, { type: 'audio/webm' });
      
      // First, convert speech to text
      const formData = new FormData();
      formData.append('audio', userAudioBlob);
      
      const transcriptionResponse = await fetch('/api/speech-to-text', {
        method: 'POST',
        body: formData,
      });
      
      if (!transcriptionResponse.ok) throw new Error('Speech to text failed');
      const { text } = await transcriptionResponse.json();

      // Add user message
      setMessages(prev => [...prev, {
        role: 'user',
        content: text,
        timestamp: new Date()
      }]);

      // Get AI response
      const chatResponse = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context: { 
            skill, 
            level, 
            moduleId: selectedModule,
            courseId: selectedCourse,
            isFullModule: selectedCourse === `${selectedModule}_practice`,
            moduleTitle: getAvailableModules().find(m => m.id === selectedModule)?.title || ''
          }
        }),
      });

      if (!chatResponse.ok) throw new Error('Chat response failed');
      const { response } = await chatResponse.json();

      // Convert AI response to speech
      const ttsResponse = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: response,
          level
        }),
      });

      if (!ttsResponse.ok) throw new Error('Text to speech failed');
      const aiAudioBlob = await ttsResponse.blob();
      const audioUrl = URL.createObjectURL(aiAudioBlob);

      // Auto-play the audio response
      const audio = new Audio(audioUrl);
      audio.play();

      // Add AI response with audio
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        audioUrl
      }]);

    } catch (error) {
      console.error('Error processing audio:', error);
      alert('Error processing audio. Please try again.');
    } finally {
      setIsProcessing(false); // End processing
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current || !isRecording) return;

    mediaRecorderRef.current.onstop = () => {
      // Pass the chunks directly to handleAudioSubmission
      handleAudioSubmission(chunksRef.current);
      
      // Clean up
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
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

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 2, px: { xs: 1, sm: 2 } }}>
        <Fade in={!showConversation}>
          <Box sx={{ display: showConversation ? 'none' : 'block' }}>
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 } }}>
              <Typography variant="h5" gutterBottom>
                Practice Settings
              </Typography>

              {/* Required Selections */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Skill</InputLabel>
                    <Select
                      value={skill}
                      label="Skill"
                      onChange={(e: SelectChangeEvent<string>) => setSkill(e.target.value)}
                    >
                      {SKILLS.map((skill) => (
                        <MenuItem key={skill} value={skill}>
                          {skill}
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

              {/* Optional Settings */}
              <Accordion sx={{ mt: 3 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Customize More Options</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Job Title"
                        placeholder="Enter your job title"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Task/Objective</InputLabel>
                        <Select
                          value={taskObjective}
                          label="Task/Objective"
                          onChange={(e) => setTaskObjective(e.target.value)}
                        >
                          <MenuItem value="">None</MenuItem>
                          <MenuItem value="presentation">Make a presentation</MenuItem>
                          <MenuItem value="complaint">Handle a complaint</MenuItem>
                          <MenuItem value="negotiation">Lead a negotiation</MenuItem>
                        </Select>
                      </FormControl>
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
                          <MenuItem value="boss">Boss</MenuItem>
                          <MenuItem value="ceo">CEO</MenuItem>
                          <MenuItem value="clients">Clients</MenuItem>
                          <MenuItem value="colleagues">Colleagues</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Formality/Tone</InputLabel>
                        <Select
                          value={formality}
                          label="Formality/Tone"
                          onChange={(e) => setFormality(e.target.value)}
                        >
                          <MenuItem value="">None</MenuItem>
                          <MenuItem value="formal">Formal</MenuItem>
                          <MenuItem value="friendly">Friendly</MenuItem>
                          <MenuItem value="diplomatic">Diplomatic</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Setting</InputLabel>
                        <Select
                          value={setting}
                          label="Setting"
                          onChange={(e) => setSetting(e.target.value)}
                        >
                          <MenuItem value="">None</MenuItem>
                          <MenuItem value="face-to-face">Face-to-face</MenuItem>
                          <MenuItem value="phone">Phone call</MenuItem>
                          <MenuItem value="tradeshow">Trade show</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Industry/Sector</InputLabel>
                        <Select
                          value={industry}
                          label="Industry/Sector"
                          onChange={(e) => setIndustry(e.target.value)}
                        >
                          <MenuItem value="">None</MenuItem>
                          <MenuItem value="retail">Retail</MenuItem>
                          <MenuItem value="tech">Technology</MenuItem>
                          <MenuItem value="education">Education</MenuItem>
                          <MenuItem value="healthcare">Healthcare</MenuItem>
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
                </AccordionDetails>
              </Accordion>

              {/* Start Conversation Button */}
              <Button
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                sx={{ mt: 3 }}
                onClick={() => setShowConversation(true)}
                disabled={!skill || !level || !selectedCourse}
              >
                Start Conversation
              </Button>
            </Paper>
          </Box>
        </Fade>

        <Fade in={showConversation}>
          <Box sx={{ display: showConversation ? 'block' : 'none' }}>
            <Grid container spacing={2}>
              {/* Target Language */}
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

              {/* Conversation */}
              <Grid item xs={12} md={6}>
                <Paper 
                  elevation={3} 
                  sx={{ 
                    p: { xs: 2, sm: 4 }, 
                    height: '100%',
                    minHeight: { xs: '300px', sm: '400px' },
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <Typography variant="h5" gutterBottom>
                    Conversation
                  </Typography>
                  
                  {/* Messages area */}
                  <Box sx={{ 
                    flexGrow: 1, 
                    overflowY: 'auto', 
                    mb: 2,
                    minHeight: { xs: '200px', sm: '300px' },
                    maxHeight: { xs: '250px', sm: '350px' },
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
                        </Paper>
                        <Typography variant="caption" sx={{ mt: 0.5 }}>
                          {message.timestamp.toLocaleTimeString()}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  {/* Recording controls */}
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 1, 
                    alignItems: 'center',
                    mt: 'auto',
                    justifyContent: 'center'
                  }}>
                    <IconButton 
                      color={isRecording ? 'error' : 'primary'}
                      onClick={toggleRecording}
                      disabled={!skill || !level || !selectedCourse || isProcessing}
                      sx={{ 
                        p: { xs: 1.5, sm: 2 },
                        '& svg': {
                          fontSize: { xs: '1.5rem', sm: '2rem' }
                        }
                      }}
                    >
                      {isRecording ? <StopIcon /> : <MicIcon />}
                    </IconButton>
                    {isProcessing && (
                      <CircularProgress 
                        size={24} 
                        sx={{ 
                          ml: 1,
                          color: 'primary.main'
                        }} 
                      />
                    )}
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontSize: { xs: '0.85rem', sm: '0.9rem' },
                        color: isRecording ? 'error.main' : isProcessing ? 'primary.main' : 'text.secondary'
                      }}
                    >
                      {!skill || !level || !selectedCourse 
                        ? 'Please select skill, level, and course to start'
                        : isProcessing
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
                                message: `Absolutely, some useful feedback is: [Analyze my use of target language expressions in this conversation and provide specific examples of what I did well and what expressions I could add. Here are my responses so far:]\n${userMessages}`,
                                context: { 
                                  skill, 
                                  level, 
                                  moduleId: selectedModule,
                                  courseId: selectedCourse,
                                  isFullModule: selectedCourse === `${selectedModule}_practice`,
                                  moduleTitle: getAvailableModules().find(m => m.id === selectedModule)?.title || ''
                                }
                              }),
                            });

                            if (!feedbackResponse.ok) throw new Error('Feedback request failed');
                            const { response } = await feedbackResponse.json();

                            // Add feedback as a new message
                            setMessages(prev => [...prev, {
                              role: 'assistant',
                              content: response,
                              timestamp: new Date()
                            }]);

                            // Convert feedback to speech
                            const ttsResponse = await fetch('/api/text-to-speech', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                text: response,
                                level
                              }),
                            });

                            if (!ttsResponse.ok) throw new Error('Text to speech failed');
                            const audioBlob = await ttsResponse.blob();
                            const audioUrl = URL.createObjectURL(audioBlob);

                            // Auto-play the audio response
                            const audio = new Audio(audioUrl);
                            audio.play();

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
                          p: { xs: 1.5, sm: 2 },
                          '& svg': {
                            fontSize: { xs: '1.5rem', sm: '2rem' }
                          }
                        }}
                      >
                        <FeedbackIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Paper>
              </Grid>

              {/* Back to Settings Button */}
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => setShowConversation(false)}
                  sx={{ mt: 2 }}
                >
                  Back to Settings
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Fade>
      </Box>
    </Container>
  );
}
