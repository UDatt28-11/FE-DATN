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
        if (onSubmit) {
            onSubmit(values);
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

                {/* Số người */}
                <Form.Item
                    name="guests"
                    label="Số người"
                    className="form-group"
                    initialValue={2}
                >
                    <InputNumber
                        min={1}
                        max={100}
                        size="large"
                        style={{ width: '100%' }}
                        controls={true}
                    />
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
