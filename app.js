require('dotenv').config();
require('events').EventEmitter.defaultMaxListeners = 15;
const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');
app.use(cors());
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { Server } = require('socket.io');

const mainRoute = require('./routes/mainRoute');
const authRoute = require('./routes/authRoute');

const server = http.createServer(app);
const io = new Server(server,{
    cors: {
        origin:"http://localhost:3000" || process.env.FRONTEND_LINK,
        methods: ["GET","POST"],
    }
});



// Connect to MongoDB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@tulinbicycleshop.h0zez.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const port = process.env.PORT || 8000;
const options = {
    useNewUrlParser: true,
    autoIndex: true, //this is the code I added that solved it all
    keepAlive: true,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    family: 4, // Use IPv4, skip trying IPv6
    useUnifiedTopology: true
  }

const connectToMongo = async () => {
    try {
        await mongoose.connect(uri,options);
        server.listen(port,() => {
            console.log(`Listening on port ${port}, DB connected!`);
        });
    }
    catch(err) {
        console.log('Cannot connect to db!');
        console.log(err);
    }
}
connectToMongo();

// Use socket io library
io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("send_message", (data) => {
       
        socket.to(data.room).emit("receive_message", data);
    });
    socket.on("join_room",(data) => {
        socket.join(data);
        console.log(`User with ID of ${socket.id} joined the room ${data}`);
    });

    socket.on("disconnect",() => {
        console.log("User disconnected", socket.id);
    });
})

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }))

app.use(cookieParser());
app.use(express.static('./public'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// Use routes
app.use(mainRoute);
app.use(authRoute);


