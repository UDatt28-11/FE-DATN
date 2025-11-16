import React from 'react';
import { Navigate } from 'react-router-dom';
import { Result, Button } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requireAuth = true
}) => {
    const { isLoggedIn, loading } = useAuth();

    // Đợi kiểm tra trạng thái đăng nhập
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '60vh'
            }}>
                <div className="loading-spinner">Đang kiểm tra...</div>
            </div>
        );
    }

    // Nếu yêu cầu đăng nhập nhưng chưa đăng nhập
    if (requireAuth && !isLoggedIn) {
        return (
            <div style={{
                minHeight: '60vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 20px',
                background: '#f5f5f5'
            }}>
                <Result
                    status="warning"
                    icon={<LockOutlined style={{ color: '#cb8670' }} />}
                    title="Yêu cầu đăng nhập"
                    subTitle="Bạn cần đăng nhập để thực hiện đặt phòng và thanh toán."
                    extra={[
                        <Button
                            type="primary"
                            key="login"
                            onClick={() => window.location.href = '/'}
                            style={{
                                backgroundColor: '#cb8670',
                                borderColor: '#cb8670',
                            }}
                        >
                            Về trang chủ để đăng nhập
                        </Button>,
                    ]}
                />
            </div>
        );
    }

    // Nếu đã đăng nhập hoặc không yêu cầu đăng nhập
    return <>{children}</>;
};

export default ProtectedRoute;
