class ResponseUtils{
    static success = (res,message = undefined ,data = undefined) => {
        return res.status(200).json({
            success:true,
            message,
            data
        });
    }

    static badRequest = (res,message = undefined, errors = undefined) =>{
        return res.status(400).json({
            success:false,
            message,errors
        });
    }

    static forbidden = (res,message = undefined) => {
        return res.status(403).json({
            success:false,
            message
        });
    }

    static unauthorized = (res,message = undefined) => {
        return res.status(401).json({
            success:false,
            message
        });
    }

    static serverError = (res) => {
        return res.status(500).json({
            success:false,
            message:'Internal Server Error'
        });
    }
}

module.exports = ResponseUtils;