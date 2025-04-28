import React, { useContext } from 'react'
import {Route,Routes} from 'react-router-dom'
import Home from './pages/Home'
import ApplyJob from './pages/ApplyJob'
import Applications from './pages/Applications'
import AdminDashboard from './pages/Admindashboard'
import RecruiterLogin from './components/RecruiterLogin'
import { AppContext } from './context/AppContext'
import Cart from './pages/Cart'
const App = () => {
  const {showRecruiterLogin}=useContext(AppContext)
  return (
    <div>
      {showRecruiterLogin&&<RecruiterLogin/>}
      <Routes>
      <Route path='/' element={<Home/>}/>
      <Route path='/apply-job/:id' element={<ApplyJob/>}/>
      <Route path='/applied-panel' element={<Applications/>}/>
      <Route path='/admin' element={<AdminDashboard/>}/>
      <Route path="/cart" element={<Cart />} />
      </Routes>
    </div>
  )
}

export default App