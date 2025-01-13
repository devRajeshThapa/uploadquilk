import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import multer from "multer";
import path from 'path';
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv"
import validator from 'validator';
const app = express();
dotenv.config()
app.use(cors({
  origin: 'http://thequilk.com', // Adjust to your frontend's origin if needed
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));
app.use(express.urlencoded({extended:false}));
app.use(express.json());
const port=process.env.PORT;

//database
const dbURI = 'mongodb+srv://budhahemanta03:budhahemanta03password@cluster0.5fy1w.mongodb.net/myDatabase?retryWrites=true&w=majority';

mongoose.connect(dbURI, {
  serverSelectionTimeoutMS: 5000, // 5 seconds timeout
})
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((error) => {
    console.error("Database connection failed:", error.message);
  });
//database
const homeads=[
  {
    imgsrc: "https://thequilkads.s3.ap-south-1.amazonaws.com/Screenshot+(124).png",  // Use the static path
    title: "if you want to put ads on these website then contact above.",
    profileimage: "https://thequilkads.s3.ap-south-1.amazonaws.com/Screenshot+(124).png",  // Use the static path
    links: "http://localhost:5173/",
  }
];
 const otherads= [
    {
      imgsrc: "https://thequilkads.s3.ap-south-1.amazonaws.com/Screenshot+(124).png",
      links:"http://localhost:5173/"
    }
   ];
 //schema

 const newSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  images: {
    type: [String],
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
}, { timestamps: true });
const newmodel=mongoose.model("news",newSchema);
 const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
    required: true,
  },
  images: {
    type: [String],
    required: true,
  },createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
}, { timestamps: true });
const postmodel=mongoose.model("post",postSchema);

const userSchema=new mongoose.Schema({
  profile:{
    type: String,
    required: true,
  },
  name:{
    type:String,
    required:true,
  },
  email:{
    type:String,
    required:true
  },
  education:{
    type:String,
    required:true
  },
  password:{
    type:String,
    required:true
  }
},{timestamps:true})
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    try {
      // Hash the password with bcrypt
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});
const usermodel=mongoose.model("user",userSchema)
const wishlistSchema=new mongoose.Schema({
wishlistby:{
  type:mongoose.Schema.Types.ObjectId,
  required:true,
  ref:"user"
},
postid:{
  type:mongoose.Schema.Types.ObjectId,
  required:true,
  ref:"post"
}
},{timestamps:true})
const wishlistmodel=mongoose.model("wishlist",wishlistSchema)

// Multer Storage Configuration for S3
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '../../upload');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const uploadmiddleware = multer({
  storage: storage
}).fields([{ name: "thumbnail", maxCount: 1 }, { name: "file", maxCount: 1000 }]);
const newsmiddleware=multer({ storage:storage}).fields([{name:"newsimage"}])
const profilemiddleware=multer({storage:storage}).fields([{name:"profile",maxCount:1}])
//multer
app.post("/upload/file/signup", profilemiddleware, async (req, res) => {
  const { name, email, education, password } = req.body;
  // Email validation
  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  try {
    const existingUserByName = await usermodel.findOne({ name });
    const existingUserByemail = await usermodel.findOne({ email });

    if (existingUserByName) {
      return res.status(400).json({ message: "Username already exists" });
    }

    if (existingUserByemail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const profileimage = req.files.profile[0].filename;

    const userentry = new usermodel({
      name,
      email,
      education,
      password,
      profile: `upload/${profileimage}`,
    });

    await userentry.save();
    res.send("Your account has been created successfully");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating user" });
  }
});
app.get("/upload/file/people",async(req,res)=>{
  try{
const data=await usermodel.find({});
res.json({data})
  }catch(error){
    console.log(error)
  }
})
app.get("/upload/file/people/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const userdata = await usermodel.findById(id);

    // Check if user exists
    if (!userdata) {
      return res.status(404).json({ message: "User doesn't exist" }); // Return here to stop further execution
    }

    // If user exists, send user data
    res.json(userdata);
  } catch (error) {
    res.status(500).json({ message: "An error occurred" }); // Handle unexpected errors
  }
});

app.post("/upload/file/login", async (req, res) => {
  const { email, password } = req.body;
 const userexist = await usermodel.findOne({ email });
  if (!userexist) {
    return res.status(400).json({ message: "Email or password doesn't match" });
  }



  // Await the password comparison, since bcrypt.compare is async
  const passwordMatch = await bcrypt.compare(password, userexist.password);



  if (!passwordMatch) {
    return res.status(400).json({ message: "Email or Password doesn't match" });
  }

  const token = jwt.sign(
    { userId: userexist._id },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "24h" }
  );

  return res.status(200).json({
    token,
  });
});

