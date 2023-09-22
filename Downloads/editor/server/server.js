const express = require('express');
const app = express();
const cors = require("cors");

const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const ACTIONS = require('../editor/src/Actions');
const axios = require('axios');
const server = http.createServer(app);
const io = new Server(server);
app.use(cors());

app.use(express.json());

app.use(express.static('build'));
app.use(express.static(path.join(__dirname, '..', 'editor', 'build')));


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
    let code = req.body.code;
    let language = req.body.language;
    let input = req.body.input;

    if (language === 'python') {
        language = 'py';
    }

    const options = {
        method: 'POST',
        url: 'https://easy-compiler-api.p.rapidapi.com/api/python',
        headers: {
            'content-type': 'application/json',
            'X-RapidAPI-Key': '87ff673866msh03ca039cb0eb488p1bde1djsn918ababb1aff',
            'X-RapidAPI-Host': 'easy-compiler-api.p.rapidapi.com',
        },
        data: {
            code: code,
            input: input,
        },
    };

    try {
        const response = await axios.request(options);
        res.send(response.data);
        console.log(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error'); // You may customize the error response as needed
    }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
