module.exports = function (app, router, db, models) {

  // /users/:user_type/:user_id'  // not sure we need this

  router.route('/users')
    .get(function(req, res) {
      //return all users
      db.getUsers()
        .then(users => res.json({ status: true, body: users }))
  //     try {
  //       models.sequelize.sync(/*{force:true}*/).then(() => {
  // // DOC: what does aa stand for? Is it a string or an Object? (json {})
  //       });
  //     } catch (e) {
  //       console.log(e);
  //       res.json({ status: false, body: {error: "message"}});
  //     }
    })
    .post(function(req, res) {
      // TODO: Create a new user
      // Check if user creation is from an unregistered user or an admin
      // Assume Admin creation initially, implement registration later
      
      var newUser = req.body.user;
      var user_type = req.body.user_type;
      var email = req.body.email;
      var validator = require('validator'); 
      
      if (!validator.isEmail(email))
      {
         res.json({ status: false, body: "The email provided is an invalid format." });
      }
      else{
       db.addUser(user_type, newUser).then(result => {
       res.json({ status: true, body: "Successfully Created User" });
      });
     }
   });


  router.route('/users/:user_id')
    .get(function(req, res) {
      //return user with req.params.user_type and req.params.user_id *** not sure if needed
      db.getUserById(req.params.user_id)
        .then(user => res.json({ status: true, body: user }))
      // try {
      //   models.sequelize.sync(/*{force:true}*/).then(() => {
      //
      //   });
      // } catch (e) {
      //   console.log(e);
      //   res.json({ status: false, body: {error: "message"}});
      // }
    })
    .post(function(req, res) {
      //TODO This is to modify a user.
      db.updateUser(req.params.user_id, req.body.user).then(result => {
        /*TODO HERE Check if return is true or false*/
        if(result){
          res.json({ status: true, body: "User successfully modified." });
        } else {
          res.json({ status: false, body: "We're sorry, the specified user could not be modified." });
        }
      })
      
     //Delete user from DB with req.params.user_type and req.params.user_id
      /*Assuming that only admins can delete users for now*/
    .delete(function(req, res) {
      db.removeUser(req.params.user_id).then(result => {
      if(user_type=="admin"){

        res.json({ status: true, body: "User successfully deleted." });
      }
      else{
        res.json({ status: false, body: "Unable to delete user." });
      }
      });
      
    })


}
