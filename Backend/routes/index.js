const express = require('express');

const homeController = require('../controller/homeController');
const monitoringController = require('../controller/monitoringController');
const pspController = require('../controller/pspController');


const routerInitialize = (config) => {
    const router = express.Router();


    router.use('/home', homeController({ config }));
    router.use('/admin/monitoring', monitoringController({ config }));
    router.use('/home/psp', pspController({ config }));

    return router;
}

module.exports = routerInitialize;
