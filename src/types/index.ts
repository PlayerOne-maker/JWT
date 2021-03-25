import {Response,Request} from 'express'

export enum Roleoptions{
    client = 'Client',
    itemeditor = 'Itemeditor',
    admin = 'Admin',
    superadmin = "SuperAdmin"
}

export interface AppContext {
    req:Request,
    res:Response
}