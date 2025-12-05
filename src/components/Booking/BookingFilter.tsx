import React from 'react';
import { Form, DatePicker, InputNumber, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import './BookingFilter.css';

interface BookingFilterProps {
    onSubmit?: (values: any) => void;
    showButton?: boolean;
}

const BookingFilter: React.FC<BookingFilterProps> = ({
    onSubmit,
    showButton = true
}) => {
    const [form] = Form.useForm();
    const navigate = useNavigate();

    const handleSubmit = (values: any) => {
        // Validate số lượng người
        const adults = values.adults || 1;
        const children = values.children || 0;
        const totalGuests = adults + children;
        
        // Kiểm tra số lượng người hợp lệ
        if (adults < 1) {
            message.warning('Số lượng người lớn phải ít nhất là 1');
            return;
        }
        
        if (totalGuests > 20) {
            message.warning('Tổng số người không được vượt quá 20. Vui lòng giảm số lượng người.');
            return;
        }
        
        // Validate ngày tháng
        if (!values.checkIn || !values.checkOut) {
            message.warning('Vui lòng chọn ngày nhận và trả phòng');
            return;
        }
        
        const checkInDate = dayjs(values.checkIn);
        const checkOutDate = dayjs(values.checkOut);
        
        if (checkOutDate.isBefore(checkInDate) || checkOutDate.isSame(checkInDate)) {
            message.warning('Ngày trả phòng phải sau ngày nhận phòng');
            return;
        }
        
        // Nếu có onSubmit callback, gọi nó trước
        if (onSubmit) {
            onSubmit(values);
        } else {
            // Mặc định: navigate đến trang rooms với filter
            const params = new URLSearchParams();
            
            // Thêm check_in và check_out
            params.append('check_in', checkInDate.format('YYYY-MM-DD'));
            params.append('check_out', checkOutDate.format('YYYY-MM-DD'));
            
            // Thêm số lượng người lớn và trẻ em
            params.append('max_adults', adults.toString());
            params.append('max_children', children.toString());
            
            // Navigate đến trang rooms với query params
            navigate(`/rooms?${params.toString()}`);
        }
    };

    return (
        <div className="book-now-form">
            <Form form={form} onFinish={handleSubmit}>
                {/* Check In */}
                <Form.Item
                    name="checkIn"
                    label="Check In"
                    className="form-group"
                    initialValue={dayjs()}
                >
                    <DatePicker
                        placeholder="Select date"
                        size="large"
                        format="DD MMMM"
                        style={{ width: '100%' }}
                        suffixIcon={<i className="fa fa-angle-down" />}
                        disabledDate={(current) => current && current < dayjs().startOf('day')}
                    />
                </Form.Item>

                {/* Check Out */}
                <Form.Item
                    name="checkOut"
                    label="Check Out"
                    className="form-group"
                    initialValue={dayjs().add(1, 'day')}
                >
                    <DatePicker
                        placeholder="Select date"
                        size="large"
                        format="DD MMMM"
                        style={{ width: '100%' }}
                        suffixIcon={<i className="fa fa-angle-down" />}
                        disabledDate={(current) => {
                            const checkInDate = form.getFieldValue('checkIn');
                            return current && current <= (checkInDate || dayjs());
                        }}
                    />
                </Form.Item>

                {/* Adults */}
                <Form.Item
                    name="adults"
                    label="Adults"
                    className="form-group"
                    initialValue={2}
                >
                    <InputNumber
                        min={1}
                        max={10}
                        size="large"
                        style={{ width: '100%' }}
                        controls={true}
                    />
                </Form.Item>

                {/* Childrens */}
                <Form.Item
                    name="children"
                    label="Childrens"
                    className="form-group"
                    initialValue={1}
                >
                    <InputNumber
                        min={0}
                        max={10}
                        size="large"
                        style={{ width: '100%' }}
                        controls={true}
                    />
                </Form.Item>

                {/* Button */}
                {showButton && (
                    <button type="submit" className="form-submit">
                        BOOK NOW
                    </button>
                )}
            </Form>
        </div>
    );
};

export default BookingFilter;
