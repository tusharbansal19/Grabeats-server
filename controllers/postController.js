const Post = require('../models/Post');

// Get all posts
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find();
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a single post
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create a new post
exports.createPost = async (req, res) => {
  try {
    const { title, content, author, link, tags } = req.body; 
    console.log("new post ",title, content, author, link, tags )
    const newPost = new Post({ title, content, author, link, tags  });
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// const deleteAllPosts = async (req, res) => {
//   try {
//     const result = await Post.deleteMany({});
//     console.log("delete all posts")
//   } catch (error) {
    
//   }
// };

// deleteAllPosts();