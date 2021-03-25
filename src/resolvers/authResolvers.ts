import {Resolver,Query,Mutation,Arg ,Ctx} from 'type-graphql'
import { User ,Usermodel} from '../entities/user';
import { validPassword, varlidateEmail, varlidateUsername } from '../utils/varlidate';
import bcrypt from 'bcryptjs'

import { createToken, sendToken } from '../utils/token';
import { AppContext } from '../types';

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
    async sighUp(
        @Arg('username') username:string,
        @Arg('email') email:string ,
        @Arg('password') password:string,
        @Ctx() {res}: AppContext
        )
        {
        try {
            
            if(!username) throw new Error('Username is required.')
        
            const isusernameVarilid = varlidateUsername(username)

            if(!isusernameVarilid) throw new Error('Username must be between 3 - 60.')

            if(!email) throw new Error('Email is required.')

            const isemailVarilid = varlidateEmail(email)

            if(!isemailVarilid) throw new Error('Email is not inValid.')

            if(!password) throw new Error('Password is required.')

            const isPassword = validPassword(password)

            if(!isPassword) throw new Error('Password must be between 8 - 50.')

            const hashPassword = await bcrypt.hash(password, 10)

            const newUser = await Usermodel.create({
                username,
                email,
                password: hashPassword,
                
            })

            await newUser.save()

            const token = createToken(newUser.id,newUser.tokenVersion)

            sendToken(res,token)

            return newUser
            
        } catch (error) {

            throw error

        }
    }
}