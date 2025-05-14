import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminPanel = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the admin application
    window.location.href = '/admin';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-xl">Redirecting to Admin Panel...</div>
    </div>
  );
};

export default AdminPanel;