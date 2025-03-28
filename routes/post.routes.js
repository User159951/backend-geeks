import express from 'express';
import Post from '../models/Post.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const posts = await Post.find().populate('author', 'email').sort({ createdAt: -1 });
  res.json(posts);
});

router.get('/:id', async (req, res) => {
  const post = await Post.findById(req.params.id).populate('author', 'email');
  if (!post) return res.status(404).json({ error: 'Article non trouvé' });
  res.json(post);
});

router.get('/mine', auth, async (req, res) => {
  const posts = await Post.find({ author: req.userId });
  res.json(posts);
});

router.post('/', auth, async (req, res) => {
  const { title, content } = req.body;
  const post = await Post.create({ title, content, author: req.userId });
  res.status(201).json(post);
});

router.put('/:id', auth, async (req, res) => {
  const post = await Post.findOneAndUpdate(
    { _id: req.params.id, author: req.userId },
    { $set: req.body },
    { new: true }
  );
  if (!post) return res.status(403).json({ error: 'Non autorisé' });
  res.json(post);
});

router.delete('/:id', auth, async (req, res) => {
  const post = await Post.findOneAndDelete({ _id: req.params.id, author: req.userId });
  if (!post) return res.status(403).json({ error: 'Non autorisé' });
  res.json({ message: 'Article supprimé' });
});

export default router;