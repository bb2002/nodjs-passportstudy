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
                if(err) res.redirect("/auth/join")
                return done(null, {"email": email, "id": rows.insertId})
            })
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
    let name = "undefined"
    res.render(path.join(__dirname, "../public/welcome.ejs"), {"name": name})
})

router.post("/login", (req, res) => {
    
})

router.post("/join", passport.authenticate("local", {
    successRedirect: "/auth/welcome",
    failureRedirect: "/auth/join",
    failureFlash: true
}))

module.exports = router