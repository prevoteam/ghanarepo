const express = require('express');

const homeController = require('../controller/homeController');
const monitoringController = require('../controller/monitoringController');
const pspController = require('../controller/pspController');
const adminController = require('../controller/adminController');


const routerInitialize = (config) => {
    const router = express.Router();


    router.use('/home', homeController({ config }));
    router.use('/admin/monitoring', monitoringController({ config }));
    router.use('/home/psp', pspController({ config }));
    router.use('/admin', adminController({ config }));

    return router;
}

module.exports = routerInitialize;
