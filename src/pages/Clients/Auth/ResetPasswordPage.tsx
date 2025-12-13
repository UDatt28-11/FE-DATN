import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { message } from 'antd';
import ResetPasswordModal from '../../../components/Auth/ResetPasswordModal';

const ResetPasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const { token } = useParams<{ token: string }>();
    const [searchParams] = useSearchParams();
    const [isModalVisible, setIsModalVisible] = useState(false);

    const email = searchParams.get('email');

    useEffect(() => {
        if (!token || !email) {
            message.error('Link không hợp lệ!');
            navigate('/');
        } else {
            // Tự động mở modal khi có token và email hợp lệ
            setIsModalVisible(true);
        }
    }, [token, email, navigate]);

    const handleCloseModal = () => {
        setIsModalVisible(false);
        navigate('/');
    };

    const handleSuccess = () => {
        // Modal sẽ tự động redirect về trang chủ với query param để mở login modal
        setIsModalVisible(false);
    };

    if (!token || !email) {
        return null; // Không hiển thị gì nếu thiếu token hoặc email
    }

    return (
        <ResetPasswordModal
            open={isModalVisible}
            onClose={handleCloseModal}
            token={token}
            email={email}
            onSuccess={handleSuccess}
        />
    );
};

export default ResetPasswordPage;
