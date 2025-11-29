const { Pool } = require('pg');
const { success } = require("../model/responseModel");
const crypto = require('crypto');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

// -------------------------
// Get All Users (for Admin Dashboard)
// -------------------------
const GetAllUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, user_role } = req.query;

        let query = `SELECT id, unique_id, username, full_name, email, agent_tin, ghana_card_number, user_role, is_active, created_at
                     FROM users WHERE 1=1`;
        const params = [];
        let paramIndex = 1;

        // Filter by user_role if provided
        if (user_role) {
            query += ` AND user_role = $${paramIndex}`;
            params.push(user_role);
            paramIndex++;
        }

        // Search by name, agent_tin, ghana_card_number, or email
        if (search) {
            query += ` AND (full_name ILIKE $${paramIndex} OR agent_tin ILIKE $${paramIndex} OR ghana_card_number ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR username ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        // Get total count for pagination
        const countQuery = query.replace(/SELECT .* FROM/, 'SELECT COUNT(*) as total FROM');
        const countResult = await pool.query(countQuery, params);
        const total = parseInt(countResult.rows[0].total);

        // Add ordering and pagination
        query += ` ORDER BY id DESC`;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(parseInt(limit), offset);

        const result = await pool.query(query, params);

        return res.status(200).json(
            success(true, 200, "Users fetched successfully", {
                users: result.rows,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / parseInt(limit))
                }
            })
        );

    } catch (err) {
        console.error("GetAllUsers error:", err);
        return res.status(500).json(success(false, 500, err.message, null));
    }
};

// -------------------------
// Get User by ID
// -------------------------
const GetUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT id, unique_id, username, full_name, email, agent_tin, ghana_card_number, user_role, is_active, created_at, updated_at
             FROM users WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json(
                success(false, 404, "User not found", null)
            );
        }

        return res.status(200).json(
            success(true, 200, "User fetched successfully", {
                user: result.rows[0]
            })
        );

    } catch (err) {
        console.error("GetUserById error:", err);
        return res.status(500).json(success(false, 500, err.message, null));
    }
};

// -------------------------
// Add New User (Admin)
// -------------------------
const AddUser = async (req, res) => {
    try {
        const { first_name, last_name, tin: agent_tin, ghana_id, user_role, email, password, username } = req.body;

        console.log("Adding new user:", { first_name, last_name, agent_tin, ghana_id, user_role, username });

        // Validate required fields
        if (!first_name || !last_name) {
            return res.status(400).json(
                success(false, 400, "First name and last name are required", null)
            );
        }

        if (!user_role) {
            return res.status(400).json(
                success(false, 400, "User role is required", null)
            );
        }

        if (!username) {
            return res.status(400).json(
                success(false, 400, "User ID is required", null)
            );
        }

        if (!password) {
            return res.status(400).json(
                success(false, 400, "Password is required", null)
            );
        }

        // Validate user_role
        const validRoles = ['gra_maker', 'gra_checker', 'monitoring', 'resident', 'nonresident', 'admin'];
        if (!validRoles.includes(user_role)) {
            return res.status(400).json(
                success(false, 400, `Invalid user role. Must be one of: ${validRoles.join(', ')}`, null)
            );
        }

        const full_name = `${first_name} ${last_name}`;
        const unique_id = crypto.randomUUID();
        const finalUsername = username;

        // Check if user already exists with same username
        const existingUsername = await pool.query('SELECT id FROM users WHERE username = $1', [finalUsername]);
        if (existingUsername.rows.length > 0) {
            return res.status(400).json(
                success(false, 400, "A user with this User ID already exists", null)
            );
        }

        // Check if user already exists with same TIN or Ghana ID
        if (agent_tin) {
            const existingTIN = await pool.query('SELECT id FROM users WHERE agent_tin = $1', [agent_tin]);
            if (existingTIN.rows.length > 0) {
                return res.status(400).json(
                    success(false, 400, "A user with this TIN already exists", null)
                );
            }
        }

        if (ghana_id) {
            const existingGhanaId = await pool.query('SELECT id FROM users WHERE ghana_card_number = $1', [ghana_id]);
            if (existingGhanaId.rows.length > 0) {
                return res.status(400).json(
                    success(false, 400, "A user with this Ghana ID already exists", null)
                );
            }
        }

        // Insert new user
        const result = await pool.query(
            `INSERT INTO users (
                unique_id, username, full_name, agent_tin, ghana_card_number, user_role,
                email, password, contact_method, contact_value, is_verified, is_active
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
             RETURNING id, unique_id, username, full_name, agent_tin, ghana_card_number, user_role, email, is_active, created_at`,
            [
                unique_id,
                finalUsername,
                full_name,
                agent_tin || null,
                ghana_id || null,
                user_role,
                email || null,
                password,
                email ? 'email' : 'mobile',
                email || agent_tin || ghana_id || finalUsername,
                true,
                true
            ]
        );

        return res.status(201).json(
            success(true, 201, "User added successfully", {
                user: result.rows[0]
            })
        );

    } catch (err) {
        console.error("AddUser error:", err);
        if (err.code === '23505') {
            return res.status(400).json(
                success(false, 400, "User with this identifier already exists", null)
            );
        }
        return res.status(500).json(success(false, 500, err.message, null));
    }
};

// -------------------------
// Update User (Admin)
// -------------------------
const UpdateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { first_name, last_name, tin: agent_tin, ghana_id, user_role, email, is_active } = req.body;

        console.log("Updating user:", { id, first_name, last_name, agent_tin, ghana_id, user_role });

        // Check if user exists
        const existingUser = await pool.query('SELECT id FROM users WHERE id = $1', [id]);
        if (existingUser.rows.length === 0) {
            return res.status(404).json(
                success(false, 404, "User not found", null)
            );
        }

        // Validate user_role if provided
        if (user_role) {
            const validRoles = ['gra_maker', 'gra_checker', 'monitoring', 'resident', 'nonresident', 'admin'];
            if (!validRoles.includes(user_role)) {
                return res.status(400).json(
                    success(false, 400, `Invalid user role. Must be one of: ${validRoles.join(', ')}`, null)
                );
            }
        }

        // Build dynamic update query
        const updates = [];
        const params = [];
        let paramIndex = 1;

        if (first_name || last_name) {
            const full_name = `${first_name || ''} ${last_name || ''}`.trim();
            if (full_name) {
                updates.push(`full_name = $${paramIndex}`);
                params.push(full_name);
                paramIndex++;
            }
        }

        if (agent_tin !== undefined) {
            updates.push(`agent_tin = $${paramIndex}`);
            params.push(agent_tin || null);
            paramIndex++;
        }

        if (ghana_id !== undefined) {
            updates.push(`ghana_card_number = $${paramIndex}`);
            params.push(ghana_id || null);
            paramIndex++;
        }

        if (user_role) {
            updates.push(`user_role = $${paramIndex}`);
            params.push(user_role);
            paramIndex++;
        }

        if (email !== undefined) {
            updates.push(`email = $${paramIndex}`);
            params.push(email || null);
            paramIndex++;
        }

        if (is_active !== undefined) {
            updates.push(`is_active = $${paramIndex}`);
            params.push(is_active);
            paramIndex++;
        }

        if (updates.length === 0) {
            return res.status(400).json(
                success(false, 400, "No fields to update", null)
            );
        }

        updates.push('updated_at = NOW()');

        params.push(id);
        const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex}
                       RETURNING id, unique_id, username, full_name, agent_tin, ghana_card_number, user_role, email, is_active, updated_at`;

        const result = await pool.query(query, params);

        return res.status(200).json(
            success(true, 200, "User updated successfully", {
                user: result.rows[0]
            })
        );

    } catch (err) {
        console.error("UpdateUser error:", err);
        return res.status(500).json(success(false, 500, err.message, null));
    }
};

