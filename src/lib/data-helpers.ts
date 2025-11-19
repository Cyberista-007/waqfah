
import { Timestamp } from 'firebase/firestore';

// A function to convert Firestore Timestamps to serializable strings (ISO date strings).
// This is necessary because Next.js Server Components cannot pass non-serializable
// objects (like Timestamps) to Client Components.
export const toSerializable = (docData: any): any => {
    if (!docData) return docData;

    const data = { ...docData };
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            const value = data[key];
            if (value instanceof Timestamp) {
                // Convert Timestamp to ISO string
                data[key] = value.toDate().toISOString();
            } else if (Array.isArray(value)) {
                // Recursively process arrays
                data[key] = value.map(item => toSerializable(item));
            } else if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
                // Recursively process nested objects
                data[key] = toSerializable(value);
            }
        }
    }
    return data;
};
