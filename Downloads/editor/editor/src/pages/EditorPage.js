import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import ACTIONS from '../Actions';
import Client from '../Components/Client';
import Editor from '../Components/Editor';
import { initSocket } from '../socket';
import axios from 'axios';
import spinner from "../spinner3.svg"
import Navbar from "../Components/Navbar.js"
import "./Edi.css";
import {
    useLocation,
    useNavigate,
    Navigate,
    useParams,
} from 'react-router-dom';

const EditorPage = () => {
    const socketRef = useRef(null);
    const codeRef = useRef(null);
    const location = useLocation();
    const { roomId } = useParams();
    const reactNavigator = useNavigate();
    const [clients, setClients] = useState([]);
    const [userCode, setUserCode] = useState('');
    const [userInput, setUserInput] = useState('');
    const [userOutput, setUserOutput] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('c++');
    const [selectedTheme, setSelectedTheme] = useState('vs-dark');

    useEffect(() => {
        const init = async () => {
            socketRef.current = await initSocket();
            socketRef.current.on('connect_error', (err) => handleErrors(err));
            socketRef.current.on('connect_failed', (err) => handleErrors(err));

            function handleErrors(e) {
                console.log('socket error', e);
                toast.error('Socket connection failed, try again later.');
                reactNavigator('/');
            }

            socketRef.current.emit(ACTIONS.JOIN, {
                roomId,
                username: location.state?.username,
            });

            // Listening for joined event
            socketRef.current.on(
                ACTIONS.JOINED,
                ({ clients, username, socketId }) => {
                    if (username !== location.state?.username) {
                        toast.success(`${username} joined the room.`);
                        console.log(`${username} joined`);
                    }
                    setClients(clients);
                    socketRef.current.emit(ACTIONS.SYNC_CODE, {
                        code: codeRef.current,
                        socketId,
                    });
                }
            );

            // Listening for disconnected
            socketRef.current.on(
                ACTIONS.DISCONNECTED,
                ({ socketId, username }) => {
                    toast.success(`${username} left the room.`);
                    setClients((prev) => {
                        return prev.filter(
                            (client) => client.socketId !== socketId
                        );
                    });
                }
            );
        };
        init();
        return () => {
            socketRef.current.disconnect();
            socketRef.current.off(ACTIONS.JOINED);
            socketRef.current.off(ACTIONS.DISCONNECTED);
        };
    }, []);

    async function copyRoomId() {
        try {
            await navigator.clipboard.writeText(roomId);
            toast.success('Room ID has been copied to your clipboard');
        } catch (err) {
            toast.error('Could not copy the Room ID');
            console.error(err);
        }
    }

    function compile() {
        console.log('compile function called');
    
        setLoading(true);
        if (userCode === '') {
            return;
        }
    
        // Post request to compile endpoint
        axios.post(`http://localhost:5000/compile`, {
            code: userCode,
            language: selectedLanguage, // Use selected language
            input: userInput,
        })
        .then((res) => {
            if (res.data.output) {
                // If there is an error, display the error message
                setUserOutput(res.data.output);
                console.log('Compilation Result:', res.data.output);
               
            } else {
                // If there is no error, display the output
                setUserOutput(`Compilation Error: ${res.data.error}`);
                console.error('Compilation Error:', res.data.error);
            }
        })
        .catch((error) => {
            console.error(error);
            setUserOutput('Error occurred while compiling.');
        })
        .finally(() => {
            setLoading(false);
        });
    }
    

    function leaveRoom() {
        reactNavigator('/');
    }

    // Function to clear user output
    function clearOutput() {
        setUserOutput('');
    }

    if (!location.state) {
        return <Navigate to="/" />;
    }

    // Function to handle language selection
    const handleLanguageChange = (e) => {
        setSelectedLanguage(e.target.value);
    };

    // Function to handle theme selection
    const handleThemeChange = (e) => {
        setSelectedTheme(e.target.value);
    };

    return (
        <div className="mainWrap">

            <div className="aside">
                <div className="logo">
                    <img
                        className="homePageLogo"
                        src='/devsync-high-resolution-logo-white-on-transparent-background.png'
                        alt='logo-dev'
                    />
                </div>
                <h3 className='han' >Connected</h3>
                <div className="clientsList">
                    {clients.map((client) => (
                        <Client
                            key={client.socketId}
                            username={client.username}
                        />
                    ))}
                </div>

                <button className="btn copyBtn" onClick={copyRoomId}>
                    Copy ROOM ID
                </button>
                <button className="btn leaveBtn" onClick={leaveRoom}>
                    Leave
                </button>
            </div>

            <div className="editorWrap">
                <div className="settings">
                    <div className="dropdown">
                        <label htmlFor="languageDropdown">Language: </label>
                        <select
                            id="languageDropdown"
                            value={selectedLanguage}
                            onChange={handleLanguageChange}
                        >
                            <option value="python">Python</option>
                            <option value="c++">c++</option>
                            <option value="java">java</option>
                            {/* Add more language options as needed */}
                        </select>
                    </div>

                </div>
                <Editor
                    socketRef={socketRef}
                    roomId={roomId}
                    selectedLanguage={selectedLanguage} // Pass selected language to the Editor component
                    onCodeChange={(code) => {
                        codeRef.current = code;
                        setUserCode(code);
                    }}
                />
                {/* Add input and output sections */}
            </div>
            <div className="right-container">
                <h4>Input:</h4>
                <div className="input-box">
                    <textarea id="code-inp" onChange={(e) => setUserInput(e.target.value)}></textarea>
                </div>
                <h4>Output:</h4>
                {loading ? (
                    <div className="spinner-box">
                        <img src={spinner} alt="Loading..." />
                    </div>
                ) : (
                    <div className="output-box">
                        <pre>{userOutput}</pre>
                    </div>
                )}
                <button onClick={() => { clearOutput() }} className="clear-btn">
                    Clear
                </button>
                <button className="run-btn" onClick={compile}>
                    Run
                </button>
            </div>
        </div>
    );
};

export default EditorPage;
