'use strict';

const mongoose = require('../../config/mongoose.js');

const Schema = mongoose.Schema;

const pollSchema = new Schema({
    title: {
        type: String,
        required: true
        
    },
    creator: {
        type: Schema.Types.ObjectId,
        required: true
        
    },
    options: {
        type: [{
            name: {
                type: String,
                required: true
            },
            votes: {
                type: Number,
                required: true,
                min: 0
            }
        }],
        required: true
    }
});

pollSchema.path('options').validate(function(options) {
    if(options.length < 2) {
        return false;
    } else {
        return true;
    }
}, 'Must have at least two options');

pollSchema.path('options').schema.path('votes').validate(function(votes) {
    return (votes % 1 === 0);
}, 'votes must me an integer');

module.exports = mongoose.model('poll', pollSchema);