'use client';

import { useEffect } from 'react';

import config from '@/core/config';

import { toast } from 'sonner';

const LogoutClientEffect = () => {
  useEffect(() => {
    const handleLogout = async () => {
      try {
        const response = await fetch('/api/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const result = await response.json();

        if (result?.success) {
          toast.success(result.success);
        }
        // This ensures a full page reload and clears all cached state
        setTimeout(() => {
          window.location.href = config.routes.login;
        }, 2000);
      } catch (error) {
        console.error('Logout error:', error);
        window.location.href = config.routes.login;
      }
    };

    handleLogout();
  }, []);

  return <></>;
};

export default LogoutClientEffect;
