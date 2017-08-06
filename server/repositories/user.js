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
                    if(results) {
                        resolve(results);
                    } else {
                        reject('user not found');
                    }
                }
            });
        });
    };
    
    const findUserByGithub = (gitHubProfile) => {
        return new Promise(function(resolve, reject) {
            UserModel.findOne({ 'github.id': gitHubProfile.id }, function(error, results) {
                if (error) {
                    reject(error);
                } else {
                    if(results) {
                        resolve(results);
                    } else {
                        reject('user not found');
                    }
                }
            });
        });
    };
    
    return {
        createUser,
        findUser,
        findUserByGithub
    };
};

module.exports = UserInterfaceFactory;