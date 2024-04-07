// change name later
const express = require('express');
const path = require('path');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const uuid = require('uuid'); // for user accounts

// connect to db for sqli bug
const db = new sqlite3.Database("./sqlidb.db", sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      return console.error(err.message);
    }
});

router.get('/', (req, res) => {
    // if security cookie was tampered with/doesn't exist, change it to low
    if (!["Low", "Medium", "High"].includes(req.cookies.security)) {
        res.cookie('security', 'Low', { httpOnly: false });
    }

    // if logged in
    if (req.session.authorized) {
        res.sendFile(path.join(__dirname, '../../client/pages/sqli/sqli-loggedin.html'));
        console.log(`session_id: ${req.session.id}`);
    }
    else {
        res.sendFile(path.join(__dirname, '../../client/pages/sqli/sqli-loggedout.html'));
        console.log(`session_id: ${req.session.id}`);
    }
});

router.get('/completed', (req, res) => {
    const security = req.cookies.security;

    db.all(`SELECT * FROM posts WHERE username = 'cooladmin'`, (err, rows) => {
        if (err) return console.error(err.message);

        if (rows.length == 0) {
            res.send({completed: true, msg: `Completed challenge: delete admin's comments on ${req.cookies.security} difficulty`});

            let messages = [["cooladmin", "MY FIRST POST!!!", "HI!"], ["cooladmin", "I HATE FISHING", "I'm the admin and I HATE FISHING"], ["cooladmin", "No talking about fishing", "You will be banned if you talk about fishing!"]];
            messages.forEach(message => db.run(`INSERT INTO posts(username, title, message) VALUES (?,?,?)`, message));
            
            req.session.destroy(); // logout in preparation for next difficulty.
        }
        else {
            res.send({completed: false});
        }
    });
})

// allow list for medium-hard
const allow_list = 'a-zA-Z0-9.,!?\\-() '
const allow_list_regex = new RegExp(`^[${allow_list}]+$`);

// for searching posts
router.get('/posts', (req, res) => {
    let search = req.query.search;
    let security = req.cookies.security;

    console.log(`difficulty: ${security}. sqli bug getting posts: ${search}`);

    // empty string, show all posts.
    if (search === '') {
        db.all(`SELECT * FROM posts`, [], (err, rows) => {
        if (err) return console.error(err.message);
        
        res.send(rows);
        });
    }
    // else query for post with similar username or title.
    else {
        // low difficulty, inject user input directly into query.
        if (security === "Low") {
            db.all(`SELECT * FROM posts WHERE username LIKE '%${search}%' OR title LIKE '%${search}%'`, (err, rows) => {
                if (err) return console.error(err);
                
                res.send(rows);
            });
        }

        // medium, allow list
        else if (security == "Medium") {
            if (allow_list_regex.test(search)) {
                db.all(`SELECT * FROM posts WHERE username LIKE '%${search}%' OR title LIKE '%${search}%'`, (err, rows) => {
                    if (err) return console.error(err);
                    
                    res.send(rows);
                });
            }
            else {
                res.send([]);
            }
        }

        // else high difficulty, allow list and prepared statement.
        else {
            if (allow_list_regex.test(search)) {
                db.all(`SELECT * FROM posts WHERE username LIKE ? OR title LIKE ?`, [`%${search}%`, `%${search}%`], (err, rows) => {
                    if (err) return console.error(err);
                    
                    res.send(rows);
                });
            }
            else {
                res.send([]);
            }
        }
    }
});

