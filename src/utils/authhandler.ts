import { Usermodel } from "../entities/user"

export const isAuthenticated = async (userId: string,tokenVersion?:number) =>{

    const user = await Usermodel.findById(userId)
            
    if(!user) throw new Error('User not found')

    if(user.tokenVersion !== tokenVersion) throw new Error('Not Authicated')

    return user
}