# Insecure Web Application
## Creators
- [Gowtham Rajendra](https://github.com/GowthamRajendra)
- [Ivan Wang](https://github.com/Ivan-WangJianBin)
- [Ravi Pogaku](https://github.com/Ravi-Pogaku)

## How To Run App

### Prerequisites
- NodeJS
- Make (Optional)
- BurpSuite (for certain exploits)

### Instructions
1. Navigate to the server folder (Ex. `cd app/server`)
2. Running App
    * With Makefile: `make setup-and-run` (this will install dependencies, setup the database and then run the server).
    * Without Makefile: 
        1. Run `npm install` (install dependencies)
        2. Run `node sqli-setupdb.js` (setup database)
        3. Run `node app.js` (run server/app)
3. If the database for the SQLi bug breaks, run `make setupdb` or `node sqli-setupdb.js` to reset/recreate it (hopefully this fixes it). If it says "unable to open database file", simply try the command again.

## Walkthroughs
- [SQL Injection](https://youtu.be/kp1pV_Tw4mU)
- [XXE Injection](https://youtu.be/gjdQGbH5Rsk)
- [Clickjacking](https://github.com/GowthamRajendra/Insecure-Web-Application/blob/main/Clickjacking/Clickjacking.md)
