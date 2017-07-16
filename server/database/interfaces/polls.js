'use strict';

const pollInterfaceFactory = (PollModel) => {
    const createPoll = async (pollDocument) => {
        const poll = new PollModel(pollDocument);
        return poll.save();
    };
    
    const findPoll = (id) => {
        return new Promise((resolve, reject) => {
            PollModel.findById(id, (err, poll) => {
                if (err) {
                    reject(err);
                }
                resolve(poll);
            });
        });
        
    };
    
    return {
        createPoll,
        findPoll
    };
};

module.exports = pollInterfaceFactory;