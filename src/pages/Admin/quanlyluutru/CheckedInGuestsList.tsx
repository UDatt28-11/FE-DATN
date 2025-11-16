import React, { useState, useEffect } from 'react';
import { Table, Card, Form, Input, Select, DatePicker, Button, Space, Tooltip, Popconfirm } from 'antd';
import { SearchOutlined, ReloadOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import { getAllGuests, deleteGuest, CheckedInGuest, CheckedInGuestsFilter } from '../../../api/checkedInGuest';

const { RangePicker } = DatePicker;

const CheckedInGuestsList: React.FC = () => {
  const navigate = useNavigate();
  const [guests, setGuests] = useState<CheckedInGuest[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 15,
    total: 0,
  });
  const [form] = Form.useForm();

  useEffect(() => {
    loadGuests();
  }, []);

  const loadGuests = async (filters?: CheckedInGuestsFilter) => {
    setLoading(true);
    try {
      const params = {
        ...filters,
        page: filters?.page || pagination.current,
        per_page: filters?.per_page || pagination.pageSize,
      };
      const response = await getAllGuests(params);
      setGuests(response.data || []);
      setPagination({
        current: response.meta?.current_page || 1,
        pageSize: response.meta?.per_page || 15,
        total: response.meta?.total || 0,
      });
    } catch (error) {
      toast.error('Không thể tải danh sách khách lưu trú');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      const values = await form.validateFields();
      const filters: CheckedInGuestsFilter = {
        full_name: values.full_name,
        identity_number: values.identity_number,
        identity_type: values.identity_type,
        room_number: values.room_number,
        booking_id: values.booking_id,
        check_in_from: values.check_in_range?.[0]?.format('YYYY-MM-DD'),
        check_in_to: values.check_in_range?.[1]?.format('YYYY-MM-DD'),
        page: 1,
      };
      loadGuests(filters);
    } catch (error) {
      console.error('Validation error:', error);
    }
  };

  const handleReset = () => {
    form.resetFields();
    loadGuests();
  };

  const handleTableChange = (newPagination: any) => {
    const values = form.getFieldsValue();
    const filters: CheckedInGuestsFilter = {
      full_name: values.full_name,
      identity_number: values.identity_number,
      identity_type: values.identity_type,
      room_number: values.room_number,
      booking_id: values.booking_id,
      check_in_from: values.check_in_range?.[0]?.format('YYYY-MM-DD'),
      check_in_to: values.check_in_range?.[1]?.format('YYYY-MM-DD'),
      page: newPagination.current,
      per_page: newPagination.pageSize,
    };
    loadGuests(filters);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteGuest(id);
      toast.success('Xóa khách lưu trú thành công');
      loadGuests();
    } catch (error) {
      toast.error('Xóa khách lưu trú thất bại');
      console.error(error);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: 'Họ tên',
      dataIndex: 'full_name',
      key: 'full_name',
      width: 150,
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'date_of_birth',
      key: 'date_of_birth',
      width: 120,
      render: (date: string) => (date ? dayjs(date).format('DD/MM/YYYY') : '-'),
    },
    {
      title: 'Loại giấy tờ',
      dataIndex: 'identity_type',
      key: 'identity_type',
      width: 120,
      render: (type: string) => {
        if (type === 'cccd') return 'CCCD';
        if (type === 'passport') return 'Passport';
        return '-';
      },
    },
    {
      title: 'Số giấy tờ',
      dataIndex: 'identity_number',
      key: 'identity_number',
      width: 150,
      render: (text: string) => text || '-',
    },
    {
      title: 'Thời gian check-in',
      dataIndex: 'check_in_time',
      key: 'check_in_time',
      width: 150,
      render: (time: string) => (time ? dayjs(time).format('DD/MM/YYYY HH:mm') : '-'),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      fixed: 'right' as const,
      render: (_: any, record: any) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              style={{ color: '#1890ff' }}
              onClick={() => {
                if (record.booking_details_id) {
                  navigate(`/admin/booking-details/${record.booking_details_id}/guests`);
                } else {
                  toast.warning('Không tìm thấy thông tin booking');
                }
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa khách lưu trú này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Tooltip title="Xóa">
              <Button
                type="text"
                icon={<DeleteOutlined />}
                size="small"
                danger
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card title="Bộ lọc" style={{ marginBottom: 16 }}>
        <Form form={form} layout="vertical">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <Form.Item label="Họ tên" name="full_name">
              <Input placeholder="Tìm theo họ tên" />
            </Form.Item>

            <Form.Item label="Số giấy tờ" name="identity_number">
              <Input placeholder="Tìm theo số giấy tờ" />
            </Form.Item>

            <Form.Item label="Loại giấy tờ" name="identity_type">
              <Select placeholder="Chọn loại giấy tờ" allowClear>
                <Select.Option value="cccd">CCCD</Select.Option>
                <Select.Option value="passport">Passport</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="Số phòng" name="room_number">
              <Input placeholder="Tìm theo số phòng" />
            </Form.Item>

            <Form.Item label="Mã booking" name="booking_id">
              <Input placeholder="Tìm theo mã booking" type="number" />
            </Form.Item>

            <Form.Item label="Khoảng thời gian check-in" name="check_in_range">
              <RangePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>
          </div>

          <Space>
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
              Tìm kiếm
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              Làm mới
            </Button>
          </Space>
        </Form>
      </Card>

      <Card title="Danh sách khách lưu trú">
        <Table
          columns={columns}
          dataSource={guests}
          loading={loading}
          rowKey="id"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} khách`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
};

export default CheckedInGuestsList;
