import express from 'express'
import createServer from './createServer'
import { config } from 'dotenv'
config()
import mongoose from 'mongoose'
import passport from 'passport'
import cookieParser from 'cookie-parser'
import { PasssportFB , PasssportGoogle } from './passsport'
import { FBAuthenticate , GoogleAuthenticate } from './passsport/socialmediaauth'

const { DB_Username, GOOGLE_CALLBACK_ROUTE,DB_Password, DB_Name, Port, DB_ENDPOINT ,FRONTEND_URI,FACEBOOK_CALLBACK_ROUTE} = process.env

PasssportFB()
PasssportGoogle()

const startServer = async () => {

    //connect to database
    await mongoose.connect(`mongodb+srv://${DB_Username}:${DB_Password}@${DB_ENDPOINT}/${DB_Name}?
    retryWrites=true&w=majority`, {
        useCreateIndex: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    })

    const app = express()
    app.use(cookieParser())

    // Facebook Login Route
    app.get('/auth/facebook', passport.authenticate('facebook'))

    app.get(FACEBOOK_CALLBACK_ROUTE!, passport.authenticate('facebook', {
        session: false,
        failureRedirect: FRONTEND_URI,
        scope: ['profile', 'email']
    }), 
    FBAuthenticate
    )

    // Google Login Route
    app.get('/auth/google', passport.authenticate('google',{scope: ['profile', 'email']}))

    app.get(GOOGLE_CALLBACK_ROUTE!, passport.authenticate('google', {
        session: false,
        failureRedirect: FRONTEND_URI,
    }), 
    GoogleAuthenticate
    )

    const server = await createServer()

    server.applyMiddleware({ 
        app,
        cors:{origin:FRONTEND_URI, credentials: true}
    })

    app.listen({ port: Port }, () => console.log(`Start Server at Port ${Port} http://localhost:5000${server.graphqlPath}`))
}

//om2IfMH7F39RSPYA

startServer()