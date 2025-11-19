
import { Timestamp } from 'firebase/firestore';

export const toSerializable = (docData: any) => {
    if (!docData) return docData;

    const data = { ...docData };
    for (const key in data) {
        if (data[key] instanceof Timestamp) {
            data[key] = data[key].toDate().toISOString();
        } else if (Array.isArray(data[key])) {
            // Firestore Timestamps can be nested in arrays of objects.
            data[key] = data[key].map((item: any) => 
                typeof item === 'object' && item !== null ? toSerializable(item) : item
            );
        } else if (typeof data[key] === 'object' && data[key] !== null) {
            // Firestore Timestamps can be nested in objects.
            data[key] = toSerializable(data[key]);
        }
    }
    return data;
};
