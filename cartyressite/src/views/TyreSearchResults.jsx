import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; // Import useLocation
import { Card, Carousel, Row, Col } from 'antd';
import { EditOutlined, EllipsisOutlined, SettingOutlined } from '@ant-design/icons';
import axios from 'axios';

import heroImage1 from '../assets/hero-1.webp';
import tyrePreview from '../assets/tyre-preview.png';

const contentStyle = {
    maxHeight: '150px',
    margin: '5px auto'
};

const TyreSearchResults = () => {
    const[loading, setLoading] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const location = useLocation(); // Initialize useLocation
    const { width, height, rimSize } = location.state || {}; 
    const currentSearch = `${width}/${height} R${rimSize}`;
    useEffect(() => {
        if (width && height && rimSize) {
            fetchSearchResults();
        }
    }, [width, height, rimSize]);


    const fetchSearchResults = async () => {
        setLoading(true);

        try {
            const response = await axios.get("Inventory/search-tyres", {
                params: {
                    TyreWidth: width,
                    TyreHeight: height,
                    TyreRimSize: rimSize
                }
            });
            const { results, totalRows } = response.data;
            const serializedResults = JSON.parse(results);
            setSearchResults(serializedResults);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <main>
                <div className="hero-image-container">
                    <img src={heroImage1} className="hero-images" alt="hero-1" />
                    <span className="current-search">Current search: {currentSearch}</span>
                </div>


                <div className="main-section">
                    <div className="main-container">
                        {loading ? (
                            <p>Loading...</p>
                        ) : (
                            <Row gutter={[16, 16]} justify="center">
                                {searchResults.map((result, index) => (
                                    <Col key={index} xs={24} sm={12} md={8} lg={6} xl={4}>
                                        <Card
                                            hoverable
                                            style={{ width: '100%' }}
                                            cover={
                                                <Carousel effect="fade">
                                                    {result.Images.map((image, index) => (
                                                        <div key={index} className="card-image-container">
                                                            <img style={contentStyle} src={tyrePreview} alt={`tyre-preview-${index}`} />
                                                        </div>
                                                    ))}
                                                </Carousel>
                                            }>
                                            <div className="card-info">
                                                <span className="card-currentsearch">{currentSearch}</span>
                                                <span className="card-brand">{result.Brand}</span>
                                                <span className="card-productname">{result.ProductName}</span>
                                                <span className="card-price"><span>AED</span> {result.Price}</span>
                                            </div>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TyreSearchResults;