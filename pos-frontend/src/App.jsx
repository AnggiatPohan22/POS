import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Home, Tables, Orders, Menu, Auth, Dashboard } from './pages';
import Header from './components/shared/Header';
import { useSelector } from "react-redux";
import useLoadData from "./hooks/useLoadData";
import FullScreenLoader from "./components/shared/FullScreenLoader";

function Layout() {
  const location = useLocation();
  const isLoading = useLoadData();
  const hideHeaderRoutes = ["/auth"];
  const {isAuth} = useSelector(state => state.user);

  if(isLoading) return <FullScreenLoader />

  return (
    <>
      {!hideHeaderRoutes.includes(location.pathname) && <Header />}
        <Routes>
          <Route path="/" element={
            <ProtectRoutes>
              <Home />
            </ProtectRoutes>
          } />
          <Route path="/Auth" element={isAuth ? <Navigate to={"/"} /> : <Auth />} />
          <Route path="/Orders" element={
            <ProtectRoutes>
              <Orders />
            </ProtectRoutes>
          } />
          <Route path="/Tables" element={
            <ProtectRoutes>
              <Tables />
            </ProtectRoutes>
          } />
          <Route path="/Menu" element={
            <ProtectRoutes>
              <Menu />
            </ProtectRoutes>
          } />
          <Route path="/Dashboard" element={
            <ProtectRoutes>
              <Dashboard />
            </ProtectRoutes>
          } />
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </>
  )
}

function ProtectRoutes({children}){  // function ini mengkunci page lain selain dari halaman login nya
  const {isAuth} = useSelector(state => state.user);
  if(!isAuth){
    return <Navigate to={"/auth"} />
  }

  return children;
}

function App() {
return (
  <Router>
    <Layout />
  </Router>
)
  
}

export default App
