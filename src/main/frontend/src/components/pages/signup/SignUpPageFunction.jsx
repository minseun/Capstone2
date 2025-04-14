import React, {useState} from "react";
import SignUpPage from "./SignUpPage.jsx";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

/* 회원가입 기능
    - 기능1) 이메일 형식을 안나타내면 에러 메시지 띄우기
    - 기능2) 이메일 중복 검사
    - 기능3) 닉네임 입력안하면 자동으로 이름으로 채우기
    - 기능4) 생년월일 형식대로 안하면 에러 메시지 띄우기
    - 기능5) 이메일, 비번, 이름, 생년월일, 닉네임 필드 입력 안하면 회원가입 버튼 누르지못하도록 하기
    - 기능6) 비밀번호는 6자리 이상 입력해야한다.
    - 기능7) 비밀번호 이중 확인
 */

export const SignUpPageFunction = () => {

    // 페이지 이동 정의
    const navigate = useNavigate();

    // 이메일, 비번, 비번확인, 이름, 생년월일, 닉네임
    const [signUpForm, setSignUpForm] = useState({
        email: "",
        pw: "",
        pwConfirm: "",
        name: "",
        birth: "",
        nickName: ""
    });

    // 이메일, 비밀번호, 비밀번호 확인, 생년월일 유효성 검사 상태
    const [isValid, setIsValid] = useState({
        isEmail: false,
        isPw: false,
        isPwConfirm: false,
        isBirth: false,
        // isNickname: false => 얘 유효성 검사 상태는 안나타내도 될듯...?
    });

    // 오류메시지
    const [errorMessage, setErrorMessage] = useState({
        emailErrorMessage: "",
        pwErrorMessage: "",
        pwConfirmErrorMessage: "",
        birthErrorMessage: "",
        nicknameErrorMessage: ""
    });

    // 입력 값을 상태에 저장
    const handlerChange = (e) => {

        const {name,value} = e.target;
        setSignUpForm((prevState)=>({...prevState,[name] : value}));

        if(name==="email"){
            checkValidEmail(value);
        }
        else if (name==="pw"){
            checkValidPw(value);
        }
        else if (name==="pwConfirm"){
            checkValidConfirmPw(value);
        }
        else if (name==="birth"){
            checkValidBirth(value);
        }

        else if (name==="nickName") {
            checkValidNickname(value);
        }

    };


    // 이메일 유효성 검사 함수
    const checkValidEmail = (email) => {
        const emailRegex = /^[A-Za-z0-9_\.\-]+@[A-Za-z0-9\-]+\.[A-Za-z0-9\-]+/;

        // 이메일 형식 검사
        if(!emailRegex.test(email)){
            setIsValid(prevState => ({ ...prevState, isEmail: false }));
            setErrorMessage(prevState =>
                ({...prevState, emailErrorMessage: "이메일 형식으로 적어주세요."}));
        }
        else {
            setIsValid(prevState => ({ ...prevState, isEmail: true }));
            setErrorMessage(prevState => ({...prevState, emailErrorMessage: ''}));

        }
    };


    // 이메일 중복 검사
    const checkEmail = async () => {
        try {
            const emailResponse = await axios.post('/api/checkEmail', {
                email: signUpForm.email
            });

            if (emailResponse.status === 201) {
                alert("사용 가능한 이메일입니다.");

            }
        } catch (error) {
            if (error.response.status === 409 && error.response) {
                 alert("이미 사용 중인 이메일입니다.");
                setSignUpForm((prevState)=>({...prevState,email : ""}));

            } else {
                console.error("서버 요청 오류:", error);
                alert("오류가 발생했습니다.");

            }
        }
    };



    // 비밀번호 유효성 검사
    const checkValidPw = (pw) => {

        // 비번 글자수 검사
        if(pw.length<6){
            setIsValid(prevState => ({...prevState, isPw : false}));
            setErrorMessage(prevState =>
                ({...prevState, pwErrorMessage: "6자 이상 작성해주세요."}));
        }
        else {
            setIsValid(prevState => ({ ...prevState, isPw: true }));
            setErrorMessage(prevState => ({...prevState, pwErrorMessage: ''}));
        }
    };

    // 비밀번호 확인 유효성 검사
    const checkValidConfirmPw = (confirmPw) => {

        if(confirmPw !== signUpForm.pw) {
            setIsValid(prevState => ({...prevState, isPwConfirm : false}));
            setErrorMessage((prevState) =>
                ({...prevState,pwConfirmErrorMessage: "비밀번호가 일치하지 않습니다" }));
        }
        else {
            setIsValid(prevState => ({ ...prevState, isPwConfirm: true }));
            setErrorMessage((prevState=>({...prevState,pwConfirmErrorMessage: '' })));
        }
    };

    // 생년월일 유효성 검사
    const checkValidBirth = (birth) => {
        const birthRegex = /^\d{4}-\d{2}-\d{2}$/; // 년-월-일

        if(!birthRegex.test(birth)){
            setIsValid(prevState => ({...prevState, isBirth: false}));
            setErrorMessage(prevState =>
                ({...prevState, birthErrorMessage: "년-월-일 (xxxx-xx-xx)로 작성해주세요."}));
        }
        else {
            setIsValid(prevState => ({ ...prevState, isBirth: true }));
            setErrorMessage(prevState => ({...prevState, birthErrorMessage: ''}));
        }
    };

    // 닉네임 유효성 검사
    const checkValidNickname = (name, nickName) => {
        if(!nickName.trim()) {
            return name;
        }
        else {
            return nickName;
        }
    };



    // 회원가입 버튼
    const signUpBt = async (e) => {
        e.preventDefault();

        try {
            const signUpData = await axios.post("/api/signup", {
                email: signUpForm.email,
                pw: signUpForm.pw,
                name: signUpForm.name,
                birth: signUpForm.birth,
                nickName: signUpForm.nickName
            });

            if(signUpData.status===201) {
                alert("회원가입을 성공하였습니다.");
                navigate("/loginPage");
            }
        }
        catch (error) {
            console.error("서버 요청 오류", error);
            alert("회원가입에 실패했습니다. 다시 시도해주세요.");
        }
    };



    return (
        <SignUpPage
            signUpForm={signUpForm}
            handlerChange={handlerChange}
            errorMessage={errorMessage}
            checkEmail={checkEmail}
            signUpBt={signUpBt}
        />
    );
};

export default SignUpPageFunction;

