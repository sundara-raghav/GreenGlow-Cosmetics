import React, { useContext, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import JobListing from '../components/JobListing'
import AppDownload from '../components/AppDownload'
import Footer from '../components/Footer'
import { AppContext } from '../context/AppContext'

const Home = () => {
  const { loggedInUser, refreshUserData } = useContext(AppContext);
  
  // Refresh user data when component mounts
  useEffect(() => {
    if (loggedInUser && loggedInUser.email) {
      console.log('Home - Refreshing user data for:', loggedInUser.email);
      refreshUserData(loggedInUser.email);
    }
  }, []);
  
  return (
    <div>
      <Navbar/>
      <Hero/>
      <JobListing/>
      <AppDownload/>
      <Footer/>
    </div>
  )
}

export default Home
