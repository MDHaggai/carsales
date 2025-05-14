import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { backendUrl, currency } from '../App';
import { FaFire, FaChevronRight, FaCar, FaHeart } from 'react-icons/fa';
import ReactGA from 'react-ga4';
import { useNavigate } from 'react-router-dom';

ReactGA.initialize('G-M8WD1CFN81');

const BestSeller = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [visibleProducts, setVisibleProducts] = useState([]);
    const [showAll, setShowAll] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);

    const MOBILE_LIMIT = 4;
    const DESKTOP_LIMIT = 6;

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3
            }
        }
    };

    const cardVariants = {
        hidden: { 
            opacity: 0, 
            y: 50
        },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 15
            }
        }
    };

    useEffect(() => {
        const fetchPopularProducts = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${backendUrl}/api/product/best-sellers`);
                
                if (response.data.success && Array.isArray(response.data.products)) {
                    const popularProducts = response.data.products;
                    
                    if (popularProducts.length > 0) {
                        setProducts(popularProducts);
                        setVisibleProducts(
                            popularProducts.slice(0, isMobileView ? MOBILE_LIMIT : DESKTOP_LIMIT)
                        );
                        setError(null);
                    } else {
                        setError('No popular products available');
                        setProducts([]);
                    }
                } else {
                    setError('Invalid data format received');
                }
            } catch (error) {
                setError(error.response?.data?.message || 'Error fetching popular products');
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPopularProducts();
    }, [isMobileView]);

    useEffect(() => {
        const handleResize = () => {
            const isMobile = window.innerWidth <= 768;
            setIsMobileView(isMobile);
            setVisibleProducts(
                products.slice(0, isMobile ? MOBILE_LIMIT : DESKTOP_LIMIT)
            );
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [products]);

    useEffect(() => {
        console.log('State update:', {
            productsLength: products.length,
            visibleProductsLength: visibleProducts.length,
            loading,
            error,
            isMobileView
        });
    }, [products, visibleProducts, loading, error, isMobileView]);

    const handleShowMore = () => {
        setVisibleProducts(products);
        setShowAll(true);
        ReactGA.event('click', {
            category: 'Button',
            action: 'Show More Popular Cars',
            label: 'User clicked show more button'
        });
    };

    const handleViewDetails = (productId) => {
        navigate(`/product/${productId}`);
    };

    if (loading) {
        return (
            <div className="py-20 px-4">
                <div className="container mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(isMobileView ? MOBILE_LIMIT : DESKTOP_LIMIT)].map((_, index) => (
                            <div key={index} className="bg-white rounded-2xl shadow-lg p-4 h-[600px] animate-pulse">
                                <div className="h-[350px] bg-gray-200 rounded-lg mb-4"></div>
                                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
                                <div className="h-8 bg-gray-200 rounded w-full"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="py-20 px-4 text-center">
                <div className="container mx-auto max-w-7xl">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-8">
                        <FaCar className="text-4xl text-red-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-red-800 mb-2">
                            {error}
                        </h3>
                        <p className="text-red-600">
                            Please try again later or contact support if the problem persists.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (products.length === 0 && !loading && !error) {
        return (
            <div className="py-20 px-4 text-center">
                <div className="container mx-auto max-w-7xl">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-8">
                        <FaCar className="text-4xl text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                            No Popular Vehicles Available
                        </h3>
                        <p className="text-gray-600">
                            Check back soon for our featured vehicles.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
            <div className="container mx-auto max-w-7xl relative z-10">
                {/* Header Section */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <FaFire className="text-4xl text-orange-500 animate-pulse" />
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-800">
                            Popular Right Now
                        </h2>
                    </div>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "150px" }}
                        className="h-1 bg-orange-500 mx-auto mb-8"
                    />
                    <p className="max-w-2xl mx-auto text-gray-600 text-lg">
                        Discover our most sought-after vehicles, handpicked based on customer demand and exceptional quality.
                    </p>
                </motion.div>

                {/* Products Grid */}
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {visibleProducts && visibleProducts.map((product) => {
                        return (
                            <motion.div
                                key={product._id}
                                variants={cardVariants}
                                initial="hidden"
                                animate="visible"
                                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col h-[600px]"
                                whileHover={{ y: -8 }}
                            >
                                {/* Image Section */}
                                <div className="relative h-[350px] overflow-hidden">
                                    {product.images && product.images[0] && (
                                        <img
                                            src={product.images[0]}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                    <div className="absolute top-4 right-4 bg-orange-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
                                        Popular
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="p-6 flex flex-col flex-1 justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">{product.name}</h3>
                                        <p className="text-gray-600 mb-4 line-clamp-1">{product.brand} {product.model} {product.year}</p>
                                    </div>

                                    <div className="mt-auto">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-gray-600 font-medium">Price</span>
                                            <span className="text-2xl font-bold text-orange-500">
                                                {currency}{product.price?.toLocaleString()}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-500">Down Payment:</span>
                                                <span className="font-semibold">{currency}{product.downPayment?.toLocaleString()}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-500">Monthly:</span>
                                                <span className="font-semibold">{currency}{product.monthlyPayment?.toLocaleString()}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={() => handleViewDetails(product._id)}
                                                className="flex-1 py-3 px-6 bg-orange-500 text-white rounded-lg font-semibold 
                                                       hover:bg-orange-600 transition-colors duration-300"
                                            >
                                                View Details
                                            </button>
                                            <button className="p-3 border-2 border-red-400 text-red-400 rounded-lg hover:bg-red-50 
                                                   transition-colors duration-300">
                                                <FaHeart className="text-xl" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Show More Button */}
                {!showAll && products.length > visibleProducts.length && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex justify-center mt-12"
                    >
                        <motion.button
                            onClick={handleShowMore}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="group flex items-center gap-3 bg-gradient-to-r from-orange-500 to-red-500 
                                    text-white px-8 py-4 rounded-full font-semibold shadow-lg 
                                    hover:shadow-xl transition-all duration-300"
                        >
                            <span>Discover More</span>
                            <FaChevronRight className="group-hover:translate-x-2 transition-transform duration-300" />
                        </motion.button>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default BestSeller;
