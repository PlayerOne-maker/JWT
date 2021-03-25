export const varlidateUsername = (username: string) => {
    const fmtUsername = username.trim()

    return fmtUsername.length >= 5 && fmtUsername.length <= 60  
}

export const varlidateEmail = (email: string) => {
    const fmtEmail = email.trim().toLowerCase()

    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    return emailRegex.test(fmtEmail)

}

export const validPassword= (password: string) =>{
    return  password.length >= 6 && password.length <=50
}