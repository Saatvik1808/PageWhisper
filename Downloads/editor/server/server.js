const express = require('express');
const app = express();
const cors = require("cors");
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const ACTIONS = require('../client/src/Actions');
const axios = require('axios');
const server = http.createServer(app);
const io = new Server(server);
const qs = require('qs');
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'build')));
console.log('__dirname:', __dirname);
console.log('Resolved path:', path.join(__dirname, 'build', 'index.html'));

app.use(express.static(path.join(__dirname, 'build')));

const userSocketMap = {};

function getAllConnectedClients(roomId) {
    // Map
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
        (socketId) => {
            return {
                socketId,
                username: userSocketMap[socketId],
            };
        }
    );
}

io.on('connection', (socket) => {
    console.log('socket connected', socket.id);

    socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
        userSocketMap[socket.id] = username;
        socket.join(roomId);
        const clients = getAllConnectedClients(roomId);
        clients.forEach(({ socketId }) => {
            io.to(socketId).emit(ACTIONS.JOINED, {
                clients,
                username,
                socketId: socket.id,
            });
        });
    });

    socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    socket.on('disconnecting', () => {
        const rooms = [...socket.rooms];
        rooms.forEach((roomId) => {
            socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
                socketId: socket.id,
                username: userSocketMap[socket.id],
            });
        });
        delete userSocketMap[socket.id];
        socket.leave();
    });
});

// Add the /compile route handler
app.post('/compile', async (req, res) => {
    // Getting the required data from the request
    console.log('Received a compile request'); 
    let code = req.body.code;
    let language = req.body.language;
    let input = req.body.input;

    if (language === 'python') {
        language = 'py';
    }  
    if (language == 'c++') {
        language = 'cpp';
    }
    if (language == 'java') {
        language = 'java';
    }
    if (language == 'C') {
        language = 'c';
    }
    // Prepare the data for the new API
    const data = {
        'code': code,
        'language': language,
        'input': input
    };
    
    const config = {
        method: 'post',
        url: 'https://api.codex.jaagrav.in',
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    };

    try {
        const response = await axios.request(config);
        res.send(response.data); // Send the entire API response
        console.log('API Response:', response.data);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
});



const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
