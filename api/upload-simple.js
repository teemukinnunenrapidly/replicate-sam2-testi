module.exports = function handler(req, res) {
    res.status(200).json({
        success: true,
        message: 'Upload simple endpoint working!',
        method: req.method,
        url: req.url
    });
}
