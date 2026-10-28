
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import { ThemeProvider } from './context/ThemeProvider'
import Home from './page/Home'
import Login from './page/Login'
import Dashboard from './page/Dashboard'
import Register from './page/Register'
import Transfer from './page/Transfer'
import History from "./page/History"
import { AuthControllerService, OpenAPI } from './api'
import { PublicRoute } from './context/PublicRoute'
import { ProtectedRoute } from './context/ProtectedRoute'
import isTokenExpired from './context/isTokenExpired'
function App() {
  OpenAPI.TOKEN = async (): Promise<string> => {
  
    const accessToken: string = localStorage.getItem("token") || "";
    const refreshToken: string = localStorage.getItem("refreshToken") || "";

    if (!accessToken) return "";

   
    if (isTokenExpired(accessToken)) {
      if (!refreshToken) {
        localStorage.clear();
        window.location.href = "/login";
        return "";
      }

      try {
        const response = await AuthControllerService.refresh({
          refreshToken: refreshToken
        });

        // Защищаем от ситуации, если бэк вернул пустой/undefined токен в объекте
        const newAccessToken: string = response.token || "";

        if (!newAccessToken) {
          throw new Error("Токен пустой");
        }

        localStorage.setItem("token", newAccessToken);
        return newAccessToken;

      } catch (error) {
        localStorage.clear();
        window.location.href = "/login";
        return "";
      }
    }

    return accessToken;
  };
  return (
    <>
      <ThemeProvider defaultTheme='dark'>
        <BrowserRouter>
          <Routes>
            <Route element={<PublicRoute />}>
              <Route path='/' element={<Home />} />
              <Route path='/login' element={<Login />} />
              <Route path='/register' element={<Register />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route path='/dashboard' element={<Dashboard />} />
              <Route path='/transfer' element={<Transfer />} />
              <Route path="/history" element={<History />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </>
  )
}

export default App
