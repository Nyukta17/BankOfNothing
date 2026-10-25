
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import { ThemeProvider } from './context/ThemeProvider'
import Home from './page/Home'
import Login from './page/Login'
import Dashboard from './page/Dashboard'
function App() {
  
  return (
    <>
      <ThemeProvider defaultTheme='dark'>
          <BrowserRouter>
            <Routes>
              <Route path='/' element={<Home/>}/>
              <Route path='/login' element={<Login/>}/>
              <Route path='/dashboard' element={<Dashboard/>}/>
            </Routes>
          </BrowserRouter>
      </ThemeProvider>
    </>
  )
}

export default App
