import React, { useState, KeyboardEvent } from "react";
import { Input, Button } from "antd";
import { SendOutlined } from "@ant-design/icons";
import { useChat } from "../../context/ChatContext";
import "./Chatbox.css";

const { TextArea } = Input;

const InputBox: React.FC = () => {
  const { sendMessage, isLoading, conversation } = useChat();
  const [inputValue, setInputValue] = useState("");

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading || !conversation) return;

    const content = inputValue.trim();
    setInputValue("");
    await sendMessage(content);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // InputBox chỉ hiển thị khi đã có conversation
  if (!conversation) {
    return null;
  }

  return (
    <div className="input-box">
      <TextArea
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Nhập tin nhắn của bạn ..."
        autoSize={{ minRows: 1, maxRows: 4 }}
        disabled={isLoading}
        maxLength={5000}
        showCount
        style={{ borderRadius: '8px' }}
      />
      <Button
        type="primary"
        icon={<SendOutlined />}
        onClick={handleSend}
        disabled={!inputValue.trim() || isLoading}
        loading={isLoading}
        className="send-button"
        style={{ borderRadius: '8px', backgroundColor: '#cb8670', borderColor: '#cb8670' }}
      >
        Gửi
      </Button>
    </div>
  );
};

export default InputBox;
