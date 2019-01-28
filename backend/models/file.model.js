const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Files = new Schema({
    user_id: {
        type: String
    },
    form: {
        type: String
    },
    filename: {
        type: String
    },
    path: {
        type: String
    },
    date: {
        type: Number
    }
});

module.exports= mongoose.model('Files',Files);