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
    
    const deletePoll = (id) => {
        return new Promise ((resolve, reject) => {
            PollModel.findByIdAndRemove(id, (err, deletedPoll) => {
                if(err) {
                    reject(err);
                }
                resolve(deletedPoll);
            });
        });
    };
    
    return {
        createPoll,
        findPoll,
        deletePoll
    };
};

module.exports = pollInterfaceFactory;