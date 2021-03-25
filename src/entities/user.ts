import {getModelForClass, prop,arrayProp} from '@typegoose/typegoose'
import {ObjectType,Field,ID} from 'type-graphql'
import { Roleoptions } from '../types'

@ObjectType({description: 'UserModel'})
export class User{
    @Field(() => ID)
    id:String

    @Field()
    @prop({required: true,trim:true})
    username:String

    @Field()
    @prop({required: true,trim:true,unique:true})
    email:String

    @Field()
    @prop({required: true})
    password:String

    @prop({default: 0})
    tokenVersion: number

    @prop()
    resetpasswordtoken?: String

    @prop()
    resetpasswordtokenExpiry?: number //มีเคลื่อนหมาย ? เพราะเป็น optional

    @prop()
    facebookId? : string

    @prop()
    googleId? : string

    @Field(() =>[String])
    @arrayProp({
        items: String,
        enum: Roleoptions,
        default: [Roleoptions.client]
    })
    roles:Roleoptions[]

    @Field()
    @prop({default: () => Date.now() + 60*60*1000*7})
    createdAt: Date
}

export const Usermodel = getModelForClass(User)