class ResponseUtils{
    static success = (res,message = undefined ,data = undefined) => {
        res.status(200).json({
            success:true,
            message,
            data
        });
    }

    static unauthorized = (res,message = undefined) => {
        res.status(401).json({
            success:false,
            message
        });
    }

    static serverError = (res) => {
        res.status(500).json({
            success:false,
            message:'Internal Server Error'
        });
    }
}

module.exports = ResponseUtils;