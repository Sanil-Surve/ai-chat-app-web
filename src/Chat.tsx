// import React, { useState, useEffect, useRef } from 'react';
// import { io, Socket } from 'socket.io-client';
// import { Box, Button, TextField, Typography, Paper } from '@mui/material';

// type Message = {
//     id: string;
//     text: string;
//     sender: 'user' | 'bot';
//     timestamp: Date;
// };

// const Chat = () => {
//     const [messages, setMessages] = useState<Message[]>([]);
//     const [inputMessage, setInputMessage] = useState('');
//     const [isConnected, setIsConnected] = useState(false);
//     const socketRef = useRef<Socket | null>(null);

//     // Add a counter to ensure unique IDs
//     const messageCounterRef = useRef(0);

//     // Initialize socket connection
//     useEffect(() => {
//         socketRef.current = io(`${import.meta.env.VITE_BACKEND_URL}`, {
//             reconnectionAttempts: 5,
//             reconnectionDelay: 1000,
//             transports: ['websocket'],
//         });

//         socketRef.current.on('connect', () => {
//             setIsConnected(true);
//             console.log('Connected to WebSocket server');
//         });

//         socketRef.current.on('disconnect', () => {
//             setIsConnected(false);
//             console.log('Disconnected from WebSocket server');
//         });

//         socketRef.current.on('connect_error', (err) => {
//             console.error('Connection error:', err);
//         });

//         // Handle incoming messages
//         socketRef.current.on('message', (response: string) => {
//             addMessage(response, 'bot');
//         });

//         return () => {
//             if (socketRef.current) {
//                 socketRef.current.disconnect();
//             }
//         };
//     }, []);

//     const addMessage = (text: string, sender: 'user' | 'bot') => {
//         // Create truly unique ID using timestamp + counter + random component
//         messageCounterRef.current += 1;
//         const newMessage: Message = {
//             id: `${Date.now()}-${messageCounterRef.current}-${Math.random().toString(36).substr(2, 9)}`,
//             text,
//             sender,
//             timestamp: new Date(),
//         };
//         setMessages((prev) => [...prev, newMessage]);
//     };

//     const handleSendMessage = () => {
//         if (inputMessage.trim() === '') return;

//         // Add user message to UI immediately
//         addMessage(inputMessage, 'user');

//         // Send message to server
//         if (socketRef.current?.connected) {
//             socketRef.current.emit('message', inputMessage);
//         } else {
//             addMessage('Failed to send message - not connected to server', 'bot');
//         }

//         setInputMessage('');
//     };

//     const handleKeyPress = (e: React.KeyboardEvent) => {
//         if (e.key === 'Enter' && !e.shiftKey) {
//             e.preventDefault();
//             handleSendMessage();
//         }
//     };

//     return (
//         <Box
//             sx={{
//                 display: 'flex',
//                 flexDirection: 'column',
//                 height: '100vh',
//                 maxWidth: 600,
//                 margin: '0 auto',
//                 p: 2,
//                 boxSizing: 'border-box',
//             }}
//         >
//             <Typography variant="subtitle1" sx={{ mb: 2, textAlign: 'center' }}>
//                 Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
//             </Typography>

//             <Box
//                 sx={{
//                     flexGrow: 1,
//                     overflowY: 'auto',
//                     mb: 2,
//                     display: 'flex',
//                     flexDirection: 'column',
//                     gap: 1,
//                 }}
//             >
//                 {messages.map((message) => (
//                     <Paper
//                         key={message.id}
//                         elevation={1}
//                         sx={{
//                             p: 1,
//                             alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
//                             backgroundColor: message.sender === 'user' ? '#1976d2' : '#e0e0e0',
//                             color: message.sender === 'user' ? '#fff' : '#000',
//                             maxWidth: '80%',
//                             wordWrap: 'break-word',
//                         }}
//                     >
//                         <Typography variant="body1">{message.text}</Typography>
//                         <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
//                             {message.timestamp.toLocaleTimeString()}
//                         </Typography>
//                     </Paper>
//                 ))}
//             </Box>

//             <Box
//                 sx={{
//                     display: 'flex',
//                     flexDirection: 'column',
//                     gap: 1,
//                 }}
//             >
//                 <TextField
//                     multiline
//                     rows={3}
//                     variant="outlined"
//                     placeholder="Type your message..."
//                     value={inputMessage}
//                     onChange={(e) => setInputMessage(e.target.value)}
//                     onKeyDown={handleKeyPress}
//                     fullWidth
//                 />
//                 <Button
//                     variant="contained"
//                     onClick={handleSendMessage}
//                     disabled={!isConnected || inputMessage.trim() === ''}
//                 >
//                     Send
//                 </Button>
//             </Box>
//         </Box>
//     );
// };

// export default Chat;



import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Box, Button, TextField, Typography, Paper } from '@mui/material';

type Message = {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
};

const Chat = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);

    // Add a counter to ensure unique IDs
    const messageCounterRef = useRef(0);

    // Initialize socket connection
    useEffect(() => {
        // Debug: Log the actual URL being used
        // console.log('Backend URL:', import.meta.env.VITE_BACKEND_URL);
        // console.log('Full URL for socket:', `${import.meta.env.VITE_BACKEND_URL}`);

        // Temporary: Hard-code HTTPS URL for testing
        socketRef.current = io('https://31.97.202.251:8888', {
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

        // Handle incoming messages
        socketRef.current.on('message', (response: string) => {
            addMessage(response, 'bot');
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    const addMessage = (text: string, sender: 'user' | 'bot') => {
        // Create truly unique ID using timestamp + counter + random component
        messageCounterRef.current += 1;
        const newMessage: Message = {
            id: `${Date.now()}-${messageCounterRef.current}-${Math.random().toString(36).substr(2, 9)}`,
            text,
            sender,
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, newMessage]);
    };

    const handleSendMessage = () => {
        if (inputMessage.trim() === '') return;

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
                maxWidth: 600,
                margin: '0 auto',
                p: 2,
                boxSizing: 'border-box',
            }}
        >
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
                        }}
                    >
                        <Typography variant="body1">{message.text}</Typography>
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                            {message.timestamp.toLocaleTimeString()}
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
                    rows={3}
                    variant="outlined"
                    placeholder="Type your message..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    fullWidth
                />
                <Button
                    variant="contained"
                    onClick={handleSendMessage}
                    disabled={!isConnected || inputMessage.trim() === ''}
                >
                    Send
                </Button>
            </Box>
        </Box>
    );
};

export default Chat;