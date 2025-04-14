import React from "react";
import './LoginPage.css'

export const LoginPage = ({ email, pw, handlerEmail, handlerPw, errorMessage, loginButton, signUpNavigate}) => {
    return (
        <form onSubmit={loginButton}>
            <div className="content">
                <label className="input-label">이메일(아이디)</label>
                <input
                    type="text"
                    placeholder="이메일 형식으로 작성"
                    value={email}
                    onChange={handlerEmail}
                    className="input-style"
                />
                {errorMessage && <div className="error-message">{errorMessage}</div>}
            </div>
            <div>
                <label className="input-label">비밀번호</label>
                <input
                    type="password"
                    value={pw}
                    onChange={handlerPw}
                    className="input-style"
                />
            </div>
            <div className="content">
                <button className="login-button"
                        type="submit"
                        disabled={!email || !pw}
                >로그인</button>
            </div>
            <button
                type="button"
                onClick={signUpNavigate}
            >회원가입</button>
        </form>
    );
};

export default LoginPage;