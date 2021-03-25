import { Response } from 'express'
import jwt from 'jsonwebtoken'

export const createToken = (userId: string,tokenVersion:number) => jwt.sign({userId,tokenVersion},
    "Aaboltib",{expiresIn: '7d'}) 

export const sendToken = (res:Response,token:string) => res.cookie('jwt',token,{httpOnly:true})