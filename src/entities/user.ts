import {getModelForClass, prop} from '@typegoose/typegoose'
import {ObjectType,Field,ID} from 'type-graphql'

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

    @prop()
    tokenVersion: number
}

export const Usermodel = getModelForClass(User) 