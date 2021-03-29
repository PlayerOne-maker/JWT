import {ApolloServer} from 'apollo-server-express'
import {buildSchema} from 'type-graphql'
import { Usermodel } from './entities/user'
import {AuthResolvers} from './resolvers/authResolvers'
import { AppContext } from './types'
import { createToken, sendToken, varifyToken } from './utils/token'

export default async () => {
    const schema = await buildSchema({
        resolvers: [AuthResolvers],
        emitSchemaFile: {path:'./src/schema.graphql'},
        validate: false
    })
    return new ApolloServer({schema,context: async ({req,res}:AppContext) =>{
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

                    if (Date.now()/1000 - decodeToken.iat > 6 * 60 * 60){
                       const user = await Usermodel.findById(req.userId)
                        if(user){
                            if(user.tokenVersion === req.tokenVersion){
                            user.tokenVersion = user.tokenVersion + 1

                            const updateUser = await user.save()

                                if(updateUser){
                                    const token = createToken(
                                        updateUser.id, 
                                        updateUser.tokenVersion
                                    )

                                    req.tokenVersion = updateUser.tokenVersion

                                    sendToken(res, token)
                                }
                            }
                        }
                    }
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