import React from "react";
import './SignUpPage.css'

export const SignUpPage = ({ signUpForm, handlerChange, errorMessage, checkEmail, signUpBt }) => {
    return (
        <form onSubmit={signUpBt}>
            <div className="content">
                <label className="input-label">이메일</label>
                <input
                    type="text"
                    name="email"
                    value={signUpForm.email}
                    placeholder="이메일 형식으로 작성"
                    onChange={handlerChange}
                    className="input-style"
                />
                {errorMessage.emailErrorMessage && <div className="error-message">{errorMessage.emailErrorMessage}</div>}
            </div>
            <button
                type="button"
                onClick={checkEmail}
            >중복확인</button>

            <div className="content">
                <label className="input-label">비밀번호</label>
                <input
                    type="password"
                    name="pw"
                    value={signUpForm.pw}
                    placeholder="6자리 이상 작성"
                    onChange={handlerChange}
                    className="input-style"
                />
                {errorMessage.pwErrorMessage && <div className="error-message">{errorMessage.pwErrorMessage}</div>}
            </div>
            <div className="content">
                <label className="input-label">비밀번호 확인</label>
                <input
                    type="password"
                    name="pwConfirm"
                    value={signUpForm.pwConfirm}
                    onChange={handlerChange}
                    className="input-style"
                />
                {errorMessage.pwConfirmErrorMessage && <div className="error-message">{errorMessage.pwConfirmErrorMessage}</div>}
            </div>
            <div className="content">
                <label className="input-label">이름</label>
                <input
                    type="text"
                    name="name"
                    value={signUpForm.name}
                    onChange={handlerChange}
                    className="input-style"
                />
            </div>
            <div className="content">
                <label className="input-label">생년월일</label>
                <input
                    type="text"
                    name="birth"
                    value={signUpForm.birth}
                    placeholder="yyyy-mm-dd"
                    onChange={handlerChange}
                    className="input-style"
                />
                {errorMessage.birthErrorMessage && <div className="error-message">{errorMessage.birthErrorMessage}</div>}
            </div>
            <div className="content">
                <label className="input-label">닉네임 (입력안할 시 "이름"으로 자동 부여됩니다.) </label>
                <input
                    type="text"
                    name="nickName"
                    value={signUpForm.nickName}
                    onChange={handlerChange}
                    className="input-style"
                />
            </div>
            <div className="content">
                <button className="join-button"
                        type="submit"
                        disabled={!signUpForm.email || !signUpForm.pw || !signUpForm.name || !signUpForm.birth}
                >회원가입</button>
            </div>
        </form>
    );
};

export default SignUpPage;
