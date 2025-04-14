import React from 'react';
import { Home, Groups as Meeting, InsertEmoticon as User, Settings as Setting } from '@mui/icons-material';

const HomeIcon = ({ sx }) => {
    return <Home sx={{ marginRight: '10px', color: 'gray', ...sx }} />;
};

const MeetingIcon = ({ sx }) => {
    return <Meeting sx={{ marginRight: '10px', color: 'gray', ...sx }} />;
};

const UserIcon = ({ sx }) => {
    return <User sx={{ marginRight: '10px', color: 'gray', ...sx }} />;
};

const SettingIcon = ({ sx }) => {
    return <Setting sx={{ marginRight: '10px', color: 'gray', ...sx }} />;
};

export { HomeIcon, MeetingIcon, UserIcon, SettingIcon };