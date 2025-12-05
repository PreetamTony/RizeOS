import dotenv from 'dotenv';
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

dotenv.config();

// Initialize Firebase Admin
try {
    let serviceAccount;

    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        try {
            serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            console.log('Firebase Service Account parsed successfully from env var');
        } catch (parseError) {
            console.error('Error parsing FIREBASE_SERVICE_ACCOUNT JSON:', parseError.message);
        }
    } else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
        try {
            const serviceAccountPath = path.resolve(process.cwd(), process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
            if (fs.existsSync(serviceAccountPath)) {
                const fileContent = fs.readFileSync(serviceAccountPath, 'utf8');
                serviceAccount = JSON.parse(fileContent);
                console.log('Firebase Service Account loaded from file:', serviceAccountPath);
            } else {
                console.error('Service account file not found at:', serviceAccountPath);
            }
        } catch (fileError) {
            console.error('Error loading service account from path:', fileError);
        }
    }

    if (serviceAccount) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('Firebase Admin initialized with service account');
    } else {
        console.warn('No valid service account found. Initializing with default credentials (ADC).');
        console.warn('Set FIREBASE_SERVICE_ACCOUNT or FIREBASE_SERVICE_ACCOUNT_PATH in .env to avoid this.');
        admin.initializeApp();
    }

} catch (error) {
    console.error('Firebase Admin initialization error:', error);
    // Prevent crash, but functionality will be broken
    if (admin.apps.length === 0) {
        try {
            admin.initializeApp();
        } catch (e) {
            console.error('Failed fallback initialization:', e);
        }
    }
}

export default admin;
