// CartTotal.jsx
import React, { useContext } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from './Title';

const CartTotal = () => {
  const { currency, getCartAmount } = useContext(ShopContext);

  const subtotal = getCartAmount(); // Sum of cost for all items
  // No shipping fee
  const total = subtotal; // No shipping

  return (
    <div className="w-full border rounded-md p-4">
      <div className="text-2xl mb-3">
        <Title text1="CART" text2="TOTALS" />
      </div>
      <div className="flex flex-col gap-2 mt-2 text-sm">
        <div className="flex justify-between items-center">
          <p className="font-medium">Subtotal</p>
          <p className="text-gray-700 font-semibold">
            {currency}{subtotal.toFixed(2)}
          </p>
        </div>
        <hr />
        {/* Removed shipping fee lines entirely */}
        <div className="flex justify-between items-center">
          <b className="font-medium">Total</b>
          <b className="text-gray-800">
            {currency}{total.toFixed(2)}
          </b>
        </div>
      </div>
    </div>
  );
};

export default CartTotal;
