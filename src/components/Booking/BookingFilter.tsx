import React from 'react';
import { Form, DatePicker, InputNumber } from 'antd';
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

    const handleSubmit = (values: any) => {
        const { checkIn, checkOut, guests, adults, children } = values;

        // Validate ngày nhận/trả phòng
        if (!checkIn || !checkOut) {
            return;
        }

        const checkInDate = checkIn.startOf('day');
        const checkOutDate = checkOut.startOf('day');

        if (!checkOutDate.isAfter(checkInDate)) {
            window.alert('Ngày trả phòng phải sau ngày nhận phòng ít nhất 1 ngày!');
            return;
        }

        if (onSubmit) {
            // Nếu có adults và children, sử dụng chúng
            // Nếu không, fallback về guests (backward compatibility)
            const numAdults = adults || guests || 2;
            const numChildren = children || 0;
            
            onSubmit({
                ...values,
                checkIn: checkInDate,
                checkOut: checkOutDate,
                guests: guests || numAdults,
                adults: numAdults,
                children: numChildren,
            });
        }
    };

    return (
        <div className="book-now-form">
            <Form form={form} onFinish={handleSubmit}>
                {/* Check In */}
                <Form.Item
                    name="checkIn"
                    label="Nhận phòng"
                    className="form-group"
                    initialValue={dayjs()}
                >
                    <DatePicker
                        placeholder="Chọn ngày"
                        size="large"
                        format="DD/MM/YYYY"
                        style={{ width: '100%' }}
                        suffixIcon={<i className="fa fa-angle-down" />}
                        disabledDate={(current) => current && current < dayjs().startOf('day')}
                    />
                </Form.Item>

                {/* Check Out */}
                <Form.Item
                    name="checkOut"
                    label="Trả phòng"
                    className="form-group"
                    initialValue={dayjs().add(1, 'day')}
                >
                    <DatePicker
                        placeholder="Chọn ngày"
                        size="large"
                        format="DD/MM/YYYY"
                        style={{ width: '100%' }}
                        suffixIcon={<i className="fa fa-angle-down" />}
                        disabledDate={(current) => {
                            const checkInDate = form.getFieldValue('checkIn');
                            return current && current <= (checkInDate || dayjs());
                        }}
                    />
                </Form.Item>

                {/* Người lớn */}
                <Form.Item
                    name="adults"
                    label="Người lớn"
                    className="form-group"
                    initialValue={2}
                >
                    <InputNumber
                        min={1}
                        max={20}
                        size="large"
                        style={{ width: '100%' }}
                        controls={true}
                    />
                </Form.Item>

                {/* Trẻ em */}
                <Form.Item
                    name="children"
                    label="Trẻ em"
                    className="form-group"
                    initialValue={0}
                >
                    <InputNumber
                        min={0}
                        max={10}
                        size="large"
                        style={{ width: '100%' }}
                        controls={true}
                    />
                </Form.Item>

                {/* Số người (backward compatibility - ẩn nhưng vẫn tính toán) */}
                <Form.Item
                    name="guests"
                    hidden
                    initialValue={2}
                >
                    <InputNumber />
                </Form.Item>

                {/* Button */}
                {showButton && (
                    <button type="submit" className="form-submit">
                        TÌM PHÒNG
                    </button>
                )}
            </Form>
        </div>
    );
};

export default BookingFilter;
