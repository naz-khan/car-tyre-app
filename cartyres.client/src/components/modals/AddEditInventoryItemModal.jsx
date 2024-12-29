import React, { useEffect, useState, useRef } from "react";
import {
    Flex,Button, Modal, Cascader, theme,
    DatePicker,
    Form,
    Input,
    InputNumber,
    Radio,
    Select,
    Switch,
    TreeSelect,
    Tag,
    message
} from "antd";
import { PlusOutlined } from '@ant-design/icons';

import axios from "axios";


const tagInputStyle = {
    width: 64,
    height: 22,
    marginInlineEnd: 8,
    verticalAlign: 'top',
};


const AddEditInventoryItemModal = ({ isModalActive, closeModal, inventoryId }) => {
    const [loading, setLoading] = useState(false);
    const { token } = theme.useToken();
    const [messageApi, contextHolder] = message.useMessage();

    const [data, setData] = useState([]);

    const [tags, setTags] = useState([]);
    const [inputVisible, setInputVisible] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [editInputIndex, setEditInputIndex] = useState(-1);
    const [editInputValue, setEditInputValue] = useState('');
    const inputRef = useRef(null);
    const editInputRef = useRef(null);
    const [form] = Form.useForm();

    const handleCancel = () => {
        closeModal(false);
    };

    const handleOk = async () => {
        let formData = form.getFieldsValue();
        try {
            const response = await axios.post('Inventory/inventory', formData)
            messageApi.open({
                type: 'success',
                content: 'Saved successfully!',
            });
            closeModal(false);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
        
        
    };

    //tag functions
    useEffect(() => {
        if (inputVisible) {
            inputRef.current?.focus();
        }
    }, [inputVisible]);
    useEffect(() => {
        editInputRef.current?.focus();
    }, [editInputValue]);
    const handleClose = (removedTag) => {
        const newTags = tags.filter((tag) => tag !== removedTag);
        console.log(newTags);
        setTags(newTags);
    };
    const showInput = () => {
        setInputVisible(true);
    };
    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    };
    const handleInputConfirm = () => {
        if (inputValue && !tags.includes(inputValue)) {
            setTags([...tags, inputValue]);
        }
        setInputVisible(false);
        setInputValue('');
    };
    const handleEditInputChange = (e) => {
        setEditInputValue(e.target.value);
    };
    const handleEditInputConfirm = () => {
        const newTags = [...tags];
        newTags[editInputIndex] = editInputValue;
        setTags(newTags);
        setEditInputIndex(-1);
        setEditInputValue('');
    };

    const tagPlusStyle = {
        height: 22,
        background: token.colorBgContainer,
        borderStyle: 'dashed',
    };
    //////////////////////

    useEffect(() => {
        if (isModalActive && inventoryId) {
            fetchData();
        }
    }, [isModalActive, inventoryId]);
    const fetchData = async () => {
        setLoading(true);

        try {
            const response = await axios.get(`Inventory/inventory/${inventoryId}`);
            form.setFieldsValue(response.data);
            setTags(response.data.Tags);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

  return (
      <Modal open={isModalActive} title="Add/Edit Inventory Item" closeIcon={false}
          footer={[
              <Button
                  key="cancel"
                  type="default"
                  size="small"
                  onClick={handleCancel}>
                  Close
              </Button>,
              <Button
                  key="add"
                  type="primary"
                  onClick={handleOk}
                  size="small">
                  Save Inventory
              </Button>
          ]}>
          <Form form={form} labelCol={{span: 5}} layout="horizontal">
              <Form.Item label="Product Name:" name="ProductName">
                  <Input />
              </Form.Item>
              <Form.Item label="Category:" name="Category">
                  <Input />
              </Form.Item>
              <Form.Item label="Description:" name="Description">
                  <Input.TextArea />
              </Form.Item>
              <Form.Item label="Price:" name="Price">
                  <Input />
              </Form.Item>
              <Form.Item label="Quantity:" name="QuantityInStock">
                  <Input />
              </Form.Item>
              <Form.Item label="Tags:" >
                  <Flex gap="4px 0" wrap>
                      {tags.map((tag, index) => {
                          if (editInputIndex === index) {
                              return (
                                  <Input
                                      ref={editInputRef}
                                      key={tag}
                                      size="small"
                                      style={tagInputStyle}
                                      value={editInputValue}
                                      onChange={handleEditInputChange}
                                      onBlur={handleEditInputConfirm}
                                      onPressEnter={handleEditInputConfirm}
                                  />
                              );
                          }
                          const isLongTag = tag.length > 20;
                          const tagElem = (
                              <Tag
                                  key={tag}
                                  closable={true}
                                  style={{
                                      userSelect: 'none',
                                  }}
                                  onClose={() => handleClose(tag)}
                              >
                                  <span
                                      onDoubleClick={(e) => {
                                          if (index !== 0) {
                                              setEditInputIndex(index);
                                              setEditInputValue(tag);
                                              e.preventDefault();
                                          }
                                      }}
                                  >
                                      {isLongTag ? `${tag.slice(0, 20)}...` : tag}
                                  </span>
                              </Tag>
                          );
                          return isLongTag ? (
                              <Tooltip title={tag} key={tag}>
                                  {tagElem}
                              </Tooltip>
                          ) : (
                              tagElem
                          );
                      })}
                      {inputVisible ? (
                          <Input
                              ref={inputRef}
                              type="text"
                              size="small"
                              style={tagInputStyle}
                              value={inputValue}
                              onChange={handleInputChange}
                              onBlur={handleInputConfirm}
                              onPressEnter={handleInputConfirm}
                          />
                      ) : (
                          <Tag style={tagPlusStyle} icon={<PlusOutlined />} onClick={showInput}>
                              New Tag
                          </Tag>
                      )}
                  </Flex>
              </Form.Item>
          </Form>
      </Modal>
  );
}

export default AddEditInventoryItemModal;