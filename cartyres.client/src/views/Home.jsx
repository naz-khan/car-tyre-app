import React, { useState } from 'react';
import { Col, Row, Card, Typography } from 'antd';

const Home = () => {
    const [loading, setLoading] = useState(true);
    const { Title, Text } = Typography;

    return (
        <div>
            <header>
                <h1>Here's you overview</h1>
            </header>
            <main>
                <Row gutter={16}>
                    <Col span={8}>
                        <div className="custom-card">
                            <div className="custom-card-body">
                                <span className="title">Total Value</span><br/>
                                <span className="subtitle">Total sales</span><br />
                                <span className="value">$36,200</span><br />
                                <Text type="success">+$238 compared to previous month</Text>
                            </div>
                            <div className="custom-card-footer">
                                <span>View Report</span>
                            </div>
                        </div>
                    </Col>
                    <Col span={8}>
                        <div className="custom-card">
                            <div className="custom-card-body">
                                <span className="title">Customers</span><br />
                                <span className="subtitle">Customer sign up</span><br />
                                <span className="value">206</span><br />
                                <Text type="success">2 in this month</Text>
                            </div>
                            <div className="custom-card-footer">
                                <span>View Report</span>
                            </div>
                        </div>
                    </Col>
                    <Col span={8}>
                        <div className="custom-card">
                            <div className="custom-card-body">
                                <span className="title">Orders</span><br/>
                                <span className="subtitle">Order analysis</span><br />
                                <span className="value">$16,200</span><br/>
                                <Text type="success">+$238 compared to previous month</Text>
                            </div>
                            <div className="custom-card-footer">
                                <span>View Report</span>
                            </div>
                        </div>
                    </Col>
                </Row>
            </main>
        </div>
    );
};

export default Home;
