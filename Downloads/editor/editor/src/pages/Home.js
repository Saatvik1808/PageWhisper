import React, { useState } from 'react';
import { v4 as uuidV4 } from 'uuid';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import backgroundVideo from '../background.mp4'; // Make sure to provide the correct path to your video file

const Home = () => {
    const navigate = useNavigate();

    const [roomID, setRoomId] = useState('');
    const [username, setUsername] = useState('');

    const createNewRoom = (e) => {
        e.preventDefault();
        const id = uuidV4();
        setRoomId(id);
        console.log(id);
        toast.success('Created a New Room');
    };

    const handleInputEnter = (e) => {
        if (e.key === 'Enter') {
            joinRoom();
        }
    };

    const joinRoom = () => {
        if (!roomID || !username) {
            toast.error('Room ID and Username are Required');
            return;
        }
        navigate(`/editor/${roomID}`, {
            state: {
                username,
            },
        });
    };

    return (
        <div className='homePageWrapper'>
            {/* Add the video background */}
            <video autoPlay muted loop id="videoBackground" className="video-background">
                <source src={backgroundVideo} type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            <div className='formWrapper'>
                <img
                    className="homePageLogo"
                    src='/devsync-high-resolution-logo-white-on-transparent-background.png'
                    alt='logo-dev'
                />
                <h4 className='mainLabel'>INVITATION CODE</h4>
                <div className='inputGroup'>
                    <input
                        type='text'
                        className='inputBox'
                        placeholder='ROOM ID'
                        onChange={(e) => setRoomId(e.target.value)}
                        value={roomID}
                        onKeyUp={handleInputEnter}
                    />
                    <input
                        type='text'
                        className='inputBox'
                        placeholder='USERNAME'
                        onChange={(e) => setUsername(e.target.value)}
                        value={username}
                        onKeyUp={handleInputEnter}
                    />
                </div>
                <button className='btn joinBtn' onClick={joinRoom}>
                    Join
                </button>
                <div className='createInfo'>
                    If you don't have an invitation code, then create&nbsp;
                    <a onClick={createNewRoom} href='' className='createNewBtn'>
                        new room
                    </a>
                </div>
            </div>
            <footer>
                <h4>built by Saatvik</h4>
            </footer>
        </div>
    );
};

export default Home;
