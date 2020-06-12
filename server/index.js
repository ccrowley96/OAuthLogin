const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
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