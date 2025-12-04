import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { message } from 'antd';
import { useAuth } from '../../context/AuthContext';
import { getDefaultDashboard } from '../../utils/permissions';

/**
 * Google OAuth Callback Handler
 * Xử lý callback và redirect ngay lập tức
 */
const GoogleCallback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { login } = useAuth();
    const hasProcessed = useRef(false);

    useEffect(() => {
        if (hasProcessed.current) return;
        hasProcessed.current = true;

        const handleCallback = async () => {
            try {
                const urlStatus = searchParams.get('status');
                const urlMessage = searchParams.get('message');
                const token = searchParams.get('token');
                const userDataEncoded = searchParams.get('user');
                const error = searchParams.get('error');

                // Lỗi -> về trang chủ với thông báo lỗi
                if (error || urlStatus === 'error') {
                    message.error(urlMessage || error || 'Đăng nhập Google thất bại');
                    navigate('/', { replace: true });
                    return;
                }

                // Thành công với token
                if (token && userDataEncoded) {
                    const userData = JSON.parse(atob(userDataEncoded));
                    login(userData, token);
                    message.success('Đăng nhập thành công!');
                    navigate(getDefaultDashboard(userData), { replace: true });
                    return;
                }

                // Fallback: code từ Google
                const code = searchParams.get('code');
                if (code) {
                    const role = localStorage.getItem('google_login_role') as 'user' | 'admin' | 'staff' || 'user';
                    localStorage.removeItem('google_login_role');

                    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
                    const response = await fetch(`${API_URL}/google/callback/${role}?code=${code}`, {
                        headers: { 'Accept': 'application/json' },
                    });
                    const data = await response.json();

                    if (data.user && data.token) {
                        login(data.user, data.token);
                        message.success('Đăng nhập thành công!');
                        navigate(getDefaultDashboard(data.user), { replace: true });
                        return;
                    }
                }

                // Không có gì -> về trang chủ
                message.error('Đăng nhập thất bại');
                navigate('/', { replace: true });

            } catch (error: any) {
                message.error(error.message || 'Có lỗi xảy ra');
                navigate('/', { replace: true });
            }
        };

        handleCallback();
    }, []);

    // Không render gì cả - chuyển trang ngay
    return null;
};

export default GoogleCallback;
