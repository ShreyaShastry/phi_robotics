const express = require('express');
const app = express();
const path = require('path');
const formidable = require('formidable');
const mysql = require('mysql2');

const session = require('express-session');
const bodyparser = require('body-parser');

app.use(session({
  secret: 'secret-key123',
  resave: false,
  saveUninitialized:false
}))

app.use(bodyparser.urlencoded({extended:true}));

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'T0mmy@$om',
  database: 'profile_db'
});


function authenticate(req, res, next) {
  if (req.session.isAuthenticated) {
    return next();
  }
  res.redirect('/page3.html');
}

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'page3.html'));
});

app.post('/login', (req, res) => {
  const creds = new formidable.IncomingForm();
  creds.uploadDir=path.join(__dirname,'public','page3.html');
  creds.parse(req, (err, fields, files) => {

    if (err) {
      console.error('Error parsing form:', err);
      return res.status(500).json({ error: 'Server error' });
    }
    const {username,password} = fields;


  pool.query('SELECT * FROM registered_users WHERE username = ?', [username], (error, results) => {
    if (error) {
      console.error('Error querying the database:', error);
      return res.status(500).json({ error: 'Server error' });
    }

    if (results.length === 0) {
      res.send('User not found. <a href="/login">Try again</a>');
    } else {
      const user = results[0];

      if (password === user.password) {
        req.session.isAuthenticated = true;
        req.session.username = user.username;
        res.redirect('/index.html');
      } else {
        res.send('Invalid password. <a href="/login">Try again</a>');
      }
    }
  });
  
});

});
app.get('/dashboard', authenticate, (req, res) => {
  res.send(`Welcome, ${req.session.username}!>`);
});





/*

const dotenv = require('dotenv');
dotenv.config({path:'./.env'});
const session = require('express-session');

app.use(session({
  secret: 'key that will sign the cookie',
  resave: false, 
  saveUninitialized: false
}))
app.get("/",(req,res)=>{
  req.session.isAuth=true;
  console.log(req.session);
  console.log(req.session.id);
  res.send("Hello World!");
})
const pool = mysql.createPool({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE
});
*/


app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));

app.post('/submit', (req, res) => {
  const form = new formidable.IncomingForm();

  form.uploadDir = path.join(__dirname, 'public');
  
  form.parse(req, (err, fields, files) => {

    if (err) {
      console.error('Error parsing form:', err);
      return res.status(500).json({ error: 'Server error' });
    }

    const { name, mobile, email, message } = fields;
    const { uploadedFile } = files;

    console.log('Submitted');
    console.log(`Name: ${name}`);
    console.log(`Mobile: ${mobile}`);
    console.log(`Email: ${email}`);
    console.log(`Message: ${message}`);
    
    if (uploadedFile) {
      console.log(`Uploaded File: ${uploadedFile.name}`);
    }

    res.redirect('/page2.html');
    
    pool.query('INSERT INTO messages(name,mobile,email,message) VALUES (?,?,?,?)',
    [name,mobile,email,message],(error,results)=>{
      
      if(error){
        console.error('Error inserting data:',error);
      }
      else{
        console.log('Data isnerted successfully');
      }
      
    }); 
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
