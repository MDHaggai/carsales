// components/ProductItem.jsx

import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import { Link } from 'react-router-dom';
import { assets } from '../assets/assets';
import axios from 'axios';
import { backendUrl } from '../App';

const ProductItem = ({ product }) => {
  const { currency } = useContext(ShopContext);
  const [rating, setRating] = useState(0);

  // Add null check for product
  if (!product || !product.images || !product.images.length) {
    return null;
  }

  const { _id: id, name, price, images, isBestSeller } = product;

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/reviews/${id}`);
        if (response.data.success && response.data.reviews.length > 0) {
          const avgRating = response.data.reviews.reduce((acc, rev) => acc + rev.rating, 0) / response.data.reviews.length;
          setRating(Math.round(avgRating));
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };

    if (id) {
      fetchReviews();
    }
  }, [id]);

  return (
    <div className='text-gray-700 cursor-pointer'>
      <Link to={`/product/${id}`}>
        <div className='overflow-hidden bg-white rounded-lg shadow-md p-4 flex flex-col h-full transition-transform duration-300 hover:scale-105 hover:shadow-lg'>
          <div className='relative'>
            <img
              className='w-full h-48 object-cover rounded-md transition-transform duration-300 hover:scale-110'
              src={images[0]}
              alt={name}
              loading='lazy'
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = assets.placeholder_image; // Make sure you have a placeholder image
              }}
            />
            {isBestSeller && (
              <span className='absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded'>
                Best Seller
              </span>
            )}
          </div>
          <div className='flex flex-col items-center text-center mt-4 flex-grow'>
            <p className='text-lg font-bold text-blue-600 mb-2 line-clamp-2' title={name}>
              {name}
            </p>
            <div className='flex items-center mb-2'>
              {[...Array(5)].map((_, i) => (
                <img
                  key={i}
                  src={i < rating ? assets.star_icon : assets.star_dull_icon}
                  alt="Star"
                  className='w-4 h-4'
                />
              ))}
            </div>
            <p className='text-md font-semibold text-gray-600'>
              {currency}{typeof price === 'number' ? price.toFixed(2) : '0.00'}
            </p>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductItem;
