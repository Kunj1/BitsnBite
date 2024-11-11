import React from 'react';

export default function OrderSummary({ order, onTipChange, onDiscountApply }) {
  const [tip, setTip] = useState(0);
  const [discountCode, setDiscountCode] = useState('');

  const tipOptions = [0, 20, 30, 50];

  const handleTipChange = (amount) => {
    setTip(amount);
    onTipChange(amount);
  };

  const handleDiscountApply = () => {
    // Demo discount codes: FIRST50, WELCOME20
    let discountAmount = 0;
    if (discountCode === 'FIRST50') discountAmount = order.totalPrice * 0.5;
    else if (discountCode === 'WELCOME20') discountAmount = order.totalPrice * 0.2;
    onDiscountApply(discountAmount, discountCode);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Item Total</span>
          <span>₹{order.totalPrice}</span>
        </div>
        <div className="flex justify-between">
          <span>Delivery Fee</span>
          <span>₹40</span>
        </div>
        <div className="flex justify-between">
          <span>Taxes</span>
          <span>₹{Math.round(order.totalPrice * 0.05)}</span>
        </div>

        {/* Tip Selection */}
        <div className="my-4">
          <p className="mb-2">Add a tip for your delivery partner</p>
          <div className="flex gap-2">
            {tipOptions.map(amount => (
              <button
                key={amount}
                onClick={() => handleTipChange(amount)}
                className={`px-4 py-2 rounded ${
                  tip === amount ? 'bg-green-500 text-white' : 'bg-gray-100'
                }`}
              >
                ₹{amount}
              </button>
            ))}
          </div>
        </div>

        {/* Discount Code */}
        <div className="my-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter discount code"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
              className="p-2 border rounded"
            />
            <button
              onClick={handleDiscountApply}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Apply
            </button>
          </div>
        </div>

        <div className="border-t pt-2">
          <div className="flex justify-between font-bold">
            <span>Grand Total</span>
            <span>₹{order.totalPrice + 40 + Math.round(order.totalPrice * 0.05) + tip}</span>
          </div>
        </div>
      </div>
    </div>
  );
}