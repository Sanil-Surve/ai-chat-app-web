import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Box, Button, TextField, Typography, Paper } from '@mui/material';

type Message = {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
    isStreaming?: boolean; // Track if message is still being streamed
};

const Chat = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    const messageCounterRef = useRef(0);
    const currentStreamingMessageId = useRef<string>('');

    // Initialize socket connection
    useEffect(() => {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://31.97.202.251:8888';

        socketRef.current = io(backendUrl, {
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            transports: ['websocket'],
        });

        socketRef.current.on('connect', () => {
            setIsConnected(true);
            console.log('Connected to WebSocket server');
        });

        socketRef.current.on('disconnect', () => {
            setIsConnected(false);
            console.log('Disconnected from WebSocket server');
        });

        socketRef.current.on('connect_error', (err) => {
            console.error('Connection error:', err);
        });

        // Handle streaming events
        socketRef.current.on('stream_start', () => {
            console.log('Stream started');
            setIsStreaming(true);
            // Create a new message for the streaming response
            const streamingMessageId = createStreamingMessage();
            currentStreamingMessageId.current = streamingMessageId;
        });

        socketRef.current.on('stream_chunk', (chunk: string) => {
            // Append chunk to the current streaming message
            appendToStreamingMessage(currentStreamingMessageId.current, chunk);
        });

        socketRef.current.on('stream_end', () => {
            console.log('Stream ended');
            setIsStreaming(false);
            // Mark the message as complete
            completeStreamingMessage(currentStreamingMessageId.current);
            currentStreamingMessageId.current = '';
        });

        socketRef.current.on('stream_error', (error: string) => {
            console.error('Stream error:', error);
            setIsStreaming(false);
            addMessage(error, 'bot');
            currentStreamingMessageId.current = '';
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    const createUniqueId = () => {
        messageCounterRef.current += 1;
        return `${Date.now()}-${messageCounterRef.current}-${Math.random().toString(36).substr(2, 9)}`;
    };

    const addMessage = (text: string, sender: 'user' | 'bot') => {
        const newMessage: Message = {
            id: createUniqueId(),
            text,
            sender,
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, newMessage]);
    };

    const createStreamingMessage = () => {
        const streamingMessage: Message = {
            id: createUniqueId(),
            text: '',
            sender: 'bot',
            timestamp: new Date(),
            isStreaming: true,
        };
        setMessages((prev) => [...prev, streamingMessage]);
        return streamingMessage.id;
    };

    const appendToStreamingMessage = (messageId: string, chunk: string) => {
        setMessages((prev) =>
            prev.map((msg) =>
                msg.id === messageId
                    ? { ...msg, text: msg.text + chunk }
                    : msg
            )
        );
    };

    const completeStreamingMessage = (messageId: string) => {
        setMessages((prev) =>
            prev.map((msg) =>
                msg.id === messageId
                    ? { ...msg, isStreaming: false }
                    : msg
            )
        );
    };

    const handleSendMessage = () => {
        if (inputMessage.trim() === '' || isStreaming) return;

        // Add user message to UI immediately
        addMessage(inputMessage, 'user');

        // Send message to server
        if (socketRef.current?.connected) {
            socketRef.current.emit('message', inputMessage);
        } else {
            addMessage('Failed to send message - not connected to server', 'bot');
        }

        setInputMessage('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                maxWidth: "90vw",
                margin: '0 auto',
                p: 2,
                boxSizing: 'border-box',
            }}
        >
            <Typography sx={{ mb: 1, textAlign: 'center', fontSize: 36, fontWeight: "bold" }}>Vishwa AI</Typography>
            <Typography variant="subtitle1" sx={{ mb: 2, textAlign: 'center' }}>
                Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </Typography>

            <Box
                sx={{
                    flexGrow: 1,
                    overflowY: 'auto',
                    mb: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                }}
            >
                {messages.map((message) => (
                    <Paper
                        key={message.id}
                        elevation={1}
                        sx={{
                            p: 1,
                            alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
                            backgroundColor: message.sender === 'user' ? '#1976d2' : '#e0e0e0',
                            color: message.sender === 'user' ? '#fff' : '#000',
                            maxWidth: '80%',
                            wordWrap: 'break-word',
                            border: message.isStreaming ? '2px solid #4caf50' : 'none',
                            animation: message.isStreaming ? 'pulse 1.5s infinite' : 'none',
                        }}
                    >
                        <Box
                            sx={{
                                whiteSpace: 'pre-wrap',
                                fontFamily: message.sender === 'bot' ? 'monospace' : 'inherit',
                                fontSize: message.sender === 'bot' ? '1rem' : 'inherit',
                            }}
                        >
                            <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
                                {message.text}
                                {message.isStreaming && <span style={{ animation: 'blink 1s infinite' }}>▊</span>}
                            </Typography>
                        </Box>
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                            {message.timestamp.toLocaleTimeString()}
                            {message.isStreaming && ' • Thinking...'}
                        </Typography>
                    </Paper>
                ))}
            </Box>

            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                }}
            >
                <TextField
                    multiline
                    rows={1}
                    variant="outlined"
                    placeholder="Type your message..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    fullWidth
                    disabled={isStreaming}
                />
                <Button
                    variant="contained"
                    onClick={handleSendMessage}
                    disabled={!isConnected || inputMessage.trim() === '' || isStreaming}
                >
                    {isStreaming ? 'Streaming...' : 'Send'}
                </Button>
            </Box>

            <style>
                {`
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7); }
                    70% { box-shadow: 0 0 0 10px rgba(76, 175, 80, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
                }
                @keyframes blink {
                    0%, 50% { opacity: 1; }
                    51%, 100% { opacity: 0; }
                }
                `}
            </style>
        </Box>
    );
};

export default Chat;