import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({
    message: '🍕 Api route 🍕',
  });
});

// // routes registration
// router.use('/emojis', emojis);

export default router;