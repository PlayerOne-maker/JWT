import passport from 'passport'
import { Strategy as FBSTrategy, StrategyOptionWithRequest as FBStrategyWithRequest }
    from 'passport-facebook'
import {Strategy as GoogleStrategy , StrategyOptionsWithRequest as GoogleStrategyWithReq} from 'passport-google-oauth20'
import { AppRequest } from '../types'

const { FACEBOOK_ID, FACEBOOK_SECERT,FACEBOOK_CALLBACK_ROUTE ,Port,GOOGLE_ID,GOOGLE_SECERT,GOOGLE_CALLBACK_ROUTE} = process.env

const FBConfig: FBStrategyWithRequest = {
    clientID: FACEBOOK_ID!,
    clientSecret: FACEBOOK_SECERT!,
    callbackURL: `http://localhost:${Port}${FACEBOOK_CALLBACK_ROUTE}`,
    profileFields:['id' , 'email','displayName','name'],
    passReqToCallback: true
}

export const PasssportFB = () =>
    passport.use(
        new FBSTrategy
            (FBConfig,
                (req, _, __, profile, done) => {
                    try {
                        if (profile) {
                           
                            (req as AppRequest).userProfile = profile
                            done(undefined, profile)
                        }
                    } catch (error) {
                        done(error)
                    }
                })
    )

const GoogleConfig: GoogleStrategyWithReq = {
    clientID: GOOGLE_ID!,
    clientSecret: GOOGLE_SECERT!,
    callbackURL: `http://localhost:${Port}${GOOGLE_CALLBACK_ROUTE}`,
    passReqToCallback: true
}

export const PasssportGoogle = () =>
    passport.use(
        new GoogleStrategy
            (GoogleConfig,
                (req, _, __, profile, done) => {
                    try {
                        if (profile) {
                           
                            (req as AppRequest).userProfile = profile
                            done(undefined, profile)
                        }
                    } catch (error) {
                        done(error)
                    }
                })
    )