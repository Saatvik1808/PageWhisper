import React, { useState } from 'react';
import {v4 as uuidV4} from 'uuid'
import toast from 'react-hot-toast'

const Home = () => {
    const [roomID,setRoomId]=useState('');
    const [username,setUsername]=useState('');
    const createNewRoom=(e)=>
    {

        e.preventDefault();
        const id = uuidV4();
        setRoomId(id);
        console.log(id);
        toast.success('Created a New Room ');


    };
    return (
        <div className='homePageWrapper'>
            <div className='formWrapper'>
                <img className="homePageLogo" src='/devsync-high-resolution-logo-white-on-transparent-background.png' alt='logo-dev' />
                <h4 className='mainLabel'>INVITATION CODE</h4>
                <div className='inputGroup'>
                    <input type='text' className='inputBox' placeholder='ROOM ID' onChange={(e)=> setRoomId(e.target.value)} value={roomID}/>
                    <input type='text' className='inputBox' placeholder='USERNAME'onChange={(e)=> setUsername(e.target.value)} value={username} />
                </div>
                <button className='btn joinBtn'>Join</button>
                <div className='createInfo'>
                    If you don't have an invitation code, then create&nbsp;
                    <a onClick={createNewRoom} href='' className='createNewBtn'>new room</a>
                </div>
            </div>
            <footer>
                <h4>built by Saatvik</h4>
            </footer>
        </div>
    );
}

export default Home;
