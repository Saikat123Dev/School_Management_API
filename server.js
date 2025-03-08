const app = require('./app');
const { initializeDatabase } = require('./config/db.config');
const environment = require('./config/environment');

const PORT = environment.port;

async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
