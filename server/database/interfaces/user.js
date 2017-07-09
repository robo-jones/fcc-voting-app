'use strict';

const UserInterfaceFactory = function(UserModel) {
    
    const createUser = async function(userDocument) {
        const user = new UserModel(userDocument);
        return await user.save();
    };
    
    const findUser = function(userId) {
        return new Promise(function(resolve, reject) {
            UserModel.findOne({ _id: userId }, function(error, results) {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
    };
    
    return {
        createUser,
        findUser
    };
};

module.exports = UserInterfaceFactory;