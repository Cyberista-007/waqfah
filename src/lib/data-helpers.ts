
import { Timestamp } from 'firebase/firestore';

export const toSerializable = (docData: any) => {
    if (!docData) return docData;

    const data = { ...docData };
    for (const key in data) {
        if (data[key] instanceof Timestamp) {
            data[key] = data[key].toDate().toISOString();
        }
    }
    return data;
};
