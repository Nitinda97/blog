
const jwt = require("jsonwebtoken");
exports.isAuthMiddleware = (req,res,next)=>{

    const auth = req.get('Authorization');

    if(!auth)
    {
        const err = new Error("User not Authenticated");
            err.statusCode = 401;
            next(err);
    }

    const token = auth.split(' ')[1];

    try{

        const result = jwt.verify(token,"secret");

            if(!result)
            {
                const err = new Error("User not Authenticated");
                err.statusCode = 401;
                next(err);
            }
    
            req.userId = result.userId;
            next();

    }
    catch(err){

        err.statusCode = 500;
        next(err);
    }
}
