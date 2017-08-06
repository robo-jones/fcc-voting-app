'use strict';

const pollInterfaceFactory = (PollModel) => {
    
    const createPoll = (pollDocument) => {
        const formattedDocument = {
            creator: pollDocument.creator,
            title: pollDocument.title,
            options: pollDocument.options.map((option) => ({ name: option, votes: 0 }))
        };
        const poll = new PollModel(formattedDocument);
        return poll.save();
    };
    
    const findPoll = (id) => {
        return new Promise((resolve, reject) => {
            PollModel.findById(id, (err, poll) => {
                if (err) {
                    reject(err);
                } else {
                    if (poll) {
                        resolve(poll);
                    } else {
                        reject('poll not found');
                    }
                }
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
    
    const findPollsByUser= (creatorId) => {
        return new Promise((resolve, reject) => {
            PollModel.find({ creator: creatorId }, (err, polls) => {
                if(err) {
                    reject(err);
                } else {
                    if (polls.length > 0) {
                        resolve(polls);
                    } else {
                        reject('no polls found');
                    }
                }
            });
        });
    };
    
    return {
        createPoll,
        findPoll,
        deletePoll,
        findPollsByUser
    };
};

module.exports = pollInterfaceFactory;