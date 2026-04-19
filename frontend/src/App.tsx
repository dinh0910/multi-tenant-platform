import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { TenantProvider } from './contexts/TenantContext';
import { router } from './router';

export default function App() {
  return (
    <AuthProvider>
      <TenantProvider tenant={null}>
        <RouterProvider router={router} />
      </TenantProvider>
    </AuthProvider>
  );
}
