import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Spin, Result, Button } from 'antd';
import { LoadingOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { getDefaultDashboard } from '../../utils/permissions';

/**
 * Google OAuth Callback Handler
 * Xử lý callback từ Google sau khi user đăng nhập
 * 
 * Flow:
 * 1. User click "Đăng nhập bằng Google"
 * 2. Redirect đến Google OAuth
 * 3. Google redirect về `/auth/google/callback?code=xxx&role=user`
 * 4. Component này gọi BE callback API
 * 5. Lưu token và redirect đến dashboard
 */
const GoogleCallback: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { login } = useAuth();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Đang xử lý đăng nhập Google...');

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Lấy code và state từ URL params
                const code = searchParams.get('code');
                const state = searchParams.get('state');
                const error = searchParams.get('error');

                // Kiểm tra lỗi từ Google
                if (error) {
                    setStatus('error');
                    setMessage('Đăng nhập Google bị hủy hoặc lỗi.');
                    return;
                }

                if (!code) {
                    setStatus('error');
                    setMessage('Không nhận được mã xác thực từ Google.');
                    return;
                }

                // Lấy role từ state (nếu có)
                let role: 'user' | 'admin' | 'staff' = 'user';
                if (state) {
                    try {
                        const stateData = JSON.parse(decodeURIComponent(state));
                        role = stateData.role || 'user';
                    } catch (e) {
                        console.error('Parse state error:', e);
                    }
                }

                // Lấy role từ localStorage (backup)
                const storedRole = localStorage.getItem('google_login_role') as 'user' | 'admin' | 'staff' | null;
                if (storedRole) {
                    role = storedRole;
                    localStorage.removeItem('google_login_role');
                }

                // Gọi callback API
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
                const callbackUrl = `${API_URL}/${role}/google/callback?${searchParams.toString()}`;
                
                const response = await fetch(callbackUrl, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                });

                const data = await response.json();

                if (!response.ok || !data.status) {
                    throw new Error(data.message || 'Đăng nhập Google thất bại');
                }

                // Lưu token và user data
                if (data.user && data.token) {
                    login(data.user, data.token);
                    setStatus('success');
                    setMessage(data.message || 'Đăng nhập Google thành công!');

                    // Redirect sau 1.5s
                    setTimeout(() => {
                        const dashboard = getDefaultDashboard(data.user);
                        navigate(dashboard);
                    }, 1500);
                } else {
                    throw new Error('Dữ liệu không hợp lệ từ server');
                }
            } catch (error: any) {
                console.error('Google callback error:', error);
                setStatus('error');
                setMessage(error.message || 'Có lỗi xảy ra khi đăng nhập Google');
            }
        };

        handleCallback();
    }, [searchParams, login, navigate]);

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
        >
            {status === 'loading' && (
                <div style={{ textAlign: 'center', color: 'white' }}>
                    <Spin
                        indicator={<LoadingOutlined style={{ fontSize: 48, color: 'white' }} spin />}
                    />
                    <div style={{ marginTop: 24, fontSize: 18, fontWeight: 500 }}>
                        {message}
                    </div>
                    <div style={{ marginTop: 12, fontSize: 14, opacity: 0.8 }}>
                        Vui lòng đợi một chút...
                    </div>
                </div>
            )}

            {status === 'success' && (
                <Result
                    icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                    title={<span style={{ color: 'white' }}>{message}</span>}
                    subTitle={
                        <span style={{ color: 'rgba(255,255,255,0.8)' }}>
                            Đang chuyển hướng đến trang chủ...
                        </span>
                    }
                />
            )}

            {status === 'error' && (
                <Result
                    icon={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
                    title={<span style={{ color: 'white' }}>Đăng nhập thất bại</span>}
                    subTitle={<span style={{ color: 'rgba(255,255,255,0.8)' }}>{message}</span>}
                    extra={[
                        <Button
                            key="home"
                            type="primary"
                            size="large"
                            onClick={() => navigate('/')}
                            style={{
                                background: 'white',
                                color: '#667eea',
                                border: 'none',
                            }}
                        >
                            Về trang chủ
                        </Button>,
                        <Button
                            key="retry"
                            size="large"
                            onClick={() => window.location.reload()}
                            style={{
                                background: 'transparent',
                                color: 'white',
                                borderColor: 'white',
                            }}
                        >
                            Thử lại
                        </Button>,
                    ]}
                />
            )}
        </div>
    );
};

export default GoogleCallback;

