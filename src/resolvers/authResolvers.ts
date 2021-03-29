import { Resolver, Query, Mutation, Arg, Ctx, ObjectType, Field } from 'type-graphql'
import { User, Usermodel } from '../entities/user';
import { validPassword, varlidateEmail, varlidateUsername } from '../utils/varlidate';
import bcrypt from 'bcryptjs'
import {config} from 'dotenv'
config()

import { createToken, sendToken } from '../utils/token';
import { AppContext, Roleoptions } from '../types';
import { isAuthenticated } from '../utils/authhandler';

import {randomBytes} from 'crypto'
import sendgrid,{MailDataRequired} from '@sendgrid/mail'

sendgrid.setApiKey(process.env.SENDGRID_KEY!);

@ObjectType()
export class ResponseMessage {
    @Field()
    message:String
}

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
            // const user = await Usermodel.findById(userId)
            const user = await isAuthenticated(req)
            // if(!user) throw new Error('User not found')

            // if(!user) throw new Error('Not Authi')
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

            const newUser = await Usermodel.create<Pick<User,'username'| 'email'| 'password'>>({
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

    @Mutation(() => ResponseMessage ,{nullable:true})
    async sighOut(
        @Ctx() { req,res }: AppContext
    ):Promise<ResponseMessage | null>{
        try {

            const user = await Usermodel.findById(req.userId)

            if(!user) return null

            user.tokenVersion = user.tokenVersion + 1

            await user.save()

            res.clearCookie(process.env.COOKIE_NAME!)

            return {message: "Logout success" }

        } catch (error) {

            throw error

        }
    }

    @Mutation(() => ResponseMessage ,{nullable:true})
    async requestResetPassword(
        @Arg('email') email: string
    ):Promise<ResponseMessage | null>{
        try {

            if(!email) throw new Error('กรูณาใส่ Email')

            const user = await Usermodel.findOne({email})

            if(!user) throw new Error('ไม่พบ Email')

            const resetpasswordtoken = randomBytes(16).toString('hex')

            const resetpasswordtokenExpiry = Date.now() + 1000*60*30 //วินาที * 1 นาที * 30 นาที

            const updateUser = await Usermodel.findOneAndUpdate({email} ,
                {resetpasswordtoken,resetpasswordtokenExpiry} ,
                {new:true})

            if(!updateUser) throw new Error('sorry ,cannot Process ')
            
            const message: MailDataRequired = {
                from: 'oofza93@gmail.com',
                to: email,
                subject: 'Reset Password From HR-Sinotrans',
                html:`
                <div>
                    <p>Please click below link to reset password </p>
                    <a href='http://localhost:5000/?resetToken=${resetpasswordtoken}' target='blank'>Click here</a>
                </div>
                `
            }

            const res = await sendgrid.send(message)

            if(!res || res[0]?.statusCode !== 202) throw new Error("Sorry We Can't Send");

            return {message: "Please check your email", }

        } catch (error) {

            throw error

        }
    }

    @Mutation(() => ResponseMessage ,{nullable:true})
    async resetPassword(
        @Arg('password') password: string,
        @Arg('token') token: string
    ):Promise<ResponseMessage | null>{
        try {
            if(!password) throw new Error('กรูณาใส่ Password')

            if(!token) throw new Error("Can't process");
            
            const user = await Usermodel.findOne({resetpasswordtoken:token})

            if(!user) throw new Error("Can't process")

            if(!user.resetpasswordtokenExpiry) throw new Error("Can't process");

            const isTokenValid = Date.now() < user.resetpasswordtokenExpiry

            if(!isTokenValid) throw new Error("Token is Expiry");
            
            const newpassword = await bcrypt.hash(password, 10)

            const updateUser = await Usermodel.findOneAndUpdate({email: user.email} ,
                {password : newpassword
                ,resetpasswordtokenExpiry:undefined,
                resetpasswordtoken:undefined} ,
                {new:true})

            if(!updateUser) throw new Error('sorry ,cannot Process ')

            return {message: "Succesfully", }

        } catch (error) {

            throw error

        }
    }

    @Mutation(() => User,{nullable: true})
    async updateRoles(
        @Arg('newRoles', () => [String])newRoles: Roleoptions[],
        @Arg('userId') userId: string,
        @Ctx(){req} : AppContext
    ):Promise<User | null>{
        try {

            const admin = await isAuthenticated(req)

            const SuperAdmin = admin.roles.includes(Roleoptions.superadmin)

            if(!SuperAdmin) throw new Error("You don't have permission!!!");

            const user = await Usermodel.findById(userId)

            if(!user) throw new Error("User not found!!!");
            
            user.roles = newRoles

            await user.save()

            return user

        } catch (error) {
            throw new Error("can't process");
            
        }
    }

    @Mutation(() => ResponseMessage,{nullable: true})
    async deleteUser(
        @Arg('userId') userId: string,
        @Ctx(){req} : AppContext
    ):Promise<ResponseMessage | null>{
        try {
            

            const admin = await isAuthenticated(req)

            const SuperAdmin = admin.roles.includes(Roleoptions.superadmin)

            if(!SuperAdmin) throw new Error("You don't have permission!!!");

            const user = await Usermodel.findByIdAndDelete(userId)

            if(!user) throw new Error("User not found!!!");

            return {message: `User ${user.username} has been remove!!!`}

        } catch (error) {
            throw new Error("can't process");
            
        }
    }
}