var mongoose = require('mongoose');

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

module.exports = mongoose.model('User', new Schema({ 
    email : String, 
    password : String    
}));

