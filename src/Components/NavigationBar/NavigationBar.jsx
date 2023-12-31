import React, { useState, useEffect, useContext } from 'react';
import { AppBar, IconButton, Toolbar, Drawer, Button, Avatar, useMediaQuery } from '@mui/material';
import { Menu, AccountCircle, Brightness4, Brightness7 } from '@mui/icons-material';
import { NavLink } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { useDispatch, useSelector } from 'react-redux';

import { setUser, userSelector } from '../../features/auth';
import useStyles from './styles';
import { Sidebar, Search } from '..';
import { fetchToken, createSessionId, moviesApi } from '../../utils';
import { ColorModeContext } from '../../utils/ToggleColoMode';

const NavigationBar = () => {
  const classes = useStyles();
  const isMobile = useMediaQuery('(max-width:600px)');
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector(userSelector);
  
  const token = localStorage.getItem('request_token');
  const sessionIdFromLocalStorage = localStorage.getItem('session_id');

  const colorMode = useContext(ColorModeContext);

  useEffect(() => {
    const logInUser = async () => {
      if (token) {
        if (sessionIdFromLocalStorage){
          const { data: userData } = await moviesApi.get(`/account?session_id=${sessionIdFromLocalStorage}`);
          dispatch(setUser(userData));
        } else {
          const sessionId = await createSessionId();
          const { data: userData } = await moviesApi.get(`/account?session_id=${sessionId}`);
          dispatch(setUser(userData));
        }
      }
    }

    logInUser();

  }, [token])
  

   return (
    <>
      <AppBar position='fixed'>
        <Toolbar className={classes.toolbar}>
          { isMobile && (
            <IconButton 
              color='inherit' 
              edge='start' 
              style={{ outline: 'none' }}
              onClick={()=>setMobileOpen((prevMobileOpen) => !prevMobileOpen)}
              className={classes.menuButton}
              >
              <Menu></Menu>
            </IconButton>
          )}
          <IconButton color='inherit' sx={{ ml: 1 }} onClick={colorMode.toggleColorMode}>
            { theme.palette.mode === 'dark' ? <Brightness7></Brightness7> : <Brightness4></Brightness4> }
          </IconButton>
          { !isMobile && <Search></Search> }
          <div>
            {!isAuthenticated ? (
              <Button color='inherit' onClick={fetchToken}>
                Login &nbsp; <AccountCircle></AccountCircle>
              </Button>
            ) : (
              <Button color='inherit' 
                component={NavLink} to={`/profile/${user.id}`}
                className={classes.linkButton} onClick={()=>{}}
              >
                {!isMobile && <>My Movies &nbsp;</>}
                <Avatar
                  style={{ width:30, height:30 }}
                  alt='Profile'
                  src={`https://www.themoviedb.org/t/p/w64_and_h64_face${user?.avatar?.tmdb?.avatar_path}`}
                />
              </Button>
            )}
          </div>
          { isMobile && <Search></Search> }
        </Toolbar>
      </AppBar>
      <div>
        <nav className={classes.drawer}>
          { isMobile ? (
            <Drawer
              variant='temporary'
              anchor='right'
              open={ mobileOpen }
              onClose={()=>setMobileOpen((prevMobileOpen) => !prevMobileOpen)}
              classes={{ paper: classes.drawerPaper }}
              ModalProps={{ keepMounted: true}}
            >
              <Sidebar setMobileOpen={setMobileOpen}></Sidebar>
            </Drawer>
          ) : (
            <Drawer classes={{ paper: classes.drawerPaper }} variant='permanent' open>
              <Sidebar setMobileOpen={setMobileOpen}></Sidebar>
            </Drawer>
          )}
        </nav>
      </div>
    </>
  )
}

export default NavigationBar
