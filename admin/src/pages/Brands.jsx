import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaArrowUp } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import { backendUrl } from '../App';

const Brands = ({ token }) => {
    const [brands, setBrands] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBrand, setEditingBrand] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        logo: null
    });

    const fetchBrands = async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/brand/list`);
            if (response.data.success) {
                setBrands(response.data.brands);
            }
        } catch (error) {
            toast.error('Error fetching brands');
        }
    };

    useEffect(() => {
        fetchBrands();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('name', formData.name);
        data.append('description', formData.description);
        if (formData.logo) {
            data.append('logo', formData.logo);
        }

        try {
            const url = `${backendUrl}/api/brand/${editingBrand ? 'update' : 'add'}`;
            
            if (editingBrand) {
                data.append('id', editingBrand._id);
            }

            const response = await axios({
                method: 'POST',
                url: url,
                headers: {
                    'token': token,
                },
                data: data,
                withCredentials: true
            });

            if (response.data.success) {
                toast.success(editingBrand ? 'Brand updated!' : 'Brand added!');
                setIsModalOpen(false);
                setEditingBrand(null);
                setFormData({ name: '', description: '', logo: null });
                fetchBrands();
            } else {
                throw new Error(response.data.message || 'Failed to save brand');
            }
        } catch (error) {
            console.error('API Error:', error);
            toast.error(error.response?.data?.message || 'Error saving brand');
        }
    };

    const handleDelete = async (brandId) => {
        if (window.confirm('Are you sure you want to delete this brand?')) {
            try {
                const response = await axios({
                    method: 'DELETE',
                    url: `${backendUrl}/api/brand/delete`,
                    headers: { token: localStorage.getItem('token') },
                    data: { id: brandId },
                    withCredentials: true
                });

                if (response.data.success) {
                    toast.success('Brand deleted!');
                    fetchBrands();
                } else {
                    throw new Error(response.data.message || 'Failed to delete brand');
                }
            } catch (error) {
                console.error('Delete Error:', error);
                toast.error(error.response?.data?.message || 'Error deleting brand');
            }
        }
    };

    const bringToTop = async (brandId) => {
        try {
            const response = await axios({
                method: 'POST',
                url: `${backendUrl}/api/brand/bring-to-top`,
                headers: { token },
                data: { id: brandId },
                withCredentials: true
            });

            if (response.data.success) {
                toast.success('Brand moved to top!');
                fetchBrands();
            }
        } catch (error) {
            console.error('Bring to top error:', error);
            toast.error(error.response?.data?.message || 'Error updating brand position');
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">Manage Brands</h1>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    onClick={() => setIsModalOpen(true)}
                >
                    <FaPlus /> Add Brand
                </motion.button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {brands.map((brand) => (
                    <motion.div
                        key={brand._id}
                        className="bg-white rounded-lg shadow-md p-4"
                        whileHover={{ y: -5 }}
                    >
                        <img
                            src={brand.logo}
                            alt={brand.name}
                            className="w-32 h-32 object-contain mx-auto mb-4"
                        />
                        <h3 className="text-xl font-semibold text-center">{brand.name}</h3>
                        <p className="text-gray-600 text-center mt-2">{brand.description}</p>
                        <div className="flex justify-center gap-4 mt-4">
                            <button
                                onClick={() => bringToTop(brand._id)}
                                className="text-green-600 hover:text-green-800"
                                title="Bring to Top"
                            >
                                <FaArrowUp size={20} />
                            </button>
                            <button
                                onClick={() => {
                                    setEditingBrand(brand);
                                    setFormData({
                                        name: brand.name,
                                        description: brand.description,
                                        logo: null
                                    });
                                    setIsModalOpen(true);
                                }}
                                className="text-blue-600 hover:text-blue-800"
                            >
                                <FaEdit size={20} />
                            </button>
                            <button
                                onClick={() => handleDelete(brand._id)}
                                className="text-red-600 hover:text-red-800"
                            >
                                <FaTrash size={20} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white rounded-lg p-6 w-full max-w-md"
                    >
                        <h2 className="text-xl font-bold mb-4">
                            {editingBrand ? 'Edit Brand' : 'Add New Brand'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Brand Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    className="w-full p-2 border rounded"
                                    rows="3"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Logo</label>
                                <input
                                    type="file"
                                    onChange={(e) => setFormData({...formData, logo: e.target.files[0]})}
                                    className="w-full"
                                    accept="image/*"
                                    {...(!editingBrand && { required: true })}
                                />
                            </div>
                            <div className="flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setEditingBrand(null);
                                    }}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    {editingBrand ? 'Update' : 'Add'} Brand
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Brands;