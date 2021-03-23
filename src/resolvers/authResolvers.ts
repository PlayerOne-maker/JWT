import {Resolver,Query,Mutation,Arg} from 'type-graphql'
import { User ,Usermodel} from '../entities/user';

@Resolver()

export class AuthResolvers {
    @Query(() => [User] , {nullable : 'items'}) // = [User]!
    async users(): Promise<User[] | null>{
        try {
            return Usermodel.find()
        } catch (error) {
            throw error
        }
    }

    @Mutation(() => User)
    async createUser(
        @Arg('username') username:string,
        @Arg('email') email:string ,
        @Arg('password') password:string) {
        try {
            const newUser = await Usermodel.create({
                username,
                email,
                password
            })

            await newUser.save()

            return newUser
            
        } catch (error) {
            throw error
        }
    }
}