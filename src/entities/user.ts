import {getModelForClass, prop} from '@typegoose/typegoose'
import {ObjectType,Field,ID} from 'type-graphql'
import { Roleoptions } from '../types'

@ObjectType({description: 'UserModel'})
export class User{
    @Field(() => ID)
    id:string

    @Field()
    @prop({required: true,trim:true})
    username:string

    @Field()
    @prop({required: true,trim:true,unique:true})
    email:string

    @Field()
    @prop({required: true})
    password:string

    @prop({default: 0})
    tokenVersion: number

    @prop()
    resetpasswordtoken?: string

    @prop()
    resetpasswordtokenExpiry?: number //มีเคลื่อนหมาย ? เพราะเป็น optional

    @prop()
    facebookId? : string

    @prop()
    googleId? : string

    @Field(() =>[String])
    @prop({
        type: String,
        enum: Roleoptions,
        default: [Roleoptions.client]
    })
    roles:Roleoptions[]

    @Field()
    @prop({default: () => Date.now() + 60*60*1000*7})
    createdAt: Date
}

export const Usermodel = getModelForClass(User)