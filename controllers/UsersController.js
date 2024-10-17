import mongodb from 'mongodb';
import crypto from 'crypto';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

export default class UserController {
  static async postNew(req, res) {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    const user = await dbClient.db.collection('users')
      .findOne({ email });

    if (user) {
      return res.status(400).json({ error: 'Already exist' });
    }

    const hashedPassword = crypto.createHash('sha1')
      .update(password).digest('hex');

    const result = await dbClient.db.collection('users')
      .insertOne({ email, password: hashedPassword });

    return res.status(201).json({ id: result.insertedId, email });
  }

  static async getMe(req, res) {
    const token = req.get('X-Token');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const user = await dbClient.db.collection('users')
        .findOne({ _id: new mongodb.ObjectId(userId) });
      const { _id, email } = user;

      return res.status(200).json({ id: _id, email });
    } catch (error) {
      res.status(401).json({ error: 'Unauthorized' });
    }
  }
}
