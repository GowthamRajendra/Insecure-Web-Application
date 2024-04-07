const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const xxe = require("./routes/xxe/xxeServer.js");
const sqli = require("./routes/sqliServer.js");
const bug3 = require("./routes/bug3.js");
const session = require('express-session');
const store = new session.MemoryStore();

const app = express();

app.use(express.static('../client'));
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.json());

// session used for sqli bug
app.use(session({
  secret: 'mynameiswalterhartwellwhiteyo!',
  cookie: {
    sameSite: 'strict',
    maxAge: 1800000, // 30 minutes
  },
  saveUninitialized: false,
  resave: true,
  store: store
}));

app.use('/xxe', xxe);
app.use('/sqli', sqli);
app.use('/bug3', bug3);

app.get('/', (req, res) => {    
    // if there is no security cookie, set it to low
    if (!req.cookies.security) {
        res.cookie('security', 'Low', { httpOnly: false });
    }

    res.sendFile(path.join(__dirname, '../client/pages/index.html'));
});

app.post('/security', (req, res) => {
  const securityLevel = req.body["Security Level"];
  console.log(securityLevel);
  
  // if security level was modified in request
  if (!["Low", "Medium", "High"].includes(securityLevel)) {
    res.cookie('security', 'Low', { httpOnly: false });
    res.send('Security level set to Low');
  }
  // expected request
  else {
    res.cookie('security', securityLevel, { httpOnly: false });
    res.send('Security level set to ' + securityLevel);
  }
});

app.listen(9000, () => {
  console.log('Listening on http://localhost:9000');
});


