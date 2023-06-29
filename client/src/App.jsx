import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import LogIn from './Views/LogIn'
import Dashboard from './Views/Dashboard'
import CreateUser from './Views/CreateUser'
import UserDetails from './Views/UserDetails'

function App () {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<LogIn />} />
        <Route path='/home' element={<Dashboard />} />
        <Route path='/create' element={<CreateUser />} />
        <Route path='/user' element={<UserDetails />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
