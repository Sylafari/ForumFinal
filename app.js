const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');

mongoose.connect('mongodb://localhost/nodekb', { useUnifiedTopology: true, useNewUrlParser: true });
let db = mongoose.connection;

// Check connection
db.once('open', ()=>{
    console.log('Connected to MongoDB');
});

// Check for DB errors
db.on('error', (err)=>{
    console.log(err);
});

// Init App
const app = express();

// Bring in Models
let Article = require('./models/article');

// Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//BodyParser
app.use(express.urlencoded({extended:false}));

// Set Public Folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session Middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
}));

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express Validator Middleware
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.')
        , root    = namespace.shift()
        , formParam = root;
  
      while(namespace.length) {
        formParam += '[' + namespace.shift() + ']';
      }
      return {
        param : formParam,
        msg   : msg,
        value : value
      };
    }
  }));
  

// Home Route
app.get('/', (req, res) => {
    Article.find({}, (err, articles)=>{
        if(err){
            console.log(err);
        } else{
            res.render('index', {
        title: 'Articles',
        articles: articles
        });
        }
    });
});

// Route Files
let articles = require('./routes/articles');
app.use('/articles', articles);

// Start Server
app.listen(3000, ()=> {
    console.log('Server started on port 3000...')
});