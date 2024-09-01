import dbClient from '../utils/db';
import sha1 from 'sha1';

const postNew = async (req, res) => {
  try {
    const db = dbClient.client.db(dbClient.database);
    const collection = db.collection('users');
    if (!req.body.email) {
      res.status(400).json({error: 'Missing email'});
    } else if (!req.body.password) {
      res.status(400).json({error: 'Missing password'});
    }
    const existingUser = await collection.findOne({ email: req.body.email });
    if (existingUser) {
      res.status(400).json({error: 'Already exist'});
    }
    const result = await collection.insertOne({
      email: req.body.email,
      password: sha1(req.body.password),
    });
    res.json({
      id: result.insertedId,
      email: req.body.email,
    });
  } catch(err) {
    console.log(err);
  }
}

export default {
  postNew,
}
