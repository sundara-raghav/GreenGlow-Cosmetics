import React, { createContext, useEffect, useState } from 'react';
import { db } from '../firebase'; 
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore'; 

export const AppContext = createContext();

export const AppContextProvider = (props) => {
  const [searchFilter, setSearchFilter] = useState({ product: '' });
  const [isSearched, setIsSearched] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [showRecruiterLogin,setShowRecruiterLogin]=useState(false)

  const fetchJobs = async () => {
    try {
      const jobsCollection = collection(db, 'jobs');
      const snapshot = await getDocs(jobsCollection);
      const jobsList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setJobs(jobsList);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const addJob = async (newJob) => {
    try {
      const jobsCollection = collection(db, 'jobs');
      const docRef = await addDoc(jobsCollection, newJob);
      setJobs((prevJobs) => [...prevJobs, { id: docRef.id, ...newJob }]);
    } catch (error) {
      console.error('Error adding job:', error);
    }
  };


  const deleteJob = async (id) => {
    try {
      await deleteDoc(doc(db, 'jobs', id));
      setJobs((prevJobs) => prevJobs.filter((job) => job.id !== id));
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const value = {
    setSearchFilter,
    searchFilter,
    isSearched,
    setIsSearched,
    jobs,
    setJobs,
    addJob,
    deleteJob,
    showRecruiterLogin,
    setShowRecruiterLogin,
  };

  return <AppContext.Provider value={value}>{props.children}</AppContext.Provider>;
};