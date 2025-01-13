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
