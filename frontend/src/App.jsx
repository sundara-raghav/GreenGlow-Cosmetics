import React, { useContext, useState, useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import ApplyJob from './pages/ApplyJob'
import Applications from './pages/Applications'
import AdminDashboard from './pages/Admindashboard'
import SellerDashboard from './pages/SellerDashboard'
import RecruiterLogin from './components/RecruiterLogin'
import { AppContext } from './context/AppContext'
import Cart from './pages/Cart'
import CustomerLogin from './pages/CustomerLogin'
import MyOrders from './pages/MyOrders'
import AdminOrdersPage from './pages/AdminOrdersPage'

const App = () => {
  const { showRecruiterLogin, loggedInUser, refreshUserData } = useContext(AppContext)
  const [loginType, setLoginType] = useState('admin') // 'admin' or 'seller'
  
  // Refresh user data on app load
  useEffect(() => {
    console.log('App - Checking for logged in user');
    if (loggedInUser && loggedInUser.email) {
      console.log('App - Refreshing user data for:', loggedInUser.email);
      refreshUserData(loggedInUser.email);
    }
  }, []);
  
  const handleLoginTypeChange = (type) => {
    setLoginType(type)
  }
  
  return (
    <div>
      {showRecruiterLogin && (
        <div className="fixed top-0 left-0 right-0 bottom-0 z-50 backdrop-blur-sm bg-black/40 flex flex-col justify-center items-center p-4">
          <div className="bg-white p-6 rounded-xl mb-4 flex gap-4 shadow-lg">
            <button 
              onClick={() => handleLoginTypeChange('admin')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                loginType === 'admin' 
                  ? 'bg-blue-500 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Admin Login
            </button>
            <button 
              onClick={() => handleLoginTypeChange('seller')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                loginType === 'seller' 
                  ? 'bg-blue-500 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Seller Login
            </button>
          </div>
          <RecruiterLogin loginType={loginType} />
        </div>
      )}
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/apply-job/:id' element={<ApplyJob/>}/>
        <Route path='/applied-panel' element={<Applications/>}/>
        <Route path='/admin' element={<AdminDashboard/>}/>
        <Route path='/seller' element={<SellerDashboard/>}/>
        <Route path="/cart" element={<Cart />} />
        <Route path='/customer-login' element={<CustomerLogin />} />
        <Route path='/my-orders' element={<MyOrders />} />
        <Route path='/admin-orders' element={<AdminOrdersPage />} />
      </Routes>
    </div>
  )
}

export default App