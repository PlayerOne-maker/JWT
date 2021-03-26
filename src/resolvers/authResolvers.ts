import { Resolver, Query, Mutation, Arg, Ctx } from 'type-graphql'
import { User, Usermodel } from '../entities/user';
import { validPassword, varlidateEmail, varlidateUsername } from '../utils/varlidate';
import bcrypt from 'bcryptjs'

import { createToken, sendToken } from '../utils/token';
import { AppContext } from '../types';
import { isAuthenticated } from '../utils/authhandler';

@Resolver()

export class AuthResolvers {
    @Query(() => [User], { nullable: 'items' }) // = [User]!
    async users(): Promise<User[] | null> {
        try {
            return Usermodel.find()
        } catch (error) {
            throw error
        }
    }

    @Query(() => User, { nullable: true }) // = [User!]!
    async me(
        @Ctx(){req} : AppContext)
    : Promise<User | null> {
        try {

            if(!req.userId) throw new Error('Please Login')
            // const user = await Usermodel.findById(userId)
            const user = await isAuthenticated(req.userId,req.tokenVersion)
            // if(!user) throw new Error('User not found')

            return user
            
        } catch (error) {
            throw error
        }
    }

    @Mutation(() => User,{nullable:true})
    async sighUp(
        @Arg('username') username: string,
        @Arg('email') email: string,
        @Arg('password') password: string,
        @Ctx() { res }: AppContext
    ) : Promise<User | null> {
        try {

            if (!username) throw new Error('Username is required.')
            if (!email) throw new Error('Email is required.')
            if (!password) throw new Error('Password is required.')

            const user =  await Usermodel.findOne({email})

            if(user) throw new Error('Email already in use')

            const isusernameVarilid = varlidateUsername(username)

            if (!isusernameVarilid) throw new Error('Username must be between 3 - 60.')

            const isemailVarilid = varlidateEmail(email)

            if (!isemailVarilid) throw new Error('Email is not inValid.')

            const isPassword = validPassword(password)

            if (!isPassword) throw new Error('Password must be between 8 - 50.')

            const hashPassword = await bcrypt.hash(password, 10)

            const newUser = await Usermodel.create({
                username,
                email,
                password: hashPassword,

            })

            await newUser.save()

            const token = createToken(newUser.id, newUser.tokenVersion)

            sendToken(res, token)

            return newUser

        } catch (error) {

            throw error

        }
    }

    @Mutation(() => User,{nullable:true})
    async sighIn(
        @Arg('email') email: string,
    @Arg('password') password: string,
    @Ctx() { res }: AppContext
    ){
        try {

            if (!email) throw new Error('Email is required.')
            if (!password) throw new Error('Password is required.')

            const user = await Usermodel.findOne({ email })

            if(!user) throw new Error('User not found')

            const isPasswordValid = await bcrypt.compare(password, user.password)

            if(!isPasswordValid) throw new Error('User not found')

            const token = createToken(user.id, user.tokenVersion)

            sendToken(res, token)

            return user

        } catch (error) {

            throw error

        }
    }
}