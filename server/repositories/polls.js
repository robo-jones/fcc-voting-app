'use strict';

const pollInterfaceFactory = (PollModel) => {
    
    const createPoll = (pollDocument) => {
        const formattedDocument = {
            creator: pollDocument.creator,
            title: pollDocument.title,
            options: pollDocument.options.map((option) => ({ name: option, votes: 0 })),
            alreadyVoted: []
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
    
    const findAllPolls = () => {
        return new Promise((resolve, reject) => {
            PollModel.find({}, (err, polls) => {
                if (err) {
                    reject(err);
                }
                resolve(polls);
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
    
    const findPollsByUser = (creatorId) => {
        return new Promise((resolve, reject) => {
            PollModel.find({ creator: creatorId }, (err, polls) => {
                if(err) {
                    reject(err);
                } else {
                    resolve(polls);
                }
            });
        });
    };
    
    const vote = (id, option, voter) => {
        return new Promise((resolve, reject) => {
            PollModel.findById(id, (err, poll) => {
                if (err) {
                    reject(err);
                } else {
                    if (poll) {
                        if (poll.alreadyVoted.indexOf(voter) !== -1) {
                            reject('user has already voted');
                        } else {
                            poll.options[option].votes += 1;
                            poll.alreadyVoted.push(voter);
                            poll.save();
                            resolve(poll.options[option].name);
                        }
                    } else {
                        reject('poll not found');
                    }
                    
                }
            });
        });
    };
    
    const addOption = (id, option, requestingUserId) => {
        return new Promise((resolve, reject) => {
            PollModel.findById(id, async (err, poll) => {
                if (err) { reject(err); }
                if (poll) {
                    if(poll.creator !== requestingUserId) { reject('not authorized'); }
                    const newOption = {
                        name: option,
                        votes: 0
                    };
                    poll.options.push(newOption);
                    try {
                        await poll.save();
                        resolve(poll);
                    } catch (error) {
                        reject(error);
                    }
                } else {
                    reject('poll not found');
                }
                
            });
        });
    };
    
    return {
        createPoll,
        findPoll,
        findAllPolls,
        deletePoll,
        findPollsByUser,
        vote,
        addOption
    };
};

module.exports = pollInterfaceFactory;