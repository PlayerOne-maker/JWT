import {Response,Request} from 'express'
import {Profile as FBProfile} from 'passport-facebook'
import {Profile as GoogleProfile} from 'passport-google-oauth20'

export enum Roleoptions{
    client = 'Client',
    itemeditor = 'Itemeditor',
    admin = 'Admin',
    superadmin = "SuperAdmin"
}

export interface AppRequest extends Request{
    userId?: string
    tokenVersion?:number
    userProfile?:FBProfile | GoogleProfile
}

export interface AppContext {
    req:AppRequest,
    res:Response
}