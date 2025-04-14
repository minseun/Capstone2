import React, {useState} from "react";
import axios from "axios";
import LoginPage from "./LoginPage.jsx";
import {useNavigate} from "react-router-dom";

export const LoginPageFunction = () => {

    // 페이지 이동 정의
    const navigate = useNavigate();

    // 이메일, 비번
    const [email, setEmail] = useState("");
    const [pw, setPw] = useState("");

    // 이메일 유효성 검사 상태
    const [isEmail, setIsEmail] = useState(false);

    // 오류메시지
    const [errorMessage, setErrorMessage] = useState("");


    // email 필드 값이 바뀔때마다 호출되는 함수
    const handlerEmail = (e) => {
        const emailValue = e.target.value;
        setEmail(emailValue);
        emailForm(emailValue);
    };


    // 이메일 유효성 검사 함수
    const emailForm = (email) => {
        const emailRegex = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/;

        if(!emailRegex.test(email)){
            setIsEmail(false);
            setErrorMessage("이메일 형식으로 적어주세요.");
        }
        else{
            setIsEmail(true);
            setErrorMessage('');
        }
    };

    // pw 필드 값이 바뀔때마다 호출되는 함수
    const handlerPw =(e) => {
        setPw(e.target.value);
    };

    // 로그인 버튼 함수
    const loginButton = async (e) => {
        e.preventDefault();

        try {
            const loginResponse = await axios.post("/api/login", {
                email: email,
                pw: pw
            });


            if(loginResponse.status === 200) { // 백엔드로부터 받기
                alert("로그인 성공");
                navigate("/CalendarPage")
            }

        }
        catch (error) {
            if (error.loginResponse.status === 401) { // 백엔드로부터 받기
                alert("아이디 또는 비밀번호가 잘못 되었습니다. 아이디와 비밀번호를 정확히 입력해 주세요.")
            }
            else{
                console.error("서버 요청 오류", error);
                alert("서버 요청 오류");
            }
        }
    };

    const signUpNavigate = () => {
        navigate("/signUpPage");
    }


    return (
        <LoginPage
            email={email}
            pw={pw}
            handlerEmail={handlerEmail}
            handlerPw={handlerPw}
            errorMessage={errorMessage}
            loginButton={loginButton}
            signUpNavigate={signUpNavigate}
        />
    );
};

export default LoginPageFunction;