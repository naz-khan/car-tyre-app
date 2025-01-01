import React, { useEffect, useState } from "react";
import {
    Table, Button, Cascader,
    DatePicker,
    Form,
    Input,
    InputNumber,
    Radio,
    Select,
    Switch,
    TreeSelect, Space } from "antd";
import { PlusOutlined, EditOutlined, ScanOutlined } from '@ant-design/icons';
import QrReader from "react-qr-barcode-scanner";
import axios from "axios";

import AddEditInventoryItemModal from "../components/modals/AddEditInventoryItemModal";

const Inventory = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [inventoryId, setInventoryId] = useState(null);

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const fetchData = async (pagination) => {
        setLoading(true);

        try {
            const response = await axios.get("Inventory/inventory", {
                params: {
                    pageNumber: pagination.current,
                    pageSize: pagination.pageSize,
                    filters: {
                        SKU: "", // Add search criteria if needed
                        ProductName: "",
                        ProductBarcode: "",
                    }
                }
            });

            const { results, totalRows } = response.data;
            const serializedResults = JSON.parse(results);

            setData(serializedResults);
            setPagination({
                ...pagination,
                total: totalRows,
            });
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(pagination);
    }, []);
    const refresh = () => {
        fetchData(pagination)
    };

    const handleTableChange = (newPagination) => {
        fetchData(newPagination);
    };

    const editInventoryItem = (inventoryId) => {
        setInventoryId(inventoryId.$oid);
        showModal();
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
        <div>
            <header>
                <h1>Inventory</h1>
            </header>
            <main>
                <Space>
                     <Button type="primary" onClick={showModal} icon={<PlusOutlined />} iconPosition="left">Add Inventory</Button>
                     <Button onClick={() => setIsScanning(!isScanning)} icon={<ScanOutlined />} iconPosition="left">Scan Items</Button>
                </Space>
                <Table
                    columns={[
                        { title: "Product Name", dataIndex: "ProductName", key: "ProductName" },
                        { title: "Description", dataIndex: "Description", key: "Description" },
                        { title: "Category", dataIndex: "Category", key: "Category" },
                        { title: "Price", dataIndex: "Price", key: "Price" },
                        { title: "Quantity", dataIndex: "QuantityInStock", key: "QuantityInStock" },
                        { title: 'Action', dataIndex: '', key: 'x', render: (text, record) => <a onClick={() => editInventoryItem(record._id)}>Edit</a>},
                    ]}
                    dataSource={data}
                    rowKey={(record) => record._id.$oid}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                    }}
                    loading={loading}
                    onChange={handleTableChange}
                 />

                 {isScanning && (
                     <div style={{ marginTop: "20px", width: "300px", height: "300px" }}>
                         <QrReader
                             onResult={handleCodeScan}
                             onError={handleScanError}
                             style={{ width: "100%" }}
                         />
                     </div>
                 )}


                 <AddEditInventoryItemModal isModalActive={isModalOpen} closeModal={handleCancel} refresh={refresh} inventoryId={inventoryId} />
            </main>
        </div>
    );
};

export default Inventory;
