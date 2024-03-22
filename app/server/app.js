const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bug1 = require("./routes/bug1.js");
const bug2 = require("./routes/bug2.js");
const bug3 = require("./routes/bug3.js");

const app = express();

app.use(express.static('../client'));
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.json());

app.use('/bug1', bug1);
app.use('/bug2', bug2);
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

  // set the security level cookie
  res.cookie('security', securityLevel, { httpOnly: false });

  res.send('Security level set to ' + securityLevel);
});


app.listen(9000, () => {
  console.log('Listening on http://localhost:9000');
});
