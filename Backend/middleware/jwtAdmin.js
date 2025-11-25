
const db = require('../database/db_helper');
const { Sequelize, QueryTypes } = require('sequelize');
const jwt = require('jsonwebtoken');
const { success } = require("../model/responseModel");
const adminService = require('../services/adminService');
const requestIp = require('request-ip');
const { PassThrough } = require('stream');
const correlator = require('express-correlation-id');
const { API_STATUS } = require("../model/enumModel");

const can_skip_url = (url) => {
    if (url == '/api_history_logs') {
        return true;
    }
    if (url == '/user_history_logs') {
        return true;
    }
    return false;
}

const verifyTokenAdmin = async (req, res, next) => {
    /************************ API REQ LOG ************************************/
    const defaultWrite = res.write.bind(res);
    const defaultEnd = res.end.bind(res);
    const ps = new PassThrough();
    const chunks = [];
    ps.on('data', data => {
        chunks.push(data);
    });
    res.write = (...args) => {
        ps.write(...args);
        defaultWrite(...args);
    };
    res.end = (...args) => {
        ps.end(...args);
        defaultEnd(...args);
    };
    res.on('finish', () => {
        try {
            if (req.token_data != null) {
                var resp_data = '';
                if (res.get('Content-type') == 'application/json; charset=utf-8' || res.get('Content-type') == 'application/json' ||
                    res.get('Content-type') == 'application/xml; charset=utf-8' || res.get('Content-type') == 'application/xml' ||
                    res.get('Content-type') == 'text/html; charset=utf-8' || res.get('Content-type') == 'text/html') {
                    resp_data = Buffer.concat(chunks).toString();
                }
                var ip_address = ''; try { const clientIp = requestIp.getClientIp(req); ip_address = clientIp; } catch { }
                var data_to_log = {
                    correlation_id: correlator.getId(),
                    token_id: req.token_data.token_id,
                    account_id: req.token_data.account_id,
                    user_type: 1,
                    table_id: req.token_data.admin_id,
                    url: req.url,
                    method: req.method,
                    payload: JSON.stringify(req.body),
                    ip_address: ip_address,
                    date_time: db.get_ist_current_date(),
                    response: resp_data,
                };
                if (!can_skip_url(req.url)) {
                  
                }
            }
        } catch (_) {
        }
    });
    /************************ API REQ LOG ************************************/

    const accessToken = req.headers["x-access-token"];
    if (!accessToken) {
        return res.status(200).json(success(false, API_STATUS.SESSION_EXPIRED.value, "Access token is required for authentication.", null));
    }
    try {
        const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN_KEY);
        const authKey = req.headers["x-auth-key"];
        if (!authKey) {
            return res.status(200).json(success(false, API_STATUS.SESSION_EXPIRED.value, "Auth key is required for authentication.", null));
        }
        const user_data = await adminService.token_data(authKey);

        if (!user_data || user_data.length <= 0) {
            return res.status(200).json(success(false, API_STATUS.SESSION_EXPIRED.value, "Session is expired or invalid.", null));
        }
        if (user_data[0].is_deleted) {
            return res.status(200).json(success(false, API_STATUS.SESSION_EXPIRED.value, "Your account does not exist.", null));
        }
        if (user_data[0].is_logout) {
            return res.status(200).json(success(false, API_STATUS.SESSION_EXPIRED.value, "Session is expired or invalid.", null));
        }
        if (!user_data[0].is_master) {
            if (!user_data[0].is_enabled) {
                return res.status(200).json(success(false, API_STATUS.SESSION_EXPIRED.value, "Your account has been blocked, contact system administrator.", null));
            }
        }
        req.token_data = user_data[0];
        req.token_data.auth_key = authKey;

        console.log(req.token_data);
    } catch (err) {

        return res.status(200).json(success(false, API_STATUS.SESSION_EXPIRED.value, "Unauthorized! Invalid access token.", null));
    }
    return next();
};

module.exports = verifyTokenAdmin;