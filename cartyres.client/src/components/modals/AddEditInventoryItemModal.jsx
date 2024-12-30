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
    message,
    Table, Space
} from "antd";
import { PlusOutlined, ScanOutlined } from '@ant-design/icons';
import QrReader from "react-qr-barcode-scanner";

import axios from "axios";

const tagInputStyle = {
    width: 64,
    height: 22,
    marginInlineEnd: 8,
    verticalAlign: 'top',
};


const AddEditInventoryItemModal = ({ isModalActive, closeModal, refresh, inventoryId }) => {
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
        formData["_id"] = data._id
        try {
            const response = await axios.post('Inventory/inventory', formData)
            messageApi.open({
                type: 'success',
                content: 'Saved successfully!',
            });
            closeModal(false);
            refresh();
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
            setData(response.data);
            setTags(response.data.Tags);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const deleteInventoryItem = async (sku) => {
        form.setFieldsValue({ "QuantityInStock": data.InventoryItems.length - 1 })
        let newInventoryItems = data.InventoryItems.filter((item) => item.SKU !== sku);
        setData({ ...data, InventoryItems: newInventoryItems });

        await axios.put(`Inventory/inventory/${inventoryId}`, newInventoryItems)
        messageApi.open({
            type: 'success',
            content: 'Item deleted successfully!'
        });
    };

    const [scannedData, setScannedData] = useState([]);
    const [isScanning, setIsScanning] = useState(false);
    const handleCodeScan = (result) => {
        if (result) {
            const newBarcode = result.text;
            // Add to list only if it hasn't been scanned yet
            if (!scannedData.includes(newBarcode)) {
                setScannedData([...scannedData, newBarcode]);
            }
            setIsScanning(false); // Stop scanning after each successful scan
        }
    };

    const handleScanError = (error) => {
        console.error("Scanning error:", error);
    };

  return (
      <Modal open={isModalActive} title="Add/Edit Inventory Item"
          footer={[
              <Button key="cancel" onClick={handleCancel}>Close</Button>,
              <Button key="add" type="primary" onClick={handleOk}>Save Inventory</Button>
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

          <Space>
              <Button type="primary" icon={<PlusOutlined />} size="small" iconPosition="left">Add Inventory Item</Button>
              <Button onClick={() => setIsScanning(!isScanning)} icon={<ScanOutlined />} size="small" iconPosition="left">Scan Items</Button>
          </Space>

          {isScanning && (
              <div style={{ marginTop: "20px", width: "300px", height: "300px" }}>
                  <QrReader
                      onResult={handleCodeScan}
                      onError={handleScanError}
                      style={{ width: "100%" }}
                  />
              </div>
          )}

          <Table
              columns={[
                  { title: "Product Barcode", dataIndex: "ProductBarcode", key: "ProductBarcode" },
                  { title: "SKU", dataIndex: "SKU", key: "SKU" },
                  { title: "Date Added", dataIndex: "DateAdded", key: "DateAdded" },
                  { title: 'Action', dataIndex: '', key: 'x', render: (text, record) => <a onClick={() => deleteInventoryItem(record.SKU)}>Delete</a> },
              ]}
              dataSource={data.InventoryItems}
              rowKey={(record) => record.SKU}
              loading={loading}
              size="small"
          />
      </Modal>
  );
}

export default AddEditInventoryItemModal;