const express = require('express');
const router = express.Router();
const {jwtAuthMiddleware,generateToken} = require('./../jwt');
const User = require('./../models/Users');
const Book = require('./../models/Books');

const isAdmin = async (userid) => {
try {  
    const user = await User.findById(userid);
    if(user.role === 'admin') return true 
}
catch(error){
    console.log(error);
}     
}

router.post('/signup', async (req,res) => {
try{
	const data = req.body;

	const newuser = new User(data);
	const response = await newuser.save();
    

    const payload = {
    	id : response.id
    }

    const token = generateToken(payload); 
    res.status(200).json({response:response,token:token}); 

}
catch(error){
return res.status(500).json({error:"internal Server Error"})
}
})

router.post('/login',async (req,res) => {
	try{
	const {username,password} = req.body;
	const user = await User.findOne({username:username});

	if(!user || ! await user.comparePassword(password)) return res.status(401).json({message:"Invalid Username or password"})

    const payload = {
    	id:user.id
    }
    const token = generateToken(payload);

    return res.status(200).json({token:token})

	}
	catch(error){
   return res.status(500).json({error:"Invalid Server Error"})
	}
})

router.get('/profile',jwtAuthMiddleware,async (req,res) => {
    try{
        const userData = req.user;
        const userid = userData.id;
        const user = await User.findById(userid);
        res.status(200).json({user});
    }
    catch(error){
        console.log(error);
        res.status(500).json({error:"Internal Server Error"});
    }
})

router.put('/profile/password',jwtAuthMiddleware,async (req,res) => {
	  try{
	  	const userid = req.user.id;
	  	const {currentPassword , newPassword} = req.body;
        const user = await User.findById(userid);
	  	if(!(await user.comparePassword(currentPassword))) return res.status(401).json("Invalid password");

	  	user.password = newPassword;
	  	await user.save();

	  	return res.status(200).json({message:"Password Updated Successfully"}) 
	  }

	  catch(error){
	  	console.log(error);
	  	return res.status(500).json({error:"Internal Server Error"})
	  }
})

router.get('/book', jwtAuthMiddleware, async (req,res) => {
try 
    {    
    const book = await Book.find();
    return res.status(200).json({book});
    }  
catch(error){
    console.log(error);
    res.status(500).json({error:"Internal Server Error"})
}   
})


router.put('/cart/additem/:bookid',jwtAuthMiddleware, async (req,res) => {
    try{
     const bookid = req.params.bookid;
     const userpayload = req.user;
     const userid = userpayload.id;
     console.log(userid);
     const book = await Book.findById(bookid);
     
     if(!book) res.status(404).json({message:"No such book found"})
     
     const user = await User.findById(userid);
     console.log(user);
     if(!user) res.status(404).json({message:"No such user found"})

    /*if(!Array.isArray(user.cartitem)){
        user.cartitem = [];
    } */
       const hasItem = user.cartitem.find((item) => item.book==bookid)
        
       console.log(user.cartitem.length);
       console.log(hasItem);
       if(hasItem) hasItem.quantity++; 
       if(user.cartitem.length===0 || !hasItem) user.cartitem.push({book:bookid,quantity:1});
       await user.save();  
       return res.status(200).json({message:"Item added to Cart"})   
}
     catch(error){
     	console.log(error);
     res.status(500).json({error:"Internal Server Error"})
    }  

})


router.put('/cart/removeitem/:bookid',jwtAuthMiddleware , async (req,res) => {
    try{
     const bookid = req.params.bookid;
     const userpayload = req.user;
     const userid = userpayload.id;
     console.log(userid);
     const book = await Book.findById(bookid);
     
     if(!book) res.status(404).json({message:"No such book found"})
     
     const user = await User.findById(userid);
     console.log(user);
     if(!user) res.status(404).json({message:"No such user found"})

    /*if(!Array.isArray(user.cartitem)){
        user.cartitem = [];
    } */
       const hasItem = user.cartitem.find((item) => item.book==bookid)
        
       console.log(user.cartitem.length);
       console.log(hasItem);
       if(hasItem && hasItem.quantity > 0) hasItem.quantity--;
       if(hasItem.quantity===0) {
        const index = user.cartitem.findIndex((item) => item.quantity===0 )
        console.log(index);
        user.cartitem.splice(index,1);
    }

       //if(user.cartitem.length===0 || !hasItem) user.cartitem.push({book:bookid,quantity:1});
       await user.save();  
       return res.status(200).json({message:"Item removed from Cart"})   
}
     catch(error){
        console.log(error);
     res.status(500).json({error:"Internal Server Error"})
    }  
})


router.get('/cart',jwtAuthMiddleware,async (req,res) => {
try {   
     const userid = req.user.id;
     const usercartitem = await User.findById(userid).select('cartitem');

     return res.status(200).json({usercartitem});
  }  
catch(error){
    console.log(error);
    res.status(500).json({error:"Internal Server Error"});
 }
})

router.put('/order/:bookid',jwtAuthMiddleware,async (req,res) => {

try {   
    const bookid = req.params.bookid;
    const userid = req.user.id;

    const user = await User.findById(userid);
    const book = await Book.findById(bookid);
    if(!user) res.status(404).json({message:"Invalid user"});
    
    if(!book) res.status(404).json({message:"No such book found"});

   const index = user.cartitem.findIndex((item) => item.book == bookid);
   console.log(index);

   user.order.push({BookOrdered:bookid,total:user.cartitem[index].quantity*book.price});

   await user.save();

   return res.status(200).json({message:"Item ordered Successfully"});
}

catch(error){
    console.log(error);
    return res.status(500).json({error:"Internal Server Error"});
}

})

router.get('/order',jwtAuthMiddleware, async(req,res) => {
try {
const userid = req.user.id; 
const userorder = await User.findById(userid).select('order');

return res.status(200).json({userorder});
}

catch(error){
    console.log(error);
    res.status(500).json({error:"Internal Server Error"});
}

})

router.get('/customerorder',jwtAuthMiddleware,async (req,res) => {

try {    
    const userid = req.user.id;
    if(!(await isAdmin(userid))) return res.status(401).json({message:"Only admin has access to view all te orders"})
    
    const user = await User.find().select('username cartitem order');

    if(!user) return res.status(404).json({message:"No user found"})

    return res.status(200).json({user})
}

catch(error){
    return res.status(500).json({error:"Internal Server Error"});
}

})

module.exports = router;