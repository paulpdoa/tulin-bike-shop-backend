require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const mainRoute = require('./routes/mainRoute');

// Connect to MongoDB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@tulinbicycleshop.h0zez.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const port = process.env.PORT || 8000;

const connectToMongo = async () => {
    try {
        await mongoose.connect(uri,{ useNewUrlParser: true, useUnifiedTopology: true });
        app.listen(port,() => {
            console.log(`Listening on port ${port}, DB connected!`);
        });
    }
    catch(err) {
        console.log('Cannot connect to db!')
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


