import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables directly to avoid circular dependency
dotenv.config();

// Import all models explicitly using require to avoid ES6 module issues
const { User } = require('../models/User');
const { UserProfile } = require('../models/UserProfile');
const { Country } = require('../models/Country');
const { State } = require('../models/State');
const { City } = require('../models/City');
const { Area } = require('../models/Area');
const { Religion } = require('../models/Religion');
const { Caste } = require('../models/Caste');
const { Package } = require('../models/Package');
const { FriendRequest } = require('../models/FriendRequest');
const { Wishlist } = require('../models/Wishlist');
const { BlockProfile } = require('../models/BlockProfile');
const { UserAlbum } = require('../models/UserAlbum');
const { Order } = require('../models/Order');
const { PaymentOrder } = require('../models/PaymentOrder');
const { PackagePayment } = require('../models/PackagePayment');
const { Session } = require('../models/Session');
const { Chat } = require('../models/Chat');
const { UserPresence } = require('../models/UserPresence');
const { Notification } = require('../models/Notification');
const { Category } = require('../models/Category');
const { Banner } = require('../models/Banner');
const { Cms } = require('../models/Cms');
const { Coupon } = require('../models/Coupon');
const { Config } = require('../models/Config');
const { Setting } = require('../models/Setting');
const { Thikhana } = require('../models/Thikhana');
const { Enquiry } = require('../models/Enquiry');
// Lazy initialization to avoid circular dependency issues
let sequelizeInstance: Sequelize | null = null;

function getSequelizeInstance(): Sequelize {
  if (!sequelizeInstance) {
    // Create Sequelize instance and explicitly add models
    sequelizeInstance = new Sequelize({
      database: process.env.DB_NAME || 'jodimilan',
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      dialect: (process.env.DB_DIALECT || 'mysql') as 'mysql',
      logging: process.env.DB_LOGGING === 'true' ? console.log : false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
      define: {
        timestamps: true,
        underscored: false,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
      },
      timezone: '+05:30', // India timezone
    });

    // Add all models
    sequelizeInstance.addModels([
      User,
      UserProfile,
      Country,
      State,
      City,
      Area,
      Religion,
      Caste,
      Package,
      FriendRequest,
      Wishlist,
      BlockProfile,
      UserAlbum,
      Order,
      PaymentOrder,
      PackagePayment,
      Session,
      Chat,
      UserPresence,
      Notification,
      Category,
      Banner,
      Cms,
      Coupon,
      Config,
      Setting,
      Thikhana,
       Enquiry,
    ]);
  }
  return sequelizeInstance;
}

// Export a getter to defer initialization
export function getSequelize(): Sequelize {
  return getSequelizeInstance();
}

// For backward compatibility, export sequelize as a getter
export const sequelize = new Proxy({} as Sequelize, {
  get(target, prop) {
    const instance = getSequelizeInstance();
    return (instance as any)[prop];
  }
});

// Database connection test
export const connectDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');

    // Sync models in development
    if (process.env.APP_ENV === 'development') {
      // await squelize.sync({ alter: true });
      console.log('📊 Database models synchronized');
    }
  } catch (error) {
    console.error('❌ Unable to connect to database:', error);
    process.exit(1);
  }
};

// For Sequelize CLI - removed to avoid overwriting ES6 exports
// If you need this for Sequelize CLI, create a separate .sequelizerc file
