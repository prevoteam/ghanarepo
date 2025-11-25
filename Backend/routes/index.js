const express = require('express');

const homeController = require('../controller/homeController');


const routerInitialize = (config) => {
    const router = express.Router();

 
    router.use('/home', homeController({ config }));

    return router;
}

module.exports = routerInitialize;
