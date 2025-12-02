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
