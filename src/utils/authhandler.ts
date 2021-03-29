import { Usermodel } from "../entities/user"
import { AppRequest } from "../types";

export const isAuthenticated = async (req: AppRequest) =>{

    if(!req.userId) throw new Error("Please Login to process");

    const user = await Usermodel.findById(req.userId)
            
    if(!user) throw new Error('User not found')

    if(user.tokenVersion !== req.tokenVersion) throw new Error('Not Authicated')

    return user
}