// -------------------------
// Delete User (Admin)
// -------------------------
const DeleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if user exists
        const existingUser = await pool.query('SELECT id, username FROM users WHERE id = $1', [id]);
        if (existingUser.rows.length === 0) {
            return res.status(404).json(
                success(false, 404, "User not found", null)
            );
        }

        // Prevent deletion of admin user
        if (existingUser.rows[0].username === 'admin') {
            return res.status(403).json(
                success(false, 403, "Cannot delete the system administrator account", null)
            );
        }

        // Delete user
        await pool.query('DELETE FROM users WHERE id = $1', [id]);

        return res.status(200).json(
            success(true, 200, "User deleted successfully", null)
        );

    } catch (err) {
        console.error("DeleteUser error:", err);
        return res.status(500).json(success(false, 500, err.message, null));
    }
};

// -------------------------
// Get User Roles (for dropdown)
// -------------------------
const GetUserRoles = async (req, res) => {
    try {
        const roles = [
            { value: 'resident', label: 'Resident' },
            { value: 'nonresident', label: 'Non-Resident' },
            { value: 'gra_maker', label: 'GRA Maker' },
            { value: 'gra_checker', label: 'GRA Checker' },
            { value: 'monitoring', label: 'Monitoring' },
            { value: 'admin', label: 'Administrator' }
        ];

        return res.status(200).json(
            success(true, 200, "User roles fetched successfully", {
                roles
            })
        );

    } catch (err) {
        console.error("GetUserRoles error:", err);
        return res.status(500).json(success(false, 500, err.message, null));
    }
};

module.exports = {
    GetAllUsers,
    GetUserById,
    AddUser,
    UpdateUser,
    DeleteUser,
    GetUserRoles
};
