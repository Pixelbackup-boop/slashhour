import * as admin from 'firebase-admin';
import { Logger } from '@nestjs/common';
import * as path from 'path';

const logger = new Logger('FirebaseConfig');

let firebaseApp: admin.app.App | null = null;

export const initializeFirebase = () => {
  if (firebaseApp) {
    return firebaseApp;
  }

  try {
    // Check if Firebase credentials are configured
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

    if (!serviceAccountPath && !serviceAccountJson) {
      logger.warn(
        'Firebase credentials not configured. Push notifications will be disabled. ' +
        'Set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_JSON in your .env file.',
      );
      return null;
    }

    let serviceAccount: admin.ServiceAccount;

    if (serviceAccountJson) {
      // Parse from environment variable (useful for production/cloud deployments)
      serviceAccount = JSON.parse(serviceAccountJson);
    } else if (serviceAccountPath) {
      // Load from file path (useful for local development)
      // Resolve path relative to project root
      const resolvedPath = path.isAbsolute(serviceAccountPath)
        ? serviceAccountPath
        : path.resolve(process.cwd(), serviceAccountPath);
      serviceAccount = require(resolvedPath);
    }

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount!),
    });

    logger.log('Firebase Admin SDK initialized successfully');
    return firebaseApp;
  } catch (error) {
    logger.error('Failed to initialize Firebase Admin SDK:', error);
    logger.warn('Push notifications will be disabled');
    return null;
  }
};

export const getFirebaseApp = (): admin.app.App | null => {
  if (!firebaseApp) {
    return initializeFirebase();
  }
  return firebaseApp;
};
