import { Outlet } from 'react-router-dom'


function ProtectedRoute() {

    const isAuthenticated = localStorage.getItem('connexion');

    if (!isAuthenticated) {
        window.location.href = '/login';
        return null;
    }
    return <Outlet />;
        
}

export default ProtectedRoute