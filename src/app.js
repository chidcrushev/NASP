
//Install the Dependencies
const express     = require('express');
const path        = require('path');
const app         = express();
const http        = require('http').createServer(app);
const session     = require('express-session');
const bodyParser  = require('body-parser');
const port        = process.env.PORT || 2000; // used
const router      = require('../routing/routes');
const hbs         = require('express-handlebars');

// Static folder
app.use(express.static(path.join(__dirname, 'src'), {extensions: ['html', 'htm']}) );
app.use(express.urlencoded({ extended: true }));


//Setting up handlebars.
app.engine('hbs', hbs({
   extname: 'hbs',
   defaultLayout:  path.join(__dirname, '../views/main') 

}))
app.set('view engine', 'hbs');


//Setting up routing
app.use('/', router);

// Start the server 
http.listen(port, () => console.log(`Server is listening on port ${port}`));  