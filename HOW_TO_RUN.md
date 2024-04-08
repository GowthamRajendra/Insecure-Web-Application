# How To Run App

## Prerequisites
- NodeJS
- Make (Optional)

## Instructions
1. Navigate to the server folder (Ex. `cd app/server`)
2. Running App
    * With Makefile: `make setup-and-run` (this will install dependencies, setup the db and then run the server).
    * Without Makefile (Windows user?): 
        1. Run `npm install`(install dependencies)
        2. Run `node sqli-setupdb.js` (setup db)
        3. Run `node app.js`(run server/app)
3. If the db for the SQLi bug breaks, run `make setupdb` or `node sqli-setupdb.js` to reset/recreate the db (hopefully this fixes it). If it says "unable to open database file", simply try the command again.