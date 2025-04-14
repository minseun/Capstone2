import React from 'react'
import { Notifications as Notification, Person2 as Profile } from '@mui/icons-material';

const NotificationIcon = ({sx}) => {
    return <Notification sx = {{marginRight: '10px', color:'gray', ...sx}} />;
};

const ProfileIcon = ({sx}) => {
    return <Profile sx = {{marginRight: '10px', color:'gray', ...sx}} />;
};

export {NotificationIcon, ProfileIcon};