import React,{useContext} from 'react'
import logo from '../assets/logo.jpg'// Defaults to 400 weight
import {useClerk,UserButton,useUser} from '@clerk/clerk-react'
import { Link, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
const Navbar = () => {
    const{openSignIn}=useClerk()
    const {user}=useUser()
    const navigate=useNavigate()
    const {setShowRecruiterLogin}=useContext(AppContext)
  return (
    <div className='shadow py-4 bg-white'>
      <div className='container px-4 2xl:px-20 mx-auto flex justify-between items-center'>
     
        <img onClick={()=>navigate('/')} src={logo} className='w-50 h-20 '/>
        {
            user?<div className='flex items-center gap-3'>
              <Link to='/cart'>View cart</Link>
                <p>|</p>
                <p className='max-sm:hidden'>Hi, {user.firstName+" "+user.lastName}</p>
                <UserButton/>
            </div>:
            <div className='flex gap-4 max-sm:text-xs'>
        <button onClick={e=>openSignIn()} className='bg-blue-500 text-white px-6 sm:px-9 py-2 rounded-full'>Login</button>
        <button onClick={e=>setShowRecruiterLogin(true)} className='text-gray-600'>Sales Login</button>  
        </div>
        }
        
       
      </div>
    </div>
  )
}

export default Navbar