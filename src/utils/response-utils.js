class ResponseUtils{
    static successMessage = (res,message) => {
        res.status(200).json({
            success:true,message
        });
    }
}

module.exports = ResponseUtils;