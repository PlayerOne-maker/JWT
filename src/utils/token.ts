import { Response } from 'express'
import jwt from 'jsonwebtoken'

export const createToken = (userId: string,tokenVersion:number) => jwt.sign({userId,tokenVersion},
    process.env.COOKIE_SECERT!,{expiresIn: '7d'}) 

export const sendToken = (res:Response,token:string) => res.cookie(process.env.COOKIE_NAME!,token,{httpOnly:true})

export const varifyToken = (token:string) => jwt.verify(token,process.env.COOKIE_SECERT!)