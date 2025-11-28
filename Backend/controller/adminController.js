const adminService = require('../services/adminService');

module.exports = ({ config }) => {
    const router = config.express.Router();

    // GET /v1/admin/users - Get all users with pagination and search
    router.get('/users', (req, res, next) => {
        return adminService.GetAllUsers(req, res, next);
    });

    // GET /v1/admin/users/roles - Get available user roles
    router.get('/users/roles', (req, res, next) => {
        return adminService.GetUserRoles(req, res, next);
    });

    // GET /v1/admin/users/:id - Get user by ID
    router.get('/users/:id', (req, res, next) => {
        return adminService.GetUserById(req, res, next);
    });

    // POST /v1/admin/users - Add new user
    router.post('/users', (req, res, next) => {
        return adminService.AddUser(req, res, next);
    });

    // PUT /v1/admin/users/:id - Update user
    router.put('/users/:id', (req, res, next) => {
        return adminService.UpdateUser(req, res, next);
    });

    // DELETE /v1/admin/users/:id - Delete user
    router.delete('/users/:id', (req, res, next) => {
        return adminService.DeleteUser(req, res, next);
    });

    return router;
};
