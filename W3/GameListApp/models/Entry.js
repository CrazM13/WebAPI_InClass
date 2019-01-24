const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var EntrySchema = new Schema({

    title:{
        type: String,
        required: true
    },
    genre: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }

});

mongoose.model('Entries', EntrySchema);