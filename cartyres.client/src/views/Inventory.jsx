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
    TreeSelect } from "antd";
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import AddEditInventoryItemModal from "../components/modals/AddEditInventoryItemModal";

import axios from "axios";

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
                    searchCriteria: {
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

    const handleTableChange = (newPagination) => {
        fetchData(newPagination);
    };

    const editInventoryItem = (inventoryId) => {
        setInventoryId(inventoryId.$oid);
        showModal();
    };

     return (
        <div>
            <header>
                <h1>Inventory</h1>
            </header>
            <main>
                <Button onClick={showModal} icon={<PlusOutlined />} size="small" iconPosition="left">Add Inventory</Button>

                <Table
                    columns={[
                        { title: "Product Name", dataIndex: "ProductName", key: "ProductName" },
                        { title: "Description", dataIndex: "Description", key: "Description" },
                        { title: "Price", dataIndex: "Price", key: "Price" },
                        { title: "QuantityInStock", dataIndex: "QuantityInStock", key: "QuantityInStock" },
                        { title: 'Action', dataIndex: '', key: 'x', render: (text, record) => <a onClick={() => editInventoryItem(record._id)}>Edit</a>},
                    ]}
                    dataSource={data}
                    rowKey={(record) => record._id}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total: pagination.total,
                    }}
                    loading={loading}
                    onChange={handleTableChange}
                />
                <AddEditInventoryItemModal isModalActive={isModalOpen} closeModal={handleCancel} inventoryId={inventoryId} />
            </main>
        </div>
    );
};

export default Inventory;
