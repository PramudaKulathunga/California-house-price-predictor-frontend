import React, { useState, useEffect, useRef } from 'react';
import './HousePricePredictor.css';
import { predictHousePrice, healthCheck } from '../services/api';

const HousePricePredictor = () => {
    const [formData, setFormData] = useState({
        longitude: '',
        latitude: '',
        housing_median_age: '',
        total_rooms: '',
        total_bedrooms: '',
        population: '',
        households: '',
        median_income: '',
        ocean_proximity: '3'
    });

    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [connectionStatus, setConnectionStatus] = useState('checking');

    const headerRef = useRef(null);

    const oceanProximityOptions = [
        { value: '3', label: '🌊 NEAR BAY', color: '#2563eb' },
        { value: '0', label: '🌅 <1H OCEAN', color: '#3b82f6' },
        { value: '4', label: '🏖️ NEAR OCEAN', color: '#60a5fa' },
        { value: '1', label: '🏞️ INLAND', color: '#16a34a' },
        { value: '2', label: '🏝️ ISLAND', color: '#dc2626' }
    ];

    const testData = {
        sanFrancisco: {
            longitude: -122.4194,
            latitude: 37.7749,
            housing_median_age: 45,
            total_rooms: 2800,
            total_bedrooms: 480,
            population: 1100,
            households: 420,
            median_income: 10.2,
            ocean_proximity: '3'
        },
        losAngeles: {
            longitude: -118.2437,
            latitude: 34.0522,
            housing_median_age: 28,
            total_rooms: 2200,
            total_bedrooms: 380,
            population: 1500,
            households: 350,
            median_income: 6.5,
            ocean_proximity: '4'
        },
        fresno: {
            longitude: -119.7871,
            latitude: 36.7378,
            housing_median_age: 15,
            total_rooms: 1600,
            total_bedrooms: 280,
            population: 1200,
            households: 250,
            median_income: 3.2,
            ocean_proximity: '1'
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const loadTestData = (city) => {
        setFormData(testData[city]);
        setError('');
        setPrediction(null);

        // Scroll to top after loading test data
        scrollToTop();
    };

    // Check backend connection on component mount
    // Get environment info on component mount
    useEffect(() => {
        checkBackendConnection();
    }, []);

    const checkBackendConnection = async () => {
        try {
            setConnectionStatus('checking');
            const health = await healthCheck();
            setConnectionStatus('connected');
            console.log('Backend health:', health);
        } catch (error) {
            setConnectionStatus('disconnected');
            setError('Backend service is unavailable. Please check if the server is running.');
            console.error('Connection error:', error);
        }
    };

    const handlePredict = async (e) => {
        e.preventDefault();

        if (connectionStatus !== 'connected') {
            setError('Cannot connect to backend service. Please check the connection.');
            return;
        }

        setLoading(true);
        setError('');
        setPrediction(null);

        try {
            const result = await predictHousePrice(formData);

            if (result.success) {
                setPrediction(result);
                scrollToTop();
            } else {
                setError(result.error || 'Prediction failed');
            }
        } catch (err) {
            setError(err.message || 'Prediction failed. Please try again.');
        }
        setLoading(false);
    };

    const resetForm = () => {
        setFormData({
            longitude: '',
            latitude: '',
            housing_median_age: '',
            total_rooms: '',
            total_bedrooms: '',
            population: '',
            households: '',
            median_income: '',
            ocean_proximity: '3'
        });
        setError('');
        setPrediction(null);
        scrollToTop();
    };

    return (
        <div className="predictor-container">
            {/* Header */}
            <div className="header" ref={headerRef}>
                <div className="header-content">
                    <h1 className="title">California House Price Predictor</h1>
                    <p className="subtitle">Predict median house values using machine learning</p>
                    <div className={`connection-status ${connectionStatus}`}>
                        {connectionStatus === 'connected' && '✅ Connected to API'}
                        {connectionStatus === 'disconnected' && '❌ API Disconnected'}
                        {connectionStatus === 'checking' && '🔍 Checking connection...'}
                    </div>
                </div>

                {/* Prediction Result Display on Right Side */}
                {prediction && (
                    <div className="header-result">
                        <div className="result-badge">
                            <span className="result-label">Predicted Value</span>
                            <span className="result-price">{prediction.formatted_prediction}</span>
                        </div>
                    </div>
                )}
            </div>

            <div className={`main-content-wrapper ${prediction ? 'with-prediction' : ''}`}>
                <div className="single-screen-content">
                    {/* Left Side - Form */}
                    <div className="form-container">
                        <div className="form-card">
                            <div className="form-header">
                                <h2>Enter Property Details</h2>
                                <p>Fill in all fields to get an accurate prediction</p>
                            </div>

                            <form onSubmit={handlePredict} className="prediction-form">
                                <div className="form-grid">
                                    {/* Location Section */}
                                    <div className="form-section-group">
                                        <h3>Location</h3>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Longitude</label>
                                                <input
                                                    type="number"
                                                    step="0.000001"
                                                    name="longitude"
                                                    value={formData.longitude}
                                                    onChange={handleInputChange}
                                                    required
                                                    placeholder="Enter longitude"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Latitude</label>
                                                <input
                                                    type="number"
                                                    step="0.000001"
                                                    name="latitude"
                                                    value={formData.latitude}
                                                    onChange={handleInputChange}
                                                    required
                                                    placeholder="Enter latitude"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Property Details Section */}
                                    <div className="form-section-group">
                                        <h3>Property Details</h3>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Median Age</label>
                                                <input
                                                    type="number"
                                                    name="housing_median_age"
                                                    value={formData.housing_median_age}
                                                    onChange={handleInputChange}
                                                    required
                                                    placeholder="Enter Housing Median Age"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Total Rooms</label>
                                                <input
                                                    type="number"
                                                    name="total_rooms"
                                                    value={formData.total_rooms}
                                                    onChange={handleInputChange}
                                                    required
                                                    placeholder="Enter Total Rooms Count"
                                                />
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Total Bedrooms</label>
                                                <input
                                                    type="number"
                                                    name="total_bedrooms"
                                                    value={formData.total_bedrooms}
                                                    onChange={handleInputChange}
                                                    required
                                                    placeholder="Enter Total Bedrooms Counts"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Households</label>
                                                <input
                                                    type="number"
                                                    name="households"
                                                    value={formData.households}
                                                    onChange={handleInputChange}
                                                    required
                                                    placeholder="Enter Households Count"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Demographics Section */}
                                    <div className="form-section-group">
                                        <h3>Demographics</h3>
                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>Population</label>
                                                <input
                                                    type="number"
                                                    name="population"
                                                    value={formData.population}
                                                    onChange={handleInputChange}
                                                    required
                                                    placeholder="Enter Population"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Median Income</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    name="median_income"
                                                    value={formData.median_income}
                                                    onChange={handleInputChange}
                                                    required
                                                    placeholder="Enter Median Income"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Ocean Proximity */}
                                    <div className="form-section-group">
                                        <h3>Ocean Proximity</h3>
                                        <div className="form-group full-width">
                                            <select
                                                name="ocean_proximity"
                                                value={formData.ocean_proximity}
                                                onChange={handleInputChange}
                                                required
                                                className="ocean-select"
                                            >
                                                {oceanProximityOptions.map(option => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="reset-btn"
                                    >
                                        Clear Form
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="predict-btn"
                                    >
                                        {loading ? 'Predicting...' : 'Predict Price'}
                                    </button>
                                </div>
                            </form>

                            {error && (
                                <div className="error-message">
                                    <span>❌</span>
                                    <p>{error}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Side - Information Panel */}
                    <div className="info-panel">
                        <div className="info-card">
                            <h3>How It Works</h3>
                            <p>Our machine learning model analyzes California housing data to predict median house values based on</p>

                            <div className="feature-list">
                                <div className="feature-item">
                                    <span className="feature-icon">📍</span>
                                    <div>
                                        <strong>Location</strong>
                                        <span>Geographic coordinates</span>
                                    </div>
                                </div>
                                <div className="feature-item">
                                    <span className="feature-icon">🏠</span>
                                    <div>
                                        <strong>Property Details</strong>
                                        <span>Age, rooms, bedrooms</span>
                                    </div>
                                </div>
                                <div className="feature-item">
                                    <span className="feature-icon">👥</span>
                                    <div>
                                        <strong>Demographics</strong>
                                        <span>Population & income</span>
                                    </div>
                                </div>
                                <div className="feature-item">
                                    <span className="feature-icon">🌊</span>
                                    <div>
                                        <strong>Ocean Proximity</strong>
                                        <span>Distance to coast</span>
                                    </div>
                                </div>
                            </div>

                            <div className="model-info">
                                <h4>Model Details</h4>
                                <p><strong>Algorithm:</strong> Random Forest Regressor</p>
                                <p><strong>Accuracy:</strong> High precision predictions</p>
                                <p><strong>Training Data:</strong> California housing dataset</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Test Data Buttons at Bottom */}
                <div className="test-section">
                    <div className="test-container">
                        <h3>Quick Test with Real Data</h3>
                        <p>Try these pre-filled examples from different California cities</p>

                        <div className="test-buttons-grid">
                            <button
                                className="test-btn san-francisco"
                                onClick={() => [loadTestData('sanFrancisco'), scrollToTop]}
                            >
                                <span className="test-icon">🏙️</span>
                                <span className="test-content">
                                    <strong>San Francisco</strong>
                                    <span>High-income coastal</span>
                                </span>
                            </button>

                            <button
                                className="test-btn los-angeles"
                                onClick={() => loadTestData('losAngeles')}
                            >
                                <span className="test-icon">🌇</span>
                                <span className="test-content">
                                    <strong>Los Angeles</strong>
                                    <span>Medium-income coastal</span>
                                </span>
                            </button>

                            <button
                                className="test-btn fresno"
                                onClick={() => loadTestData('fresno')}
                            >
                                <span className="test-icon">🏞️</span>
                                <span className="test-content">
                                    <strong>Fresno</strong>
                                    <span>Low-income inland</span>
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="footer">
                <p>Powered by Machine Learning • University of Jaffna • Data Mining Project</p>
            </div>
        </div>
    );
};

export default HousePricePredictor;