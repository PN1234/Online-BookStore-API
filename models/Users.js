const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const userSchema = new mongoose.Schema({
	name:{
		type:String,
		required:true
	},
	age:
	{
		type:Number,
		required:true
	},
	mobile:{
		type:String,
	},
	email:{
		type:String,
		unique:true
	},
	address:{
		type:String,
		required:true
	},
    cartitem:[{
    	    book:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Books'
        },quantity:{
        	type:Number,
        	default:0,
        	required:true
        }
    }],
    order:[{
        	BookOrdered:{
            	type:mongoose.Schema.Types.ObjectId,
            	ref:'Books'
            },
            total:{
            	type:Number,
            	default:0
            }
        }],
    role:{
    	type:String,
    	enum:['user','admin'],
    	required:true
    },
    username:{
    	type:String,
    	required:true,
    	unique:true
    },
    password:{
    	type:String,
    	required:true
    }
})

userSchema.pre('save',async function(next){
	const user = this;
	if(!user.isModified('password')) return next();
	try{

	const salt = await bcrypt.genSalt(10);   // hash password generation

	const hashedpassword = await bcrypt.hash(user.password,salt);

	user.password = hashedpassword;
    next();
	}
	catch(err){
       return next(err)
	}
})

userSchema.methods.comparePassword = async function(candidatePassword){
	try{
       const isMatch = await bcrypt.compare(candidatePassword,this.password);
       return isMatch;
	}
	catch(err){
        throw err;
	}
}



const User = mongoose.model('User',userSchema);
module.exports = User;