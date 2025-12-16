import React from 'react';
import { DatePicker, Button, Typography } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import type { RangePickerProps } from 'antd/es/date-picker';

const { RangePicker } = DatePicker;
const { Text } = Typography;

interface BookingFilterSidebarProps {
    dateRange: [Dayjs | null, Dayjs | null] | null;
    onDateChange?: RangePickerProps['onChange'];
    onAddToCart?: () => void;
    disabledDate?: RangePickerProps['disabledDate'];
    buttonText?: string;
    buttonDisabled?: boolean;
    buttonLoading?: boolean;
    buttonStyle?: React.CSSProperties;
    showButton?: boolean;
}

const BookingFilterSidebar: React.FC<BookingFilterSidebarProps> = ({
    dateRange,
    onDateChange,
    onAddToCart,
    disabledDate,
    buttonText = 'Thêm vào giỏ hàng',
    buttonDisabled = false,
    buttonLoading = false,
    buttonStyle,
    showButton = true,
}) => {
    const defaultDisabledDate: RangePickerProps['disabledDate'] = (current) => {
        if (!current) return false;
        const today = dayjs().startOf('day');
        return current.isBefore(today);
    };

    return (
        <div style={{ width: '100%' }}>
            {/* Date Picker */}
            <div>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>
                    <CalendarOutlined /> Chọn ngày
                </Text>
                <RangePicker
                    style={{ width: '100%' }}
                    format="DD/MM/YYYY"
                    value={dateRange}
                    onChange={onDateChange}
                    disabledDate={disabledDate || defaultDisabledDate}
                    placeholder={['Nhận phòng', 'Trả phòng']}
                    allowClear
                />
            </div>

            {/* Button */}
            {showButton && onAddToCart && (
                <Button
                    type="primary"
                    size="large"
                    block
                    onClick={onAddToCart}
                    loading={buttonLoading}
                    disabled={buttonDisabled}
                    style={{
                        height: 50,
                        fontSize: 16,
                        fontWeight: 'bold',
                        ...buttonStyle,
                    }}
                >
                    {buttonText}
                </Button>
            )}
        </div>
    );
};

export default BookingFilterSidebar;
