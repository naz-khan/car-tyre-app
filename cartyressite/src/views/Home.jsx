import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

import heroImage2 from '../assets/hero-2.png'; // Adjust the path as necessary
import { Col, Row, Button, Space, message, Steps, theme, Popover } from 'antd';
import axios from 'axios';

const Home = () => {
    const [loading, setLoading] = useState(false);
    const [tyreData, setTyreData] = useState([]);
    const [selectedTyreWidth, setTyreWidth] = useState(null);
    const [selectedTyreHeight, setTyreHeight] = useState(null);
    const [selectedTyreRimSize, setTyreRimSize] = useState();

    const [searchByType, setSearchByType] = useState('size');
    const { token } = theme.useToken();
    const [current, setCurrent] = useState(0);
    const navigate = useNavigate(); // Hook for navigation


    useEffect(() => {
        fetchTyreData();
    }, []);

    const fetchTyreData = async () => {
        setLoading(true);

        try {
            const response = await axios.get("Inventory/tyres");
            setTyreData(response.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const searchByClick = (type) => {
        setSearchByType(type);
    };

    const handleWidthClick = (width) => {
        setTyreWidth(width);
        setTyreHeight(null); // Reset selected height when width changes
        next();
    };

    const handleHeightClick = (height) => {
        setTyreHeight(height);
        next()
    };

    const handleRimSizeClick = (rimSize) => {
        setTyreRimSize(rimSize);
        navigate('/search-results', {
            state: {
                width: selectedTyreWidth.width,
                height: selectedTyreHeight.value,
                rimSize: rimSize
            }
        });
    };

    const steps = [
        {
            title: 'Width',
            content: (
                <Space size={[8, 16]} wrap>
                    {tyreData.map((tyre, index) => (
                        <Button key={index} onClick={() => handleWidthClick(tyre)}>{tyre.width}</Button>
                    ))}
                </Space>
            )
        },
        {
            title: 'Height',
            content: (
                <Space size={[8, 16]} wrap>
                    {selectedTyreWidth && tyreData
                        .filter((tyre) => tyre.width === selectedTyreWidth.width)
                        .flatMap((tyre) => tyre.heights)
                        .map((height, index) => (
                            <Button key={index} onClick={() => handleHeightClick(height)}>{height.value}</Button>
                        ))}
                </Space>
            ),
        },
        {
            title: 'Rim Size',
            content: (
                <Space size={[8, 16]} wrap>
                    {selectedTyreHeight && selectedTyreHeight.rimSizes.map((rimSize, index) => (
                        <Button key={index} onClick={() => handleRimSizeClick(rimSize)}>{rimSize}</Button>
                    ))}
                </Space>
            ),
        },
    ];
    const next = () => {
        setCurrent(current + 1);
    };
    const prev = () => {
        setCurrent(current - 1);
    };

    const onChangeSteps = (value) => {
        setCurrent(value);
    };

    const customDot = (dot, { status, index }) => (
        <Popover
            content={
                <span>
                    step {index} status: {status}
                </span>
            }>
            {dot}
        </Popover>
    );

    const items = steps.map((item) => ({
        key: item.title,
        title: item.title,
    }));

    return (
        <div>
            <main className="main">
                <section className="section banner banner-section">
                    <div className="container banner-column" style={{ backgroundImage: `url(${heroImage2})` }}>
                        <div className="banner-inner">
                            <h1 className="heading-xl">Car Tyres</h1>
                            <p className="paragraph">
                                Enjoy award-winning stereo beats with wireless listening freedom and sleek,
                                streamlined with premium padded and delivering first-rate playback.
                            </p>
                            <button className="btn btn-darken btn-inline">
                                Our Products<i className="bx bx-right-arrow-alt"></i>
                            </button>
                        </div>

                        <div className="pane-search">
                            <span className="title">Search Assistant</span>
                            <div className="subtitle">Let us help you</div>
                            <hr />
                            <Row gutter={[8, 8]} className="search-by-pane">
                                <Col span={12}>
                                    <div className={`search-by icon-text ${searchByType === 'size' ? 'is-active' : ''}`}  onClick={() => searchByClick('size')}>
                                        <i className="fa-solid fa-tire fa-2xl"></i>
                                        <div className="text-container">
                                            <span className="title">Search by size</span>
                                            <div className="subtitle">Width, Height, Rim Size</div>
                                        </div>
                                    </div>
                                </Col>
                                <Col span={12}>
                                    <div className={`search-by icon-text ${searchByType === 'car' ? 'is-active' : ''}`} onClick={() => searchByClick('car')}>
                                        <i className="fa-solid fa-car fa-2xl"></i>
                                        <div className="text-container">
                                            <span className="title">Search by vehicle</span>
                                            <div className="subtitle">Make, Year, Model</div>
                                        </div>
                                    </div>
                                </Col>
                            </Row>

                            <Row gutter={[8, 8]} style={{ paddingTop: '10px'}}>
                                <Col>
                                    {searchByType === 'size' && (
                                        <div>
                                            <Steps style={{ paddingTop: '10px' }} current={current} items={items} onChange={onChangeSteps} progressDot={customDot} />
                                            <div style={{ paddingTop: '15px', overflowY: 'hidden', maxHeight: '45vh' }}>{steps[current].content}</div>
                                        </div>
                                    )}

                                </Col>
                            </Row>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Home;