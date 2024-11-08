const AuthService = require('../services/auth.service');
const logger = require('../config/logger.config');

class AuthController {
  async register(request, reply) {
    try {
      const { user, token } = await AuthService.register(request.body);
      return reply.code(201).send({
        success: true,
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role
          },
          token
        }
      });
    } catch (error) {
      logger.error('Error in register controller:', error);
      return reply.code(400).send({
        success: false,
        error: error.message
      });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const { user, token } = await AuthService.login(email, password);
      
      return res.code(200).send({
        success: true,
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role
          },
          token
        }
      });
    } catch (error) {
      logger.error('Error in login controller:', error);
      return res.code(401).send({
        success: false,
        error: error.message
      });
    }
  }

  async logout(req, res) {
    try {
      // In a more complex implementation, you might want to invalidate the token
      // For now, we'll just send a success response
      return res.code(200).send({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      logger.error('Error in logout controller:', error);
      return res.code(500).send({
        success: false,
        error: error.message
      });
    }
  }

  async requestPasswordReset(req, res) {
    try {
      const { email } = req.body;
      await AuthService.requestPasswordReset(email);
      
      return res.code(200).send({
        success: true,
        message: 'Password reset email sent successfully'
      });
    } catch (error) {
      logger.error('Error in requestPasswordReset controller:', error);
      return res.code(400).send({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new AuthController();