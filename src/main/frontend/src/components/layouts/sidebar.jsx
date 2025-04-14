import React from 'react';
import { Box, List, ListItem, ListItemText, Button } from '@mui/material';
import { HomeIcon, MeetingIcon, UserIcon, SettingIcon } from '../sidebar/sidebar-icon.jsx'; // 아이콘 임포트

const Sidebar = () => {
    return (
        <Box
            sx={{
                width: 200,
                height: '100vh',
                backgroundColor: '#def6fa',
                color: 'dark-gray',
                paddingTop: '30px',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <List>
                {[
                    { icon: <HomeIcon sx={{ fontSize: 40 }} />, text: "마이페이지" },
                    { icon: <MeetingIcon sx={{ fontSize: 40 }} />, text: "회의 채널" },
                    { icon: <UserIcon sx={{ fontSize: 40 }} />, text: "친구 목록" },
                    { icon: <SettingIcon sx={{ fontSize: 40 }} />, text: "환경 설정" },
                ].map((item, index) => (
                    <React.Fragment key={index}>
                        <ListItem button sx={{ '&:hover': { backgroundColor: '#e0f7fa' }, display:'flex', alignItems:'center' }} >
                            <Box
                                sx={{
                                    display:'flex',
                                    flexDirection:'column',
                                    alignItems:'center',
                                    justifyContent:'center',
                                    width:'100%',
                                    height:'100px'
                                }} >

                                {React.cloneElement(item.icon)} {/* 아이콘 크기 조정 */}
                                <ListItemText primary={item.text} sx={{ marginLeft: 0 }} />
                            </Box>
                        </ListItem>
                    </React.Fragment>
                ))}
            </List>

            {/*<Box sx={{ display: 'flex', justifyContent: 'center', paddingBottom: '10px', paddingTop: '50px' }}>*/}
            {/*    <Button*/}
            {/*        variant="contained"*/}
            {/*        sx={{*/}
            {/*            width: '80%',*/}
            {/*            backgroundColor: 'white',*/}
            {/*            color: 'black'*/}
            {/*        }}*/}
            {/*    >*/}
            {/*        Logout*/}
            {/*    </Button>*/}
            {/*</Box>*/}
        </Box>
    );
};

export default Sidebar;
