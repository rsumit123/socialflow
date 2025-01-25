import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';

const Profile = () => {
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (isAuthenticated) {
        const token = await getAccessTokenSilently();
        const response = await axios.get('http://localhost:5000/api/private', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProfile(response.data);
      }
    };
    fetchProfile();
  }, [isAuthenticated, getAccessTokenSilently]);

  return (
    isAuthenticated && profile && (
      <div>
        <h2>Profile</h2>
        <p>Email: {profile.email}</p>
        <p>Member since: {new Date(profile.created_at).toLocaleDateString()}</p>
      </div>
    )
  );
};

export default Profile;
