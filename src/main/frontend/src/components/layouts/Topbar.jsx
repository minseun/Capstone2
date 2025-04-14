import React from 'react';
import {Box, List, ListItem} from "@mui/material";
import {NotificationIcon, ProfileIcon} from '../sidebar/Topbar-icon.jsx'

const Topbar = () => {

    /*
    const openTopbarMenu = () => setOpenTopbarMenu(true);
    const closeTopbarMenu = () => setCloseTopbarMenu(false);

    const logout = () => {
        console.log("로그아웃");
        // 로그인 페이지로 이동
    };

    const profile = () => {
        // 프로필 페이지로 이동
    }
     */

    return (
        <Box
            sx={{
                width: '100%',
                height: '6vh',
                backgroundColor: '#def6fa',
                position: 'fixed', // 스크롤해도 이동 안함
                color: 'dark-gray',
                zIndex: 1000,
                display: 'flex',
                justifyContent: 'flex-end',
                paddingTop: 1
            }}
        >
            <List sx={{ display: 'flex' }}>
                {[
                    { icon: <NotificationIcon sx={{ fontSize: 40 }} /> },
                    { icon: <ProfileIcon sx={{ fontSize: 40 }} /> }
                ].map((item, index) => (
                    <React.Fragment key={index}>
                        <ListItem button sx={{ '&:hover': { backgroundColor: '#e0f7fa' }, marginRight: 5 }} >
                            <Box
                                sx={{
                                    display:'flex',
                                    alignItems: 'center'
                                }} >
                                {React.cloneElement(item.icon)}
                            </Box>
                        </ListItem>
                    </React.Fragment>
                ))}
            </List>
        </Box>
    );
};
export default Topbar;