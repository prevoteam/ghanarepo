require('dotenv').config(); // SUPPORT .ENV FILES
const express = require('express'); // BRING IN EXPRESS
const app = express(); // INITILIZE APP
const helmet = require("helmet");
const path = require('path');
const bodyParser = require('body-parser');
const correlator = require('express-correlation-id');


const http = require('http'); // CORE MODULE, USED TO CREATE THE HTTP SERVER
const server = http.createServer(app); // CREATE HTTP SERVER USING APP
const port = process.env.PORT || '3000'; // INITIALIZE DEFAULT PORT OR PORT FROM ENVIRONMENT VARIABLE
const cron = require("node-cron"); 
const homeService = require('./services/homeService');




// VIEW ENGINE SETUP
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ limit: '50mb', extended: false })); // PARSE application/x-www-form-urlencoded
app.use(bodyParser.json({ limit: '50mb' })); // PARSE application/json

// USE STATIC FILES (CSS, JS, IMAGES)
app.use(express.static(path.join(__dirname, 'public')));

// USE STATIC FILES (uploads)
app.use("/uploads",express.static(path.join(__dirname, 'uploads')));
// CORS
const cors = require('cors');
app.use(cors());

// SECURITY
app.disable('x-powered-by');
app.use(helmet.frameguard({ action: 'deny' }));

// middleware here
app.use(correlator());

// ROUTES
const apiRoutes = require('./routes/index');
app.use(process.env.BASE_URL, apiRoutes({ express }));

// DATABASE INITIALIZATION
const db = require('./database/db_helper');
db.initialize().catch((err) => {
  console.error('Failed to connect to the database:', err);
  process.exit(1); // TERMINATE THE APPLICATION IF THE DATABASE CONNECTION FAILS
});
 


/*
* START SERVER
*/

// SET THE PORT
app.set('port', port);

// LISTEN ON SPECIFIED PORT
server.listen(port);

// LOG WHICH PORT THE SERVER IS RUNNING ON
console.log('Server listening on port ' + port);

// ERROR HANDLER
app.use((err, req, res, next) => {  

  res.status(err.status || 500).send(err.stack);
});

// EXPORT APP
module.exports = app;
