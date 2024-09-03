import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    this.isConnected = false;

    this.host = process.env.DB_HOST || 'localhost';
    this.port = process.env.DB_PORT || '27017';
    this.database = process.env.DB_DATABASE || 'files_manager';

    const url = `mongodb://${this.host}:${this.port}`;
    this.client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

    this.connect();
  }

  async connect() {
    try {
      await this.client.connect();
      this.db = this.client.db(this.database);
      this.isConnected = true;
    } catch (error) {
      console.error('Failed to connect to MongoDB', error);
      this.isConnected = false;
    }
  }

  isAlive() {
    return this.isConnected;
  }

  async nbUsers() {
    try {
      return await this.db.collection('users').countDocuments({});
    } catch (error) {
      console.error('Failed to count users', error);
      return 0;
    }
  }

  async nbFiles() {
    try {
      return await this.db.collection('files').countDocuments({});
    } catch (error) {
      console.error('Failed to count files', error);
      return 0;
    }
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
