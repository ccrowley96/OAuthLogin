const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const {OAuth2Client} = require('google-auth-library');
const dotenv = require('dotenv').config();
const client = new OAuth2Client(process.env.CLIENT_ID);
const {User} = require('./db/db_index');
const cors = require('cors');

const app = express();
const port = 3000;

// Enable Cross Origin Requests with CORS
app.use(cors({credentials: true, origin: true}));

//Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Static Files
app.use(express.static(path.join(__dirname, '../client/')));

//Start Listening
app.listen(port, () => {
    console.log(`Auth app server running on port: ${port}!`);
  }
);

// Connect to Mongo DB
mongoose.connect(process.env.MONGO_CONNECT_DEV, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

const db = mongoose.connection;
//Check connection
db.once('open', () =>{
  console.log('Connected to MongoDB');
});

//Check for DB errors
db.on('error', (err) => {
  console.log("Database Error!");
  console.log(err);
});

//Verify sign in token endpoint
app.post('/tokensignin', async (req, res) => {
    let {id_token} = req.body;
    // let id_token = "abc";
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: id_token,
            audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
        });
        const payload = ticket.getPayload();
        const userid = payload['sub'];
        // console.log(payload);

        // See if user already created
        let user = await User.findOne({'googleObj.sub':  userid});
        if(!user){
            console.log('User not found, creating user...');
            // Need to create user
            user = new User({googleObj: payload});
            user.save();            
        } else{
            // Need to give auth session to user
            console.log("User Found! -- ", user.googleObj.given_name);
        }
        res.status(200);
        res.json({
            title: 'User',
            given_name: user.googleObj.given_name,
            family_name: user.googleObj.family_name,
            email: user.googleObj.email,
            uid: user.googleObj.sub
        });
    }
    verify()
    .catch((err) => {
        console.error(err);
        res.sendStatus(500);
    });
})