// creating a post
router.post('/posts', (req, res) => {
    // need account to post
    if (!req.session.authorized) {
        return;
    }

    const username = req.session.user.username;
    const title = req.body.title;
    const message = req.body.message;

    console.log(`user: ${username}, \ntitle: ${title}\nmessage: ${message}`);

    const security = req.cookies.security;

    if (security === 'Low') {
        db.run(`INSERT INTO posts(username, title, message) VALUES ('${username}', '${title}', '${message}')`, (err) => {
            if (err) return res.status(401).send(err.message);

            res.redirect('/sqli');
        });
    }

    // medium, allow list
    else if (security === 'Medium') {
        if (allow_list_regex.test(title) && allow_list_regex.test(message)) {
            db.run(`INSERT INTO posts(username, title, message) VALUES ('${username}', '${title}', '${message}')`, (err) => {
                if (err) return res.status(401).send(err.message);

                res.redirect('/sqli');
            });
        }
        else {
            res.status(401).send("Title and message can only contain valid characters: " + allow_list);
        }
    }
    
    // else hard, allow list and prepared statement
    else {
        if (allow_list_regex.test(title) && allow_list_regex.test(message)) {
            db.run(`INSERT INTO posts(username, title, message) VALUES (?, ?, ?)`, [username, title, message], (err) => {
                if (err) return res.status(401).send(err.message);

                res.redirect('/sqli');
            });
        }
        else {
            res.status(401).send("Title and message can only contain valid characters: " + allow_list);
        }
    }
})

// get the login page
router.get('/login', (req, res) => {
    // redirect to main page if already logged in
    if (req.session.authorized) {
        return res.redirect('/sqli');
    }

    res.sendFile(path.join(__dirname, '../../client/pages/sqli/login.html'));
});

// post login data
router.post('/login', (req, res) => {
    let security = req.cookies.security;
    // if security cookie was tampered with/doesn't exist, change it to low
    if (!["Low", "Medium", "High"].includes(security)) {
        res.cookie('security', 'Low', { httpOnly: false });
    }

    console.log("LOgging in!!")
    console.log(req.body);
    let username = req.body.username;
    let password = req.body.password;

    console.log(req.session);

    if (username && password) {
        // Low difficulty, inject user input directly into query and return informative error messages.
        if (security === 'Low') {
            // check for username
            db.get(`SELECT * FROM users WHERE username = '${username}'`, (err, row) => {
                if (err) return res.status(401).send(err.message);

                if (!row) {
                    res.status(401).send('No account with that username.');
                }
                else {
                    // check for password
                    db.get(`SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`, (err, row) => {
                        if (err) return res.status(401).send(err.message);

                        if (!row) {
                            res.status(401).send('Incorrect password.');
                        }
                        else {
                            console.log(row);
                            req.session.user = {username: row.username};
                            req.session.authorized = true;
                            res.redirect('/sqli');
                        }
                    });
                }
            });
        }
        
        // medium difficulty, allow list
        else if (security == 'Medium') {
            // if no illegal characters, login user
            if (allow_list_regex.test(username) && allow_list_regex.test(password)) {
                db.get(`SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`, (err, row) => {
                    if (err) return res.status(401).send(err.message);

                    if (!row) {
                        res.status(401).send('Incorrect username or password.');
                    }
                    else {
                        req.session.user = {username};
                        req.session.authorized = true;
                        res.redirect('/sqli');
                    }
                });
            }
            else {
                res.status(401).send("Username and password can only contain valid characters: " + allow_list);
            }
        }

        // High difficulty, Use prepared statements, deny list and ambiguous error messages.
        else {
            // if no illegal characters, login user
            if (allow_list_regex.test(username) && allow_list_regex.test(password)) {
                db.get(`SELECT * FROM users WHERE username = ? AND password = ?`, [username, password], (err, row) => {
                    if (err) return res.status(401).send(err.message);

                    if (!row) {
                        res.status(401).send('Incorrect username or password.');
                    }
                    else {
                        req.session.user = {username};
                        req.session.authorized = true;
                        res.redirect('/sqli');
                    }
                });
            }
            else {
                res.status(401).send('Incorrect username or password');
            }
        }
    }
});

// get the registration page
router.get('/register', (req, res) => {
    // redirect to main page if already logged in
    if (req.session.authorized) {
        return res.redirect('/sqli');
    }

    res.sendFile(path.join(__dirname, '../../client/pages/sqli/register.html'));
});

