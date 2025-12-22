import React from 'react';
import { Input, Button } from 'antd';
import { SendOutlined } from '@ant-design/icons';

const { TextArea } = Input;

interface ReplyBoxProps {
  content: string;
  loading: boolean;
  onChange: (value: string) => void;
  onSend: () => void;
}

const ReplyBox: React.FC<ReplyBoxProps> = ({ content, loading, onChange, onSend }) => {
  return (
    <div className="reply-box">
      <TextArea
        rows={3}
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Nhập phản hồi..."
        onPressEnter={(e) => {
          if (e.shiftKey) return;
          e.preventDefault();
          onSend();
        }}
      />
      <Button
        type="primary"
        icon={<SendOutlined />}
        onClick={onSend}
        loading={loading}
        disabled={!content.trim()}
        style={{ marginTop: '8px' }}
      >
        Gửi phản hồi
      </Button>
    </div>
  );
};

export default ReplyBox;

