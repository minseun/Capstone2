import './App.css'
import React from 'react';
import { BrowserRouter as Router, Route, Routes} from "react-router-dom";
import SignUpPageFunction from "./components/pages/signup/SignUpPageFunction.jsx";
import LoginPageFunction from "./components/pages/login/LoginPageFunction.jsx";
import CalendarPage from "./components/pages/mypage/CalendarPage.jsx";



function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginPageFunction/>}/>
                <Route path="/SignUpPage" element={<SignUpPageFunction/>}/>
                <Route path="/LoginPage" element={<LoginPageFunction/>}/>
                <Route path="/CalendarPage" element={<CalendarPage />}/>
            </Routes>
        </Router>
    );
}

export default App;
