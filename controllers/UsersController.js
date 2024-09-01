import dbClient from '../utils/db';
import sha1 from 'sha1';

const postNew = async (req, res) => {
  try {
    const db = dbClient.client.db(dbClient.database);
    const collection = db.collection('users');
    if (!req.body.email) {
      return res.status(400).json({error: 'Missing email'});
    } else if (!req.body.password) {
      return res.status(400).json({error: 'Missing password'});
    }
    const existingUser = await collection.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({error: 'Already exist'});
    }
    const result = await collection.insertOne({
      email: req.body.email,
      password: sha1(req.body.password),
    });
    return res.json({
      id: result.insertedId,
      email: result.ops[0].email,
    });
  } catch(err) {
    console.log(err);
  }
}

export default {
  postNew,
}