app.post("/upload/file/verifytoken", async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];  // Extract token from header

  if (!token) {
    return res.status(403).json({ message: "Token is required" });  // Token is missing
  }

  try {
    // Verify the token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // decoded will contain { userId: <user_id> } if the token is valid

    // Check if the user exists in the database
    const user = await usermodel.findById(decoded.userId);  // Find user by the userId decoded from the token

    if (!user) {
      return res.status(404).json({ message: "User doesn't exist" });  // User not found in the database
    }

    // If the user exists, return the userId
    res.json({
      userId: decoded.userId
    });
  } catch (error) {
    // If there's any error with token verification, return a 403 error
    return res.status(403).json({ message: "Invalid or expired token" });
  }
});


// POST endpoint for creating a post
app.post("/upload/file", uploadmiddleware, async (req, res) => {
  const { title, description } = req.body;
  const { file, thumbnail } = req.files;

  const thumbnailImage = thumbnail[0].filename;

  const fileImages = file.map((current) => {
    return `upload/${current.filename}`;
  });


  // Extract the userId from the JWT token sent in the headers
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(403).json({ message: "Token is required" });
  }

  try {
    // Verify the token and get the decoded userId
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY || "yourSecretKey");
    const userId = decoded.userId;

    // Create a new post with the createdBy field set to the user's ID
    const postEntry = new postmodel({
      title,
      description,
      thumbnail: `upload/${thumbnailImage}`,
      images: fileImages,
      createdBy: userId,  // This should be a valid user ID
    });

    // Check if the user exists before saving
    const userExist = await usermodel.findById(userId);
    if (!userExist) {
      return res.status(400).json({ message: "User not found for the given post" });
    }

    const postSave = await postEntry.save();


    res.json({
      data: postSave.toObject(),
    });
  } catch (error) {
    console.log("Error in post creation:", error);
    res.status(500).json({ message: "Error creating post" });
  }
});
app.post("/upload/file/news",newsmiddleware,async (req, res) => {
  const { title } = req.body;
  const {newsimage} = req.files;
  const fileImages = newsimage.map((current) => {
    return `upload/${current.filename}`;
  });


  // Extract the userId from the JWT token sent in the headers
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(403).json({ message: "Token is required" });
  }

  try {
    // Verify the token and get the decoded userId
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY || "yourSecretKey");
    const userId = decoded.userId;

    // Create a new post with the createdBy field set to the user's ID
    const postEntry = new newmodel({
      title,
      images: fileImages,
      createdBy: userId,  // This should be a valid user ID
    });

    // Check if the user exists before saving
    const userExist = await usermodel.findById(userId);
    if (!userExist) {
      return res.status(400).json({ message: "User not found for the given post" });
    }

    const postSave = await postEntry.save();


    res.json({
      data: postSave.toObject(),
    });
  } catch (error) {
    console.log("Error in post creation:", error);
    res.status(500).json({ message: "Error creating post" });
  }
});
app.post("/upload/file/wishlist", async (req, res) => {
  const { postid } = req.body;

  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(403).json({ message: "Token is required" });
  }

  try {
    // Verify the token and extract userId
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY );
    const userId = decoded.userId;

    // Check if the post already exists in the user's wishlist
    const existingWishlist = await wishlistmodel.findOne({
      wishlistby: userId,
      postid: postid,
    });

    if (existingWishlist) {
      // If the post is already in the wishlist, return a message
      return res.status(400).json({ message: "Post is already in your wishlist" });
    }

    // If not, create a new wishlist entry
    const wishlistEntry = new wishlistmodel({
      wishlistby: userId,
      postid: postid,
    });

    await wishlistEntry.save();

    return res.status(200).json({ message: "Post added to your wishlist successfully" });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error adding to wishlist" });
  }
});
// Fetch wishlist
app.get("/upload/file/wishlist", async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(403).json({ message: "Token is required" });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userId = decoded.userId;

    // Fetch wishlist and populate the post and the creator
    const wishlistItems = await wishlistmodel
    .find({ wishlistby: userId })
    .populate({
      path: 'postid', // Populate the postid field
      populate: {
        path: 'createdBy', // Inside postid, populate createdBy
        select: 'name profile' // Select only the name and profile fields from user
      }
    });

       // Populate the creator's name and profile

    // Return the populated wishlist items
    res.status(200).json(wishlistItems);
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({ message: "Error fetching wishlist" });
  }
});

app.get("/upload/file/people/profile/:id", async (req, res) => {
  const id = req.params.id;

  try {


    const posts = await postmodel
      .find({ createdBy: id })
      .populate("createdBy", "name profile"); // Populate user info



    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while fetching posts" });
  }
});
app.get("/upload/file/profile/createdby", async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(403).json({ message: "Token is required" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userId = decoded.userId;
    const posts = await postmodel
      .find({ createdBy: userId})
      .populate("createdBy", "name profile"); // Populate user info



    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while fetching posts" });
  }
});
app.get("/upload/file/news/createdby", async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(403).json({ message: "Token is required" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const userId = decoded.userId;
    const posts = await newmodel
      .find({ createdBy: userId})
      .populate("createdBy", "name profile"); // Populate user info



    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while fetching posts" });
  }
});
app.get("/upload/file/people/profile/news/:id", async (req, res) => {
  const id = req.params.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;

  try {
    const posts = await newmodel
      .find({ createdBy: id })
      .skip(skip)  // Skip the posts that have already been fetched
      .limit(limit)  // Limit the number of posts returned
      .sort({ createdAt: -1 })  // Sort posts by the 'createdAt' field in descending order (newest first)
      .populate("createdBy", "name profile");  // Populate user info

    res.status(200).json(posts.reverse());
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while fetching posts" });
  }
});


