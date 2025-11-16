import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Table, Button, Modal, Form, Input, Select, DatePicker, Popconfirm, Card, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import {
  getGuestsByBookingDetail,
  createGuestsForBookingDetail,
  updateGuest,
  deleteGuest,
  CheckedInGuest,
  CheckedInGuestFormData,
} from '../../../api/checkedInGuest';

const CheckedInGuestsByBookingDetail: React.FC = () => {
  const { bookingDetailId } = useParams<{ bookingDetailId: string }>();
  const navigate = useNavigate();
  const [guests, setGuests] = useState<CheckedInGuest[]>([]);
  const [bookingDetail, setBookingDetail] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingGuest, setEditingGuest] = useState<CheckedInGuest | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (bookingDetailId) {
      loadGuests();
    }
  }, [bookingDetailId]);

  const loadGuests = async () => {
    setLoading(true);
    try {
      const response = await getGuestsByBookingDetail(Number(bookingDetailId));
      setGuests(response.data || []);
      setBookingDetail(response.booking_detail || null);
    } catch (error) {
      toast.error('Không thể tải danh sách khách lưu trú');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingGuest(null);
    form.resetFields();
    // Set default check_in_time from booking_detail
    if (bookingDetail?.check_in_date) {
      form.setFieldsValue({
        check_in_time: dayjs(bookingDetail.check_in_date).hour(14).minute(0), // Default 14:00
      });
    }
    setModalVisible(true);
  };

  const handleEdit = (guest: CheckedInGuest) => {
    setEditingGuest(guest);
    form.setFieldsValue({
      ...guest,
      date_of_birth: guest.date_of_birth ? dayjs(guest.date_of_birth) : null,
      check_in_time: guest.check_in_time ? dayjs(guest.check_in_time) : null,
    });
    setModalVisible(true);
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

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formData: CheckedInGuestFormData = {
        ...values,
        date_of_birth: values.date_of_birth ? values.date_of_birth.format('YYYY-MM-DD') : undefined,
        check_in_time: values.check_in_time ? values.check_in_time.toISOString() : undefined,
      };

      if (editingGuest) {
        await updateGuest(editingGuest.id, formData);
        toast.success('Cập nhật thông tin khách thành công');
      } else {
        await createGuestsForBookingDetail(Number(bookingDetailId), [formData]);
        toast.success('Thêm khách lưu trú thành công');
      }

      setModalVisible(false);
      form.resetFields();
      loadGuests();
    } catch (error) {
      toast.error('Có lỗi xảy ra');
      console.error(error);
    }
  };

  const columns = [
    {
      title: 'Họ tên',
      dataIndex: 'full_name',
      key: 'full_name',
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'date_of_birth',
      key: 'date_of_birth',
      render: (date: string) => (date ? dayjs(date).format('DD/MM/YYYY') : '-'),
    },
    {
      title: 'Loại giấy tờ',
      dataIndex: 'identity_type',
      key: 'identity_type',
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
      render: (text: string) => text || '-',
    },
    {
      title: 'Thời gian check-in',
      dataIndex: 'check_in_time',
      key: 'check_in_time',
      render: (time: string) => (time ? dayjs(time).format('DD/MM/YYYY HH:mm') : '-'),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: unknown, record: CheckedInGuest) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa khách này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/admin/checked-in-guests')}
        style={{ marginBottom: 16 }}
      >
        Quay lại danh sách
      </Button>

      {bookingDetail && (
        <Card style={{ marginBottom: 16 }} size="small">
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <div><strong>Mã đặt phòng:</strong> {bookingDetail.booking_code}</div>
            <div><strong>Phòng:</strong> {bookingDetail.room_name}</div>
            <div><strong>Check-in:</strong> {dayjs(bookingDetail.check_in_date).format('DD/MM/YYYY')}</div>
            <div><strong>Check-out:</strong> {dayjs(bookingDetail.check_out_date).format('DD/MM/YYYY')}</div>
            <div><strong>Số khách:</strong> {bookingDetail.num_adults} người lớn, {bookingDetail.num_children} trẻ em</div>
          </div>
        </Card>
      )}
      
      <Card
        title="Quản lý khách lưu trú"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Thêm khách
          </Button>
        }
      >
      <Table
        columns={columns}
        dataSource={guests}
        loading={loading}
        rowKey="id"
        pagination={false}
      />

      <Modal
        title={editingGuest ? 'Sửa thông tin khách' : 'Thêm khách lưu trú'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        okText={editingGuest ? 'Cập nhật' : 'Thêm'}
        cancelText="Hủy"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Họ tên"
            name="full_name"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          >
            <Input placeholder="Nhập họ tên khách" />
          </Form.Item>

          <Form.Item label="Ngày sinh" name="date_of_birth">
            <DatePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              placeholder="Chọn ngày sinh"
            />
          </Form.Item>

          <Form.Item label="Loại giấy tờ" name="identity_type">
            <Select placeholder="Chọn loại giấy tờ" allowClear>
              <Select.Option value="cccd">CCCD</Select.Option>
              <Select.Option value="passport">Passport</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Số giấy tờ" name="identity_number">
            <Input placeholder="Nhập số giấy tờ" />
          </Form.Item>

          <Form.Item label="Link ảnh giấy tờ" name="identity_image_url">
            <Input placeholder="Nhập URL ảnh giấy tờ" />
          </Form.Item>

          <Form.Item label="Thời gian check-in" name="check_in_time">
            <DatePicker
              showTime
              style={{ width: '100%' }}
              format="DD/MM/YYYY HH:mm"
              placeholder="Chọn thời gian check-in"
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
    </div>
  );
};

export default CheckedInGuestsByBookingDetail;
