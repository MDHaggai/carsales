import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';
import ProductItem from './ProductItem';
import { motion } from 'framer-motion';

const RelatedProducts = ({ brand, currentProductId }) => {
    const { products } = useContext(ShopContext);
    const [related, setRelated] = useState([]);

    useEffect(() => {
        console.log("RelatedProducts mounted/updated with props:", { brand, currentProductId });
        
        if (products.length > 0 && brand) {
            // Create a copy of products
            let productsCopy = products.slice();
            
            // Filter products to match the brand and exclude current product
            productsCopy = productsCopy.filter((item) => 
                item.brand === brand && item._id !== currentProductId
            );
            
            console.log(`Found ${productsCopy.length} related products for brand: ${brand}`);
            
            // Take up to 5 related products
            setRelated(productsCopy.slice(0, 5));
        }
    }, [products, brand, currentProductId]);

    // More verbose render condition
    if (related.length === 0) {
        console.log("No related products to display, returning null");
        return null;
    }

    console.log("Rendering RelatedProducts with:", related.length, "items");

    return (
        <motion.div 
            className='my-16'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className='text-center text-3xl py-2 mb-8'>
                <Title text1={'MORE FROM'} text2={brand?.toUpperCase() || ''} />
            </div>

            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
                {related.map((item, index) => (
                    <motion.div
                        key={item._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        {/* Pass the entire item object as the product prop */}
                        <ProductItem product={item} />
                    </motion.div>
                ))}
            </div>
        </motion.div>
    )
}

export default RelatedProducts