// GET endpoint for fetching all posts
app.get("/upload/file", async (req, res) => {
  try {
    // Fetch posts and populate the createdBy field with user data
    const data = await postmodel.find({}).populate('createdBy', 'name profile');  // Populate 'name' and 'profile' fields from the user model

    res.json({
      datas: data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching posts" });
  }
});
app.get("/upload/file/news", async (req, res) => {
  try {
    // Fetch posts and populate the createdBy field with user data
    const data = await newmodel.find({}).populate('createdBy', 'name profile');  // Populate 'name' and 'profile' fields from the user model

    res.json({
      datas: data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching posts" });
  }
});
app.get("/upload/file/news/bit", async (req, res) => {
  try {
    // Default page is 1 and limit is 15
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const skip = (page - 1) * limit;

    // Fetch paginated posts and populate the 'createdBy' field with 'name' and 'profile'
    const data = await newmodel.find({})
      .skip(skip)  // Skip the posts that have already been fetched
      .limit(limit)
      .sort({ createdAt: -1 })  // Limit the number of posts fetched (15 in this case)
      .populate('createdBy', 'name profile')  // Populate creator data


    // Send the data back to the client
    res.json({
      datas: data,  // The fetched data
      message: "Posts fetched successfully",  // A success message
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching posts" });
  }
});

app.get("/upload/file/home", async (req, res) => {
  try {
    // Default page is 1 and limit is 15
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const skip = (page - 1) * limit;

    // Fetch paginated posts and populate the 'createdBy' field with 'name' and 'profile'
    const data = await postmodel.find({})
      .skip(skip)  // Skip the posts that have already been fetched
      .limit(limit)  // Limit the number of posts fetched (15 in this case)
      .populate('createdBy', 'name profile')  // Populate creator data
      .sort({ createdAt: -1 })
      .select('thumbnail title createdBy imgsrc')  // Select only the necessary fields (e.g., images, title, etc.)

    // Send the data back to the client
    res.json({
      datas: data,  // The fetched data
      message: "Posts fetched successfully",  // A success message
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching posts" });
  }
});


app.delete("/upload/file/:id", async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(403).json({ message: "Token is required" });
  }
  const postId = req.params.id;

  try {

    const post = await postmodel.findById(postId);

    if (!post) {

      return res.status(404).json({ error: "Post not found" });
    }


    await postmodel.findByIdAndDelete(postId);
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
const userId = decoded.userId;


    const remainingPosts = await postmodel.find({createdBy:userId}).populate("createdBy","name profile");
    res.json({  remainingPosts });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete post" });
  }
});
app.delete("/upload/file/news/:id", async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(403).json({ message: "Token is required" });
  }
  const postId = req.params.id;

  try {

    const post = await newmodel.findById(postId);

    if (!post) {

      return res.status(404).json({ error: "Post not found" });
    }


    await newmodel.findByIdAndDelete(postId);
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
const userId = decoded.userId;


    const remainingPosts = await newmodel.find({createdBy:userId}).populate("createdBy","name profile");
    res.json({  remainingPosts });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete post" });
  }
});
app.delete("/upload/file/wishlist/:id",async(req,res)=>{
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(403).json({ message: "Token is required" });
  }
  const{id}=req.params;

  try{
const postid= await wishlistmodel.findById(id);
if(!postid){
  return res.status(404).json({error:"wishlist not found"});
}
await wishlistmodel.findByIdAndDelete(id);
const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
const userId = decoded.userId;

// Fetch wishlist and populate the post and the creator
const wishlistItems = await wishlistmodel
.find({ wishlistby: userId })
.populate({
  path: 'postid', // Populate the postid field
  populate: {
    path: 'createdBy', // Inside postid, populate createdBy
    select: 'name profile' // Select only the name and profile fields from user
  }
});

   // Populate the creator's name and profile

// Return the populated wishlist items
res.status(200).json(wishlistItems);

  }catch(error){
    console.log(error)
  }
})
// GET endpoint for fetching a single post by ID
app.get("/upload/file/:id", async (req, res) => {
  const postId = req.params.id;
  try {
    // Fetch post and populate the 'createdBy' field
    const post = await postmodel.findById(postId).populate('createdBy', 'name profile');

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.json({
      postdata: post.toObject(),
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to get the post thank you" });
  }
});
app.get("/homeads",async(req,res)=>{
  res.json({homeads:homeads})
})
app.get("/otherads",async(req,res)=>{
  res.json({otherads:otherads})
})
app.use("/upload",express.static("upload"))

app.listen(5000, ()=>{
        console.log("Server started at PORT 5000");
});
