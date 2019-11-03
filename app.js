const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const authRouter = require("./auth/auth")

const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy
const session = require("express-session")
const flash = require("connect-flash")

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.set("view engine", "ejs")
app.use(session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())

app.use(express.static("./public"))

app.use("/auth", authRouter)

app.listen(3000, () => {
    console.log("SERVER START! On 3000 port.")
})