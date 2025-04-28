// src/uploadToFirestore.js
import { db } from './firebase';
import { collection, addDoc } from 'firebase/firestore';
import { jobsData } from './assets/assets';

const uploadData = async () => {
  try {
    const jobsCollection = collection(db, 'jobs');
    for (const job of jobsData) {
      await addDoc(jobsCollection, job);
      console.log(`Uploaded: ${job.product}`);
    }
    console.log('All data uploaded successfully!');
  } catch (error) {
    console.error('Error uploading data: ', error);
  }
};

uploadData();