const mongoose = require('mongoose');


const bookSchema = new mongoose.Schema({
	title:{
		type:String,
		required:true
	},
	author:
	{
		type:String,
		required:true
	},
	category:{
		type:String,
	},
	description:{
		type:String,
		required:true
	},
	price:{
		type: Number,
		required:true
	},
	sales:{
		type:Number,
		default:0
	}
})
const Book = mongoose.model('Book',bookSchema);

module.exports = Book;