const UserService = require('../services/user.service');
const logger = require('../config/logger.config');

class UserController {
  async getUsers(request, reply) {
    try {
      const users = await UserService.getAllUsers();
      return reply.code(200).send({ success: true, data: users });
    } catch (error) {
      logger.error('Error in getUsers controller:', error);
      return reply.code(500).send({ success: false, error: 'Internal Server Error' });
    }
  }

  async getUserById(request, reply) {
    try {
      const { id } = request.params;
      const user = await UserService.getUserById(id);
      return reply.code(200).send({ success: true, data: user });
    } catch (error) {
      logger.error(`Error in getUserById controller for id ${request.params.id}:`, error);
      if (error.message === 'User not found') {
        return reply.code(404).send({ success: false, error: 'User not found' });
      }
      return reply.code(500).send({ success: false, error: 'Internal Server Error' });
    }
  }

  async updateUser(request, reply) {
    try {
      const { id } = request.params;
      const updateData = request.body;
      const updatedUser = await UserService.updateUser(id, updateData);
      return reply.code(200).send({ success: true, data: updatedUser });
    } catch (error) {
      logger.error(`Error in updateUser controller for id ${request.params.id}:`, error);
      if (error.message === 'User not found') {
        return reply.code(404).send({ success: false, error: 'User not found' });
      }
      return reply.code(500).send({ success: false, error: 'Internal Server Error' });
    }
  }
}

module.exports = new UserController();