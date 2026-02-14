import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        try {
            const response = await axios.post('/api/auth/login', { user_Id: userId, password });
            if (response.data.token) {
                localStorage.setItem('jwt_token', response.data.token);
                navigate('/');
            }
        } catch (error) {
            const message = error.response?.data?.message || '로그인에 실패했습니다.';
            setErrorMessage(message);
        }
    };

    const handleRegister = async (regUserId, regPassword, regName, regPhone) => {
        try {
            await axios.post('/api/auth/register', { user_Id: regUserId, password: regPassword, name: regName, phone: regPhone });
            alert('관리자 등록이 완료되었습니다.');
            setRegisterModalOpen(false);
        } catch (error) {
            const message = error.response?.data?.message || '등록에 실패했습니다.';
            alert(message);
        }
    };

    return (
        <div className="login-page-container">
            <div className="login-container">
                <h1>관리자 로그인</h1>
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label htmlFor="userId">아이디</label>
                        <input
                            type="text"
                            id="userId"
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            required
                            autoComplete="username"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">비밀번호</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                        />
                    </div>
                    <button type="submit">로그인</button>
                    <button type="button" className="register-btn" onClick={() => setRegisterModalOpen(true)}>
                        등록
                    </button>
                    {errorMessage && <div className="error-message">{errorMessage}</div>}
                </form>
            </div>
            {isRegisterModalOpen && (
                <RegisterModal
                    onClose={() => setRegisterModalOpen(false)}
                    onRegister={handleRegister}
                />
            )}
        </div>
    );
};

const RegisterModal = ({ onClose, onRegister }) => {
    const [regUserId, setRegUserId] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regName, setRegName] = useState('');
    const [regPhone, setRegPhone] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onRegister(regUserId, regPassword, regName, regPhone);
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <h2>관리자 등록</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="regName">이름</label>
                        <input
                            type="text"
                            id="regName"
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="regPhone">전화번호</label>
                        <input
                            type="tel"
                            id="regPhone"
                            value={regPhone}
                            onChange={(e) => setRegPhone(e.target.value)}
                            placeholder="010-1234-5678"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="regUserId">아이디</label>
                        <input
                            type="text"
                            id="regUserId"
                            value={regUserId}
                            onChange={(e) => setRegUserId(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="regPassword">비밀번호</label>
                        <input
                            type="password"
                            id="regPassword"
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="button-group">
                        <button type="submit" className="btn submit-btn">등록</button>
                        <button type="button" className="btn cancel-btn" onClick={onClose}>취소</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
