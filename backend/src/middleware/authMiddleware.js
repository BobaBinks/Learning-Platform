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
            const decodedToken = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET_KEY)
    
            console.log("Successful token verification")
            req.decoded = decodedToken
            return next()
            
        } catch (error) {
            console.log(error)
        }
    }
    
    return res.status(401).json("Invalid token.")
}

const authMiddleware = {
    verifyToken,
}

export default authMiddleware