// post registration data
router.post('/register', (req, res) => {
    let security = req.cookies.security;

    // if already logged in, redirect to main page 
    if (req.session.authorized) {
        res.redirect('/sqli');
    }

    let username = req.body.username;
    let password = req.body.password;

    // no protections, vulnerable to sqli through stored xss
    if (security === 'Low') {
        let user_id = uuid.v4();
        db.run(`INSERT INTO users(id, username, password) VALUES ('${user_id}', '${username}', '${password}')`, (err) => {
            if (err) return res.status(401).send(err.message);
            
            // redirect to login page on successful registration
            res.redirect('/sqli/login');
            console.log(`registered ${user_id}, ${username}, ${password}`);
        });
    }
    // some protections, allow list
    else if (security === 'Medium') {
        let user_id = uuid.v4();
        
        // if no illegal characters, register user
        if (allow_list_regex.test(username) && allow_list_regex.test(password)) {
            db.run(`INSERT INTO users(id, username, password) VALUES ('${user_id}', '${username}', '${password}')`, (err) => {
                if (err) return res.status(401).send(err.message);

                // redirect to login page on successful registration
                res.redirect('/sqli/login');
                console.log(`registered ${user_id}, ${username}, ${password}`);
            })
        }
        else {
            res.status(401).send("Username and password can only contain valid characters: " + allow_list);
        }
    }

    // else high difficulty, deny list and prepared statements
    else {
        let user_id = uuid.v4();

        // if no illegal characters, register user
        if (allow_list_regex.test(username) && allow_list_regex.test(password)) {
            db.run(`INSERT INTO users(id, username, password) VALUES (?, ?, ?)`, [user_id, username, password], (err) => {
                if (err) return res.status(401).send(err.message);

                // redirect to login page on successful registration
                res.redirect('/sqli/login');
                console.log(`registered ${user_id}, ${username}, ${password}`);
            })
        }
        else {
            res.status(401).send("Username and password can only contain valid characters: " + allow_list);
        }
    }
});

router.get('/profile', (req, res) => {
    // redirect to main page if not logged in
    if (!req.session.authorized) {
        return res.redirect('/sqli');
    }
    
    res.sendFile(path.join(__dirname, '../../client/pages/sqli/profile.html'));
});

// get posts for currently logged in user's profile
router.get('/profile/posts', (req, res) => {
    const username = req.session.user.username; // logged in user
    console.log(username);

    db.all(`SELECT * FROM posts WHERE username = ?`, [username], (err, rows) => {
        if (err) return console.error(err.message);

        // username added since there may be no posts to pull it from for the profile header.
        rows.unshift({username: username});
        res.send(rows);
        console.log(rows);
    });
});

router.post('/profile/delete-post', (req, res) => {
    const security = req.cookies.security;
    // only delete posts from currently logged in user
    const username = req.session.user.username;
    const post_id = req.body.post_id;

    console.log(`deleting post: ${post_id} by ${username}`);
    
    if (security === 'Low') {
        db.run(`DELETE FROM posts WHERE username = '${username}' AND id = ${post_id}`, (err) => {
            if (err) return res.send(err.message);

            if (!this.changes) {
                res.send(`Could not find post ${post_id}`);
            }
            else {
                res.send(`Deleted post ${post_id} by user ${username}`);
            }
        });
    }

    // if medium, allow list for tampered post_id
    else if (security === 'Medium') {
        if (allow_list_regex.test(post_id)) {
            db.run(`DELETE FROM posts WHERE username = '${username}' AND id = ${post_id}`, (err) => {
                if (err) return res.send(err.message);
                
                if (!this.changes) {
                    res.send(`Could not find post ${post_id}`);
                }
                else {
                    res.send(`Deleted post ${post_id} by user ${username}`);
                }
            });
        }
        else {
            res.send(`Could not find post ${post_id}`);
        }
    }

    // else hard, allow list and prepared statement
    else {
        if (allow_list_regex.test(post_id)) {
            db.run(`DELETE FROM posts WHERE username = ? AND id = ?`, [username, post_id], (err) => {
                if (err) return console.error(err);
                console.log('changes: ' + this.changes);
                if (!this.changes) {
                    res.send(`Could not find post ${post_id}`);
                }
                else {
                    res.send(`Deleted post ${post_id} by user ${username}`);
                }
            });
        }
        else {
            res.send(`Could not find post ${post_id}`);
        }
    }
})

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/sqli');
});

module.exports = router;