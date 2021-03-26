import {Response,Request} from 'express'

export enum Roleoptions{
    client = 'Client',
    itemeditor = 'Itemeditor',
    admin = 'Admin',
    superadmin = "SuperAdmin"
}

export interface AppRequest extends Request{
    userId?: string
    tokenVersion?:number
}

export interface AppContext {
    req:AppRequest,
    res:Response
}