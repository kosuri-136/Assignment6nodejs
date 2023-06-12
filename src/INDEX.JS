const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb+srv://kosuriravikanth:Mongo553136@kosuri.m6mwpbj.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

// Define Blog schema
const blogSchema = new mongoose.Schema({
  topic: String,
  description: String,
  posted_at: { type: Date, default: Date.now },
  posted_by: String,
});

// Define Blog model
const Blog = mongoose.model('Blog', blogSchema);

// GET /blog?page=&search=
app.get('/blog', async (req, res) => {
  try {
    const { page = 1, search = '' } = req.query;
    const limit = 5;
    const skip = (page - 1) * limit;

    const regex = new RegExp(search, 'i');
    const query = { topic: regex };

    const blogs = await Blog.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ posted_at: 'desc' });

    res.json({ status: 'success', result: blogs });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

// POST /blog
app.post('/blog', async (req, res) => {
  try {
    const { topic, description, posted_at, posted_by } = req.body;

    const blog = new Blog({
      topic,
      description,
      posted_at,
      posted_by,
    });

    const savedBlog = await blog.save();

    res.json({ status: 'success', result: savedBlog });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

// PUT /blog/:id
app.put('/blog/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { topic, description, posted_at, posted_by } = req.body;

    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      { topic, description, posted_at, posted_by },
      { new: true }
    );

    if (!updatedBlog) {
      return res.status(404).json({ status: 'error', message: 'Blog not found' });
    }

    res.json({ status: 'success', result: updatedBlog });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

// DELETE /blog/:id
app.delete('/blog/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedBlog = await Blog.findByIdAndDelete(id);

    if (!deletedBlog) {
      return res.status(404).json({ status: 'error', message: 'Blog not found' });
    }

    res.json({ status: 'success', result: deletedBlog });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

// Start the server
const port = 4000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
