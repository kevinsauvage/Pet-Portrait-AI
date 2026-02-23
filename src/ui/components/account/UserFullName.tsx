'use client';

import useUserContext from '@/contexts/UserContext/useUserContext';

const UserFullName = () => {
  const { user } = useUserContext();
  const { firstName, lastName } = user || {};

  return (
    <b>
      {firstName} {lastName}
    </b>
  );
};

export default UserFullName;
