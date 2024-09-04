import fs from 'fs';
import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

const postUpload = async (req, res) => {
  const token = req.headers['x-token'];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const key = `auth_${token}`;
  const userId = await redisClient.get(key);
  const user = await dbClient.client.db(dbClient.database).collection('users').findOne({ _id: ObjectId(userId) });
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const types = ['folder', 'file', 'image'];
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Missing name' });
  const { type } = req.body;
  if (!types.includes(type)) return res.status(400).json({ error: 'Missing type' });
  const { data } = req.body;
  if (!data && type !== 'folder') return res.status(400).json({ error: 'Missing data' });
  const { parentId } = req.body;
  if (parentId) {
    const existingFile = await dbClient.client.db(dbClient.database).collection('files').findOne({ _id: parentId });
    if (!existingFile) return res.status(400).json({ error: 'Parent not found' });
    if (existingFile.type !== 'folder') return res.status(400).json({ error: 'Parent is not a folder' });
  }
  const { isPublic } = req.body;
  if (type === 'folder') {
    const result = await dbClient.client.db(dbClient.database).collection('files').insertOne({
      userId,
      name,
      type,
      parentId: parentId || 0,
      isPublic: isPublic || false,
    });
    return res.status(201).json({
      id: result.insertedId,
      userId,
      name,
      type,
      parentId: parentId || 0,
      isPublic: isPublic || false,
    });
  }
  const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
  fs.access(folderPath, (err) => {
    if (err) {
      fs.mkdir(folderPath, (err) => {
        throw err;
      });
    }
  });
  const filePath = `${folderPath}/${uuidv4()}`;
  const fileContent = Buffer.from(data, 'base64').toString('utf-8');
  fs.writeFile(filePath, fileContent, (err) => {
    if (err) console.log(err);
  });
  const result = await dbClient.client.db(dbClient.database).collection('files').insertOne({
    userId,
    name,
    type,
    parentId: parentId || 0,
    isPublic: isPublic || false,
    data,
    localPath: filePath,
  });
  return res.status(201).json({
    id: result.insertedId,
    userId,
    name,
    type,
    parentId: parentId || 0,
    isPublic: isPublic || false,
  });
};

export default {
  postUpload,
};
