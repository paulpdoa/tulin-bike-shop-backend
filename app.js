require('dotenv').config();
require('events').EventEmitter.defaultMaxListeners = 15;
const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const mainRoute = require('./routes/mainRoute');
const authRoute = require('./routes/authRoute');

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
        app.listen(port,() => {
            console.log(`Listening on port ${port}, DB connected!`);
        });
    }
    catch(err) {
        console.log('Cannot connect to db!');
        console.log(err);
    }
}
connectToMongo();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(cors());
app.use(cookieParser());
app.use(express.static('./public'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// Use routes
app.use(mainRoute);
app.use(authRoute);


