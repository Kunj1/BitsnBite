const Cart = require('../models/Cart');
const Restaurant = require('../models/Restaurant');
const logger = require('../config/logger.config');

class CartService {
  getCart(userId) {
    return new Promise((resolve, reject) => {
      Cart.findOne({ user: userId })
        .populate([
          { path: 'restaurant', select: 'name address minimumOrder deliveryFee' },
          { path: 'items.item', select: 'name price description' }
        ])
        .then(cart => resolve(cart))
        .catch(error => {
          logger.error('Error in getCart service:', error);
          reject(error);
        });
    });
  }

  addToCart(userId, restaurantId, itemId, quantity) {
    return new Promise((resolve, reject) => {
      let userCart;
      let menuItem;

      // First check if user already has a cart
      Cart.findOne({ user: userId })
        .then(existingCart => {
          // If cart exists but with different restaurant, clear it
          if (existingCart && existingCart.restaurant.toString() !== restaurantId) {
            return Cart.findOneAndDelete({ user: userId });
          }
          return existingCart;
        })
        .then(cart => {
          // Get restaurant and validate menu item
          return Restaurant.findById(restaurantId)
            .then(restaurant => {
              if (!restaurant) {
                throw new Error('Restaurant not found');
              }
              
              menuItem = restaurant.menu.id(itemId);
              if (!menuItem) {
                throw new Error('Menu item not found');
              }

              if (!cart) {
                // Create new cart if doesn't exist
                userCart = new Cart({
                  user: userId,
                  restaurant: restaurantId,
                  items: [{
                    item: itemId,
                    quantity: quantity
                  }],
                  totalAmount: menuItem.price * quantity
                });
                return userCart.save();
              } else {
                // Update existing cart
                userCart = cart;
                const existingItem = cart.items.find(item => 
                  item.item.toString() === itemId
                );

                if (existingItem) {
                  existingItem.quantity += quantity;
                } else {
                  cart.items.push({
                    item: itemId,
                    quantity: quantity
                  });
                }

                // Recalculate total
                cart.totalAmount = cart.items.reduce((total, item) => {
                  const itemInMenu = restaurant.menu.id(item.item);
                  return total + (itemInMenu.price * item.quantity);
                }, 0);

                cart.updatedAt = Date.now();
                return cart.save();
              }
            });
        })
        .then(savedCart => {
          return savedCart.populate([
            { path: 'restaurant', select: 'name address minimumOrder deliveryFee' },
            { path: 'items.item', select: 'name price description' }
          ]);
        })
        .then(populatedCart => resolve(populatedCart))
        .catch(error => {
          logger.error('Error in addToCart service:', error);
          reject(error);
        });
    });
  }

  updateCartItem(userId, itemId, quantity) {
    return new Promise((resolve, reject) => {
      Cart.findOne({ user: userId })
        .then(cart => {
          if (!cart) {
            throw new Error('Cart not found');
          }

          const cartItem = cart.items.find(item => 
            item.item.toString() === itemId
          );

          if (!cartItem) {
            throw new Error('Item not found in cart');
          }

          // If quantity is 0, remove item
          if (quantity === 0) {
            cart.items = cart.items.filter(item => 
              item.item.toString() !== itemId
            );
          } else {
            cartItem.quantity = quantity;
          }

          // Recalculate total amount
          return Restaurant.findById(cart.restaurant)
            .then(restaurant => {
              cart.totalAmount = cart.items.reduce((total, item) => {
                const menuItem = restaurant.menu.id(item.item);
                return total + (menuItem.price * item.quantity);
              }, 0);

              cart.updatedAt = Date.now();
              return cart.save();
            });
        })
        .then(savedCart => {
          return savedCart.populate([
            { path: 'restaurant', select: 'name address minimumOrder deliveryFee' },
            { path: 'items.item', select: 'name price description' }
          ]);
        })
        .then(populatedCart => resolve(populatedCart))
        .catch(error => {
          logger.error('Error in updateCartItem service:', error);
          reject(error);
        });
    });
  }

  removeFromCart(userId, itemId) {
    return new Promise((resolve, reject) => {
      Cart.findOne({ user: userId })
        .then(cart => {
          if (!cart) {
            throw new Error('Cart not found');
          }

          cart.items = cart.items.filter(item => 
            item.item.toString() !== itemId
          );

          // If cart is empty after removing item, delete the cart
          if (cart.items.length === 0) {
            return Cart.findByIdAndDelete(cart._id);
          }

          // Recalculate total amount
          return Restaurant.findById(cart.restaurant)
            .then(restaurant => {
              cart.totalAmount = cart.items.reduce((total, item) => {
                const menuItem = restaurant.menu.id(item.item);
                return total + (menuItem.price * item.quantity);
              }, 0);

              cart.updatedAt = Date.now();
              return cart.save();
            });
        })
        .then(result => {
          if (!result) {
            return resolve(null);
          }
          return result.populate([
            { path: 'restaurant', select: 'name address minimumOrder deliveryFee' },
            { path: 'items.item', select: 'name price description' }
          ]);
        })
        .then(populatedCart => resolve(populatedCart))
        .catch(error => {
          logger.error('Error in removeFromCart service:', error);
          reject(error);
        });
    });
  }

  clearCart(userId) {
    return new Promise((resolve, reject) => {
      Cart.findOneAndDelete({ user: userId })
        .then(() => resolve())
        .catch(error => {
          logger.error('Error in clearCart service:', error);
          reject(error);
        });
    });
  }
}

module.exports = CartService;