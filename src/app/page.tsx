'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  TextField,
  Button,
  Avatar,
  useMediaQuery, 
  useTheme,
  CircularProgress 
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import { nanoid } from 'nanoid';
import { systemMessage } from './constants';
import DynamicTimeline from '@/components/DynamicTimeline';
import { TimelineResponse } from '@/types/timeline';

// Define message type
type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export default function Page() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  
  // Timeline data state
  const [timelineData, setTimelineData] = useState<TimelineResponse | null>(null);
  
  // Initialize session ID
  useEffect(() => {
    setSessionId(nanoid());
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isLoading) return;

    // Add user message to state
    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Reset timeline data when new conversation starts
    setTimelineData(null);

    try {
      // Prepare full message history
      const allMessages = [
        ...messages.filter(m => m.role !== 'system'),
        userMessage
      ];

      // Call API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: allMessages,
          sessionId,
        }),
      });

      // Get the response data
      const data = await response.json();

      // Check if this is an error response
      if (!response.ok) {
        let errorMessage = data.message || "I encountered an issue processing your request.";

        // Handle rate limiting specifically
        if (response.status === 429 && data.waitTime) {
          // If we have a wait time, display a countdown
          let remainingTime = data.waitTime;
          setMessages(prev => [
            ...prev,
            { role: 'assistant', content: `${data.message} (${remainingTime}s)` }
          ]);

          // Start a countdown timer
          const timerId = setInterval(() => {
            remainingTime -= 1;
            if (remainingTime <= 0) {
              clearInterval(timerId);
              setMessages(prev => {
                // Update the last message
                const updatedMessages = [...prev];
                const lastIndex = updatedMessages.length - 1;
                if (lastIndex >= 0 && updatedMessages[lastIndex].role === 'assistant') {
                  updatedMessages[lastIndex] = {
                    ...updatedMessages[lastIndex],
                    content: data.message + " You can try again now."
                  };
                }
                return updatedMessages;
              });
            } else {
              // Update the countdown in the message
              setMessages(prev => {
                const updatedMessages = [...prev];
                const lastIndex = updatedMessages.length - 1;
                if (lastIndex >= 0 && updatedMessages[lastIndex].role === 'assistant') {
                  updatedMessages[lastIndex] = {
                    ...updatedMessages[lastIndex],
                    content: `${data.message} (${remainingTime}s)`
                  };
                }
                return updatedMessages;
              });
            }
          }, 1000);
        } else {
          // Add error message to chat for other errors
          setMessages(prev => [
            ...prev,
            { role: 'assistant', content: errorMessage }
          ]);
        }

        return; // Exit early
      }

      // Handle successful response
      const assistantMessage = data.message || "I've planned your day based on your priorities.";
      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);

      // Set timeline data if available
      if (data.timeline && data.timeline.items && data.timeline.items.length > 0) {
        setTimelineData(data.timeline);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      // Show friendly error message to user
      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: 'Sorry, I encountered a connection error. Please check your internet connection and try again in a moment.' 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get visible messages (excluding system messages)
  const visibleMessages = messages.filter(m => m.role !== 'system');

  return (
    <Container
      maxWidth="md"
      disableGutters={isMobile}
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        p: 0,
      }}
    >
      <Paper
        elevation={isMobile ? 0 : 3}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: isMobile ? 0 : 2,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2, 
            bgcolor: 'primary.main',
            color: 'white',
            borderBottom: 1,
            borderColor: 'divider'
          }}
        >
          <Typography variant="h6">Daily Goals</Typography>
        </Box>

        {/* Messages Area */}
        <Box
          sx={{
            flex: '1 1 auto',
            overflow: 'auto',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}
        >
          {visibleMessages.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                opacity: 0.7,
              }}
            >
              <Typography variant={isMobile ? "h6" : "h5"} sx={{ mb: 2 }}>
                Welcome to Daily Goals
              </Typography>
              <Typography variant="body1">
                What are the top things you want to accomplish today?
              </Typography>
            </Box>
          ) : (
            // Render each message
            visibleMessages.map((message, index) => {
              const isUser = message.role === 'user';
              return (
                <Box
                  key={`msg-${index}`}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    flexDirection: isUser ? 'row-reverse' : 'row',
                  }}
                >
                  <Avatar
                    sx={{
                      mr: isUser ? 0 : 1,
                      ml: isUser ? 1 : 0,
                      width: isMobile ? 32 : 40,
                      height: isMobile ? 32 : 40,
                    }}
                  >
                    {isUser ? 
                      <PersonOutlineOutlinedIcon fontSize={isMobile ? "small" : "medium"} /> : 
                      <SmartToyOutlinedIcon fontSize={isMobile ? "small" : "medium"} />
                    }
                  </Avatar>
                  
                  <Paper
                    elevation={1}
                    sx={{
                      p: isMobile ? 1.5 : 2,
                      maxWidth: isMobile ? '75%' : '70%',
                      borderRadius: isUser 
                        ? isMobile ? '12px 4px 12px 12px' : '16px 4px 16px 16px' 
                        : isMobile ? '4px 12px 12px 12px' : '4px 16px 16px 16px',
                    }}
                  >
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontSize: isMobile ? '0.9rem' : '1rem',
                        wordBreak: 'break-word',
                      }}
                    >
                      {message.content}
                    </Typography>
                  </Paper>
                </Box>
              );
            })
          )}
          
          {/* Display Timeline if data is available */}
          {timelineData && timelineData.items && timelineData.items.length > 0 && (
            <Box 
              sx={{ 
                mt: 2, 
                p: 2, 
                bgcolor: 'background.paper', 
                borderRadius: 2,
                boxShadow: 1
              }}
            >
              <Typography variant="h6" sx={{ mb: 2 }}>Your Daily Schedule</Typography>
              <DynamicTimeline items={timelineData.items} />
            </Box>
          )}
          
          <div ref={messagesEndRef} />
        </Box>

        {/* Input Area */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: 'flex',
            p: 2,
            gap: 2,
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <TextField
            fullWidth
            placeholder="Type your message..."
            value={input}
            onChange={handleInputChange}
            disabled={isLoading}
            multiline
            maxRows={isMobile ? 3 : 4}
            variant="outlined"
          />
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={!input.trim() || isLoading}
            sx={{
              minWidth: isMobile ? '44px' : '48px',
              height: isMobile ? '44px' : '48px',
              borderRadius: '50%',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              alignSelf: 'flex-end',
            }}
          >
            {isLoading ? 
              <CircularProgress size={24} color="inherit" /> : 
              <SendIcon />
            }
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
