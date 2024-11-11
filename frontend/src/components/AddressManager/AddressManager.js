import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Map from '../Map/Map';

export default function AddressManager() {
  const { user, updateProfile } = useAuth();
  const [addresses, setAddresses] = useState(user.addresses || []);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    type: 'Home',
    address: '',
    landmark: '',
    addressLatLng: null
  });

  const addressTypes = ['Home', 'Work', 'Other'];

  const handleAddAddress = () => {
    if (!newAddress.address || !newAddress.addressLatLng) return;
    
    const updatedAddresses = [...addresses, newAddress];
    setAddresses(updatedAddresses);
    updateProfile({ ...user, addresses: updatedAddresses });
    setShowAddForm(false);
    setNewAddress({
      type: 'Home',
      address: '',
      landmark: '',
      addressLatLng: null
    });
  };

  const handleRemoveAddress = (index) => {
    const updatedAddresses = addresses.filter((_, i) => i !== index);
    setAddresses(updatedAddresses);
    updateProfile({ ...user, addresses: updatedAddresses });
  };

  const setDefaultAddress = (index) => {
    updateProfile({ ...user, defaultAddress: index });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Saved Addresses</h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Add New Address
        </button>
      </div>

      {/* Saved Addresses */}
      <div className="space-y-4">
        {addresses.map((addr, index) => (
          <div key={index} className="border p-4 rounded flex justify-between items-center">
            <div>
              <span className="bg-gray-100 px-2 py-1 rounded text-sm">
                {addr.type}
              </span>
              <p className="mt-2">{addr.address}</p>
              {addr.landmark && (
                <p className="text-sm text-gray-600">Landmark: {addr.landmark}</p>
              )}
            </div>
            <div className="space-x-2">
              <button
                onClick={() => setDefaultAddress(index)}
                className={`px-3 py-1 rounded ${
                  user.defaultAddress === index
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100'
                }`}
              >
                Default
              </button>
              <button
                onClick={() => handleRemoveAddress(index)}
                className="text-red-500"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Address Form */}
      {showAddForm && (
        <div className="border p-4 rounded space-y-4">
          <select
            value={newAddress.type}
            onChange={(e) => setNewAddress({ ...newAddress, type: e.target.value })}
            className="w-full p-2 border rounded"
          >
            {addressTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          
          <input
            type="text"
            placeholder="Enter address"
            value={newAddress.address}
            onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
            className="w-full p-2 border rounded"
          />
          
          <input
            type="text"
            placeholder="Landmark (optional)"
            value={newAddress.landmark}
            onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
            className="w-full p-2 border rounded"
          />
          
          <div className="h-48">
            <Map
              location={newAddress.addressLatLng}
              onChange={(latlng) => setNewAddress({ ...newAddress, addressLatLng: latlng })}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleAddAddress}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Save Address
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="bg-gray-100 px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}