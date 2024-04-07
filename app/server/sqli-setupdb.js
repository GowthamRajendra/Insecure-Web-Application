const sqlite3 = require('sqlite3').verbose();
const uuid = require('uuid');
const fs = require('fs');

const db_filename = 'sqlidb.db';

// delete old db file
if (fs.existsSync(db_filename)) {
    fs.unlinkSync(db_filename);
    console.log('deleted old .db file');
}

// create new db file
fs.writeFile(db_filename, '', (err) => {
    if (err) return console.log('db_file creation:',err);
    console.log('created new .db file');
})

// connect to db
const db = new sqlite3.Database(db_filename, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      return console.error(err);
    }
});

db.serialize(function() {
    // remove old tables
    db.run(`DROP TABLE IF EXISTS users`, (err) => {
        if (err) return console.log(err);
    });
    db.run(`DROP TABLE IF EXISTS posts`, (err) => {
        if (err) return console.log(err);
    });

    // create tables
    db.run(`CREATE TABLE IF NOT EXISTS users(id UUID PRIMARY KEY, username TEXT NOT NULL UNIQUE, password TEXT NOT NULL)`, (err) => {
        if (err) return console.log(err);
    });
    db.run(`CREATE TABLE IF NOT EXISTS posts(id INTEGER PRIMARY KEY, username TEXT NOT NULL, title TEXT NOT NULL, message TEXT NOT NULL)`, (err) => {
        if (err) return console.log(err);
    });
    
    // create sample accounts
    sql = `INSERT INTO users(id, username, password) VALUES (?, ?, ?)`;
    let sample_users = [["cooladmin", "bbq-bacon-burger!321"], ["big-dave", "IamDAVE987!"]];
    sample_users.forEach(user => {
      let user_uuid = uuid.v4();
      user.unshift(user_uuid); // id is expected as first element
      
      db.run(sql, user, (err) => {
        if (err) {
          console.error(err);
        }
      });
    });
    
    // create sample posts
    let messages = [["cooladmin", "MY FIRST POST!!!", "HI!"], ["cooladmin", "I HATE FISHING", "I'm the admin and I HATE FISHING"], ["cooladmin", "No talking about fishing", "You will be banned if you talk about fishing!"],["big-dave", "I LOVE FISHING!!", "I'm BIG-DAVE and I LOVE FISHINGGGG! YEEHAW!"]];
    messages.forEach(message => db.run(`INSERT INTO posts(username, title, message) VALUES (?,?,?)`, message));
    
    // query the data to make sure everything is setup properly
    db.all(`SELECT * FROM users`, (err, rows) => {
      if (err) {
        return console.error(err);
      }
      console.log('USERS:', rows, '\n\n\n');
    });
    
    db.all(`SELECT * FROM posts`, (err, rows) => {
        if (err) {
          return console.error(err);
        }
        console.log('POSTS:', rows);
    });
});