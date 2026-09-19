import jwt from 'jsonwebtoken'

const verifyToken = (req, res, next) => {
    // Cookies that have not been signed
    console.log('Cookies: ', req.cookies)
    
    // Cookies that have been signed
    console.log('Signed Cookies: ', req.signedCookies)

    // check in request header for jwt token
    // verify if jwt token is valid
    if(Object.hasOwn(req.cookies, 'jwt')){
        try {
            const valid = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET_KEY)
    
            if(valid){
                console.log("Successful token verification")
                return next()
            }
            
        } catch (error) {
            console.log(error)
        }
    }
    
    return res.status(401).json("Invalid token.")
}

export {
    verifyToken,
}