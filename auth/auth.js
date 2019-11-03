const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const router = express.Router()
const path = require("path")

const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy

const mysql = require('mysql')
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "ballbot3451",
    database: "passport_server"
})
connection.connect()

passport.serializeUser((user, done) => {
    console.log("passport session save : ", )

    let data;
    if(user.id == null) {
        data = user.name
    } else {
        data = user.id
    }

    done(null, data)
})

passport.deserializeUser((id, done) => {
    console.log("passport session getdata : ", id)
    done(null, id)
})

passport.use("local", new LocalStrategy({
    usernameField: "user_email",
    passwordField: "user_passwd",
    passReqToCallback: true
}, (req, email, password, done) => {
    connection.query("SELECT * FROM user WHERE email = ?", [email], (err, rows) => {
        if(err) return done(err, false)
        if(rows.length) {
            return done(null, false, {message: "Already registed."})
        } else {
            let sql = {
                "name": req.body.user_name,
                "email": email,
                "password": password
            }
        
            connection.query("INSERT INTO user SET ?", sql, (err, rows) => {
                if(err) {
                    return done(err, false, {message: "MySQL Server error."})
                } else {
                    return done(null, {"email": email, "id": rows.insertId})
                }
            })
        }
    })
}))

passport.use("local-login", new LocalStrategy({
    usernameField: "email",
    passwordField: "passwd",
    passReqToCallback: true
}, (req, email, password, done) => {
    console.log("asdfasdfasdfasdf")

    connection.query("SELECT * FROM user WHERE email = ? and password = ?", [email, password], (err, rows) => {
        if(err) {
            return done(err, false, {message: "MySQL Server error."})
        } else {
            if(rows.length == 0) {
                // ID OR PASSWD incorrent
                return done(null, false, {message: "email or password incorrent."})
            } else {
                return done(null, {"email": email, "name": rows[0].name})
            }
        }
    })
}))

router.get("/login", (req, res) => {
    res.render(path.join(__dirname, "../public/login.ejs"))
})

router.get("/join", (req, res) => {
    let errMessage = req.flash("error")
    if(!errMessage) {
        errMessage = ""
    }

    res.render(path.join(__dirname, "../public/join.ejs"), {"message": errMessage})
})

router.get("/welcome", (req, res) => {
    let userId = req.user
    connection.query("SELECT name FROM user WHERE _id = ?", [userId], (err, rows) => {
        if(err) {
            res.send("An error occurred.")
        } else {
            res.render(path.join(__dirname, "../public/welcome.ejs"), {"name": rows[0].name})    
        }
    })
})

router.post("/login", (req, res, next) => {
    passport.authenticate('local-login', (err, user, info) => {
        if(err)     return res.status(500).json(err)
        if(!user)   return res.status(401).json(info.message)
        req.logIn(user, (err) => {
            if(err) return res.status(500).json(err)
            return res.json(user)
        })
    })(req, res, next)
})

router.post("/join", passport.authenticate("local", {
    successRedirect: "/auth/welcome",
    failureRedirect: "/auth/join",
    failureFlash: true
}))

router.get("/logout", (req, res) => {
    req.logout()
    res.redirect("../../")
})

module.exports = router