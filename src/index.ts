import express from 'express'
import createServer from './createServer'
import {config} from 'dotenv'
config()
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'

const {DB_Username,DB_Password,DB_Name,Port,DB_ENDPOINT} = process.env

const startServer = async () => {

    //conent to database
    await mongoose.connect(`mongodb+srv://${DB_Username}:${DB_Password}@${DB_ENDPOINT}/${DB_Name}?
    retryWrites=true&w=majority`,{
        useCreateIndex:true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify:false
    })

    const app = express()
    app.use(cookieParser())
    
    const server = await createServer()

    server.applyMiddleware({app})

    app.listen({port:Port}, () => console.log(`Start Server at Port ${Port} http://localhost:5000${server.graphqlPath}`))
}

//om2IfMH7F39RSPYA

startServer()