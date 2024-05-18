const express = require('express');
const router = express.Router();
const Book = require('./../models/Books');
const User = require('./../models/Users');
const {jwtAuthMiddleware,generateToken} = require('./../jwt.js');



const isAdmin = async (userid) => {
try {  
	const user = await User.findById(userid);
    if(user.role === 'admin') return true 
}
catch(error){
	console.log(error);
}     
}

router.post('/',jwtAuthMiddleware,async (req,res) => {
try {

	if(! await isAdmin(req.user.id)) return res.status(403).json({message:"User does not have admin role"})

   const bookdata = req.body;
   const book =  new Book(bookdata);
   
   const response = await book.save();

   return res.status(200).json({response});

}

catch(error){
    console.log(error);
	 return res.status(500).json({error:"Internal Server Error"});
}   
})

router.put('/:bookid',async(req,res) => {
    try{
        if(! await isAdmin(req.user.id)) return res.status(403).json({message:"User does not have admin role"})

    	const bookid = req.params.bookid;

    	const updatedData = req.body;

    	const user = await Book.findByIdAndUpdate(bookid,updatedData,{
    		new:true,
    		runValidators:true
})

       if(!user) res.status(401).json({message:"User not found"});
       
       await user.save();
       return res.status(200).json({message:"User Data updated successfully"})
  
  }
    catch(error){
     return res.status(500).json({error:"Internal Server Error"});
    }
})

router.delete('/:bookid',async (req,res) => {
try {	

	if(! await isAdmin(req.user.id)) return res.status(403).json({message:"User does not have admin role"})
	
	const bookid = req.params.bookid;
  	const deletedData = Book.findByIdAndDelete(bookid);
    
    if(!deletedData) return res.status(401).json({message:"User not found"})

    return res.status(200).json({message:"User Deleted successfully"})

  }  
  catch(error){
  	return res.status(500).json({error:"Internal Serve new Error"})
  }
})

module.exports = router;