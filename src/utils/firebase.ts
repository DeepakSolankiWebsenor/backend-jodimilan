import admin from 'firebase-admin';
import { config } from '../config/app';
import path from 'path';

let firebaseApp: admin.app.App;

/**
 * Initialize Firebase Admin
 */
export const initializeFirebase = (): void => {
  try {
    if (config.firebase.privateKeyPath) {
      const serviceAccount = require(path.resolve(config.firebase.privateKeyPath));

      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: config.firebase.databaseUrl,
      });

      console.log('✅ Firebase initialized successfully');
    }
  } catch (error) {
    console.warn('⚠️ Firebase initialization failed:', error);
  }
};

export class FirebaseService {
  /**
   * Send push notification to specific user
   */
  static async sendNotification(
    userId: number,
    title: string,
    body: string,
    data?: any
  ): Promise<boolean> {
    try {
      if (!firebaseApp) {
        console.warn('Firebase not initialized');
        return false;
      }

      const topic = `${config.firebase.projectId}_user_id_${userId}`;

      const message = {
        notification: {
          title,
          body,
        },
        data: data || {},
        topic,
      };

      await admin.messaging().send(message);
      return true;
    } catch (error) {
      console.error('Firebase notification failed:', error);
      return false;
    }
  }

  /**
   * Subscribe user to topic
   */
  static async subscribeToTopic(token: string, userId: number): Promise<boolean> {
    try {
      if (!firebaseApp) return false;

      const topic = `${config.firebase.projectId}_user_id_${userId}`;
      await admin.messaging().subscribeToTopic([token], topic);
      return true;
    } catch (error) {
      console.error('Topic subscription failed:', error);
      return false;
    }
  }

  /**
   * Unsubscribe user from topic
   */
  static async unsubscribeFromTopic(token: string, userId: number): Promise<boolean> {
    try {
      if (!firebaseApp) return false;

      const topic = `${config.firebase.projectId}_user_id_${userId}`;
      await admin.messaging().unsubscribeFromTopic([token], topic);
      return true;
    } catch (error) {
      console.error('Topic unsubscription failed:', error);
      return false;
    }
  }

  /**
   * Send notification to multiple users
   */
  static async sendMulticastNotification(
    userIds: number[],
    title: string,
    body: string,
    data?: any
  ): Promise<boolean> {
    try {
      const promises = userIds.map((userId) =>
        this.sendNotification(userId, title, body, data)
      );
      await Promise.all(promises);
      return true;
    } catch (error) {
      console.error('Multicast notification failed:', error);
      return false;
    }
  }
}
