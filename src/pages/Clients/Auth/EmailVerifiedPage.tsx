import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { message } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const EmailVerifiedPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');
  const errorMessage = searchParams.get('message');

  useEffect(() => {
    // Hiển thị thông báo dựa trên status
    if (status === 'success') {
      message.success({
        content: 'Xác thực email thành công! Vui lòng đăng nhập để tiếp tục.',
        duration: 3,
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      });
      
      // Redirect về trang chủ với query param để Header tự động mở login modal
      // Delay một chút để user thấy thông báo
      const timer = setTimeout(() => {
        navigate('/?showLogin=true&emailVerified=success', { replace: true });
      }, 1500);
      
      return () => clearTimeout(timer);
    } else if (status === 'already') {
      message.info({
        content: 'Email đã được xác thực trước đó. Vui lòng đăng nhập.',
        duration: 3,
      });
      
      // Redirect về trang chủ với query param để Header tự động mở login modal
      const timer = setTimeout(() => {
        navigate('/?showLogin=true&emailVerified=already', { replace: true });
      }, 1500);
      
      return () => clearTimeout(timer);
    } else if (status === 'error') {
      message.error({
        content: errorMessage || 'Có lỗi xảy ra khi xác thực email.',
        duration: 4,
        icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
      });
      
      // Redirect về trang chủ sau khi hiển thị lỗi
      const timer = setTimeout(() => {
        navigate('/', { replace: true });
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [status, errorMessage, navigate]);

  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        background: '#f5f5f5',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          maxWidth: '500px',
        }}
      >
        {status === 'success' ? (
          <>
            <CheckCircleOutlined
              style={{
                fontSize: '64px',
                color: '#52c41a',
                marginBottom: '20px',
              }}
            />
            <h2 style={{ marginBottom: '16px', color: '#363636' }}>
              Xác thực email thành công!
            </h2>
            <p style={{ color: '#666', marginBottom: '24px' }}>
              Tài khoản của bạn đã được xác thực. Đang chuyển đến trang đăng nhập...
            </p>
          </>
        ) : status === 'already' ? (
          <>
            <CheckCircleOutlined
              style={{
                fontSize: '64px',
                color: '#1890ff',
                marginBottom: '20px',
              }}
            />
            <h2 style={{ marginBottom: '16px', color: '#363636' }}>
              Email đã được xác thực
            </h2>
            <p style={{ color: '#666', marginBottom: '24px' }}>
              Email này đã được xác thực trước đó. Đang chuyển đến trang đăng nhập...
            </p>
          </>
        ) : status === 'error' ? (
          <>
            <CloseCircleOutlined
              style={{
                fontSize: '64px',
                color: '#ff4d4f',
                marginBottom: '20px',
              }}
            />
            <h2 style={{ marginBottom: '16px', color: '#363636' }}>
              Xác thực email thất bại
            </h2>
            <p style={{ color: '#666', marginBottom: '24px' }}>
              {errorMessage || 'Có lỗi xảy ra khi xác thực email. Vui lòng thử lại.'}
            </p>
          </>
        ) : (
          <>
            <h2 style={{ marginBottom: '16px', color: '#363636' }}>
              Đang xử lý...
            </h2>
            <p style={{ color: '#666', marginBottom: '24px' }}>
              Vui lòng đợi trong giây lát.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default EmailVerifiedPage;

