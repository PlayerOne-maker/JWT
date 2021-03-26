import {ApolloServer} from 'apollo-server-express'
import {buildSchema} from 'type-graphql'
import {AuthResolvers} from './resolvers/authResolvers'
import { AppContext } from './types'
import { varifyToken } from './utils/token'



export default async () => {
    const schema = await buildSchema({
        resolvers: [AuthResolvers],
        emitSchemaFile: {path:'./src/schema.graphql'},
        validate: false
    })
    return new ApolloServer({schema,context:({req,res}:AppContext) =>{
        const token = req.cookies[process.env.COOKIE_NAME!]
        
        if(token){
            try {
                //Varify Token
                const decodeToken = varifyToken(token) as {
                userId: string,
                tokenVersion: number,
                iat: number,
                exp: number
                } | null
                if(decodeToken){
                    req.userId = decodeToken.userId
                    req.tokenVersion = decodeToken.tokenVersion
                }

            } catch (error) {
                    req.userId = undefined
                    req.tokenVersion = undefined
            }
        }
        return {req,res}
    }
    })
}