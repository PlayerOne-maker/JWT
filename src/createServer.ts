import {ApolloServer} from 'apollo-server-express'
import {buildSchema} from 'type-graphql'
import {AuthResolvers} from './resolvers/authResolvers'


export default async () => {
    const schema = await buildSchema({
        resolvers: [AuthResolvers],
        emitSchemaFile: {path:'./src/schema.graphql'},
        validate: false
    })
    return new ApolloServer({schema})
}


