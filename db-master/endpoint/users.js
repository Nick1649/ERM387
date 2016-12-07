const models = require('../models/index');
const crypto = require('crypto');
const addPropertiesByType = require('./resources').addPropertiesByType

//algorithm = 'aes-256-ctr',
//password = 'd6F3Efeq';


module.exports = {
    getUsers: getUsers,
    getUserById: getUserById,
    addUser: addUser,
    removeUser: removeUser,
    userLogin: userLogin,
    getUserTypes: getUserTypes,
    updateUser: updateUser
}

function getUserTypes() {
    return models.UserType.findAll({
            attributes: ['typeName'],
            group: ['typeName']
        })
        .then((types) => {
            return {
                status: true,
                body: types.map(type => {
                    return type.typeName
                })
            }
        })
        .catch(function(err) {
            console.log(err)
            return {
                status: false,
                body: null
            }
        })
}

function getUsers() {
    return models.User.findAll({
            include: getUserReservationsInclude()
        }).then(users => {
            var mappedUsers = {};
            if (users) {
                mappedUsers = users.map(user => {
                    var reservations = [];
                    if (user.Reservations) reservations = getReservations(user.Reservations);
                    return {
                        user_id: user.userId,
                        first_name: user.firstName,
                        last_name: user.lastName,
                        email: user.email,
                        phone_number: user.phoneNumber,
                        is_admin: user.isAdmin,
                        type: user.UserType.typeName,
                        reservations: reservations
                    }
                });
                return {
                    status: true,
                    body: mappedUsers
                };
            } else {
                return {
                    status: true,
                    body: []
                }
            }
        })
        .catch(function(err) {
            console.log(err)
            return {
                status: false,
                body: null
            }
        })
}

function getUserById(id) {
    return models.User.findOne({
            where: {
                userId: id
            },
            include: getUserReservationsInclude()
        }).then(user => {
            var mappedUser = {};
            if (user) {
                var reservations = [];
                if (user.Reservations) reservations = getReservations(user.Reservations);
                mappedUser = {
                    first_name: user.firstName,
                    last_name: user.lastName,
                    email: user.email,
                    phone_number: user.phoneNumber,
                    is_admin: user.isAdmin,
                    type: user.UserType.typeName,
                    user_id: user.userId,
                    reservations: reservations
                }
                return {
                    status: true,
                    body: mappedUser
                }
            } else {
                return {
                    status: false,
                    body: null
                }
            }
        })
        .catch(function(err) {
            console.log(err)
            return {
                status: false,
                body: null
            }
        })
}

function getReservations(reservations) {
    var reservationsArr = [];
    for (var i = 0; i < reservations.length; i++) {
        var res = addPropertiesByType(reservations[i].Resource);
        res.reservation_id = reservations[i].reservationId;
        res.start_time = reservations[i].startTime;
        res.end_time = reservations[i].endTime;

        var items = [];
        for (var j = 0; j < reservations[i].ReservationResources.length; j++) {
            items.push(addPropertiesByType(reservations[i].ReservationResources[j].Resource));
        }
        if (items && items.length) res.items = items;
        reservationsArr.push(res);
    }
    return reservationsArr;
}

function addUser(type, user) {
    var userObj = {
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phoneNumber: user.phone,
        isAdmin: user.is_admin,
        passwordHash: crypto.createHash('sha256').update(user.password).digest("hex") || ''
    };

    return models.UserType.findOne({
            attributes: ["typeId"],
            where: {
                typeName: type
            }
        }).then((type) => {
            if (type) userObj.typeId = type.typeId;
            return models.User.create(userObj).then(user => {
                if (user) {
                    return {
                        status: true
                    };
                } else {
                    return {
                        status: false
                    };
                }
            });
        })
        .catch(function(err) {
            return {
                status: false
            };
        })
}

function removeUser(userId) {
    return models.User.destroy({
            where: {
                userId: userId
            },
            limit: 1
        }).then((affectedRows) => {
            if (affectedRows === 1)
                return {
                    status: true
                };
            return {
                status: false
            }
        })
        .catch(function(err) {
            return {
                status: false
            };
        })
}

function userLogin(username, password) {
    return models.User.findOne({
            where: {
                email: username,
            },
            include: [{
                model: models.UserType,
                required: true
            }]
        }).then(user => {
            if (user) {
                if (user.passwordHash == crypto.createHash('sha256').update(password).digest("hex")) {
                    var mappedUser = {
                        is_admin: user.isAdmin,
                        type: user.UserType.typeName,
                        status: true,
                        user_id: user.userId
                    }
                    return mappedUser;
                } else {
                    return {
                        status: false
                    };;
                }
            } else {
                return {
                    status: false
                };
            }
        })
        .catch(function(err) {
            return null;
        })
}


function encrypt(text) {
    var cipher = crypto.createCipher(algorithm, password)
    var crypted = cipher.update(text, 'utf8', 'hex')
    crypted += cipher.final('hex');
    return crypted;
}

function decrypt(text) {
    var decipher = crypto.createDecipher(algorithm, password)
    var dec = decipher.update(text, 'hex', 'utf8')
    dec += decipher.final('utf8');
    return dec;
}

function getUserReservationsInclude() {
    return [{
        model: models.UserType,
        required: true
    }, {
        model: models.Reservation,
        required: false,
        include: [{
            model: models.Resource,
            required: false,
            include: [{
                model: models.Computer,
                required: false
            }, {
                model: models.Projector,
                required: false
            }, {
                model: models.WhiteBoard,
                required: false
            }, {
                model: models.Room,
                required: false
            }]
        }, {
            model: models.ReservationResource,
            required: false,
            include: [{
                model: models.Resource,
                required: false,
                include: [{
                    model: models.Computer,
                    required: false
                }, {
                    model: models.Projector,
                    required: false
                }, {
                    model: models.WhiteBoard,
                    required: false
                }, {
                    model: models.Room,
                    required: false
                }]
            }]
        }]
    }];
}

function updateUser(userId, modifyProperties) {
    return models.User.findById(userId)
        .then(user => {
            if (user) {
                var updatedModel = {};
                for (var property in modifyProperties) {
                    if (modifyProperties.hasOwnProperty(property) && property != "user_id" && property != "is_admin") {
                        if (property == 'user_password') {
                            updatedModel["passwordHash"] = crypto.createHash('sha256').update(modifyProperties[property]).digest("hex");
                        } else if (property == 'phone')
                            updatedModel["phoneNumber"] = modifyProperties[property]
                        else
                            updatedModel[toCamelCase(property)] = modifyProperties[property];
                    }
                }
                return models.User.update(updatedModel, {
                        where: {
                            userId: userId
                        }
                    })
                    .then(updatedRows => {
                        return {
                            status: true
                        };
                    })
            } else {
                return {
                    status: false
                };
            }
        })
        .catch(function(err) {
            console.log(err);
            return {
                status: false
            };
        })
}

function toCamelCase(str) {
    return str.replace(/_([a-z])/g, function(m, w) {
        return w.toUpperCase();
    });
}
