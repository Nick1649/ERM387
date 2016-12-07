module.exports = function(app, router, db, jwt) {

    router.route('/login')
        .post(function(req, res) {

            // clean input ?
            // for example: check for no spaces (simplified version)
            try {
                db.userLogin(req.body.user_id, req.body.user_password)
                    .then(
                        responseObject => {
                            if (responseObject.status) { // If successful (User exists, and password matches)
                                // create json web token
                                var userToken = jwt.sign({
                                    id: responseObject.id,
                                    timenow: Math.floor(Date.now() / 1000)
                                }, app.get('superSecret'), {
                                    expiresIn: "1 day" // expires in 24 hours
                                });
                                res.cookie('token', userToken)
                                res.json({
                                    status: true,
                                    body: {
                                        message: "Successful Login!",
                                        isAdmin: responseObject.is_admin,
                                        userId: responseObject.user_id
                                    } // ***************************************
                                });

                            } else { // Username & password are invalid
                                res.json({
                                    status: false,
                                    body: {
                                        error: "Failure to Authenticate"
                                    }
                                })
                            }
                        });
            } catch (e) {
                console.log(e);
                res.json({
                        status: false,
                        body: {
                            error: "Request Failure"
                        }
                    }) // all fails
            }
        });

}
