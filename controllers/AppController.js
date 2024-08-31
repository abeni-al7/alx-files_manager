import redisClient from '../utils/redis';
import dbClient from '../utils/db';

const getStatus = (req, res) => {
  const redisStatus = redisClient.isAlive();
  const dbStatus = dbClient.isAlive();
  let statusCode = 500;
  if (redisClient && dbClient) {
    statusCode = 200;
  }
  res.status(statusCode).json({
    redis: redisStatus,
    db: dbStatus,
  });
};

const getStats = (req, res) => {
  const usersCount = dbClient.nbUsers();
  const filesCount = dbClient.nbFiles();
  const statusCode = 200;
  res.status(statusCode).json({
    users: usersCount,
    files: filesCount,
  });
};

export default {
  getStatus,
  getStats,
};
