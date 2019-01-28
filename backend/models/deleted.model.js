const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Deleted = new Schema({
    user_id: {
        type: String
    },
    filename: {
        type: String
    },
    date: {
        type: String
    }
});

module.exports= mongoose.model('Deleted',Deleted);