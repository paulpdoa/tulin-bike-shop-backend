require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');

const mainRoute = require('./routes/mainRoute');

// Connect to MongoDB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@tulinbicycleshop.h0zez.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
mongoose.connect(uri);

app.use(express.json());
app.use(cors());
app.use(cookieParser());

// Use routes
app.use(mainRoute);

const port = process.env.PORT || 8000;

app.listen(port,() => {
    console.log(`Listening on port ${port}`);
});
