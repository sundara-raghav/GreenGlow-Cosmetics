import React ,{useContext, useRef}from 'react'
import search_image from '../assets/search_icon.svg'
import usda from '../assets/usda.jpg'
import natrue from '../assets/natrue1.png'
import ecocert from '../assets/ecocert.jpg'
import cosmos from '../assets/cosmos.jpg'
import { AppContext } from '../context/AppContext'

const Hero = () => {
  const{setSearchFilter,setIsSearched}=useContext(AppContext)
  const titleRef=useRef(null)
  const onSearch=()=>{
    setSearchFilter({
      product:titleRef.current.value
    })
    setIsSearched(true)
    
  }
  return (
    <div className='container 2xl:px-20 mx-auto my-10'>
      <div className='bg-gradient-to-r from-blue-700 to-blue-950 text-white py-16 text-center mx-2 rounded-xl '>
        <h2 className='text-2xl md:text-3xl lg:text-4xl font-medium mb-4'>Over 100+ products are successfully running in market </h2>
        <p className='mb-8 max-w-xl mx-auto text-sm font-light px-5'>Our Company is the one where women have historically made their mark,Our female founders, chemists and influencers are working together to create formulas that are not only effective but also safe, ethical, and environmentally friendly. </p>
        <div className='flex items-center justify-between bg-white rounded text-gray-600 max-w-xl pl-4 mx-4 sm:mx-auto'>
          <div className='flex items-center '>
            <img className='h-4 sm:h-5' src={search_image} alt="" />
            <input type="text" placeholder="Search for products" className='max-sm:text-xs p-2 rounded outline-none w-full' ref={titleRef}/>
          </div>
          <button onClick={onSearch} className='bg-blue-600 px-6 py-2 rounded text-white m-1'>Search</button>
        </div>
      </div>
      <div className='border border-gray-300 shadow-md mx-2 mt-5 p-6 rounded-md flex'>
        <div className='ml-6 flex justify-center gap-10 lg:gap-16 flex-wrap'>
          <p className='font-medium text-2xl'>Trusted by</p>
          <img className='h-15 w-15' src={usda} alt="" />
          <img className='h-15 w-15' src={natrue} alt="" />
          <img className='h-15 w-15' src={ecocert} alt="" />
          <img className='h-15 w-15' src={cosmos} alt="" />
        </div>
      </div>

    </div>
  )
}

export default Hero
