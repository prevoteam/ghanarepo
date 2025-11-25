require("dotenv").config()
const { Sequelize, DataTypes, QueryTypes } = require('sequelize');
const { Constants } = require("../model/constantModel");
const { JWT } = require('google-auth-library');
const url = require('url');
const { parse, format } = require('date-fns');
const { utcToZonedTime } = require('date-fns-tz');
const timeZone = 'Asia/Kolkata';
const { execSync } = require('child_process');
const fs = require('fs');



module.exports = db = {
    initialize,
    get_uploads_url,
    get_ist_current_date,
    convert_db_date_to_ist,
    slugify_url,
    isValidIP,
    get_apigee_token,
    isValidURL,
    convertStringToJson,
    buildQuery_Obj,
    buildQuery_Array,
    string_to_date,
    upto_date,
    convert_dateformat,
    curl_to_code,
    delete_uploaded_files,
};

async function initialize() {
    const options = {
        dialect: 'postgres',
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        dialectOptions: {
            connectTimeout: 220000
            },
            pool: {
            max: 350,
            min: 0,
            acquire: 220000,
            idle: 10000
            },
            define: {
            freezeTableName: true,
            timestamps: false
            },
            retry: {
              match: [/SequelizeConnectionError/, /SequelizeConnectionRefusedError/],
              max: 5          // Retry up to 5 times
            }
     
    };
    const sequelize = new Sequelize(options);

    db.sequelize = sequelize;
    await sequelize.authenticate();
    console.log('Database connected successfully.');
}

function get_uploads_url(req) {
     //return ''
    return process.env.FRONT_SITE_URL + 'uploads/'
}

function get_ist_current_date() {
    const now = new Date();
    const currentTimeInIST = new Date(now.getTime() + Constants.istOffsetMinutes * 60 * 1000);
    return currentTimeInIST;
}

function convert_db_date_to_ist(now) {
    // if (now) {
    //     const currentTimeInIST = new Date(now.getTime() + Constants.istOffsetMinutes * 60 * 1000);
    //     return currentTimeInIST;
    // }
    return now;
}

function convert_dateformat(inputTimestamp) {
    if (inputTimestamp) {
        const date = new Date(inputTimestamp);
        const formattedDate = date.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
            timeZone: 'UTC'
        });
        return formattedDate;
    } else {
        return '';
    }
}

function slugify_url(url) {
    return url.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/-+/g, '-');
}

function isValidIPv4(ip) {
    const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    return ipv4Pattern.test(ip);
}

function isValidIPv6(ip) {
    const ipv6Pattern = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
    return ipv6Pattern.test(ip);
}

function isValidIP(ip) {
    return isValidIPv4(ip) || isValidIPv6(ip);
}

async function get_apigee_token() {
    var token = ''; var gen = false;
    try { const row1 = await db.sequelize.query(`SELECT apigee_access_token, apigee_token_expiry FROM settings`, { type: QueryTypes.SELECT });
    console.log("get token row : "+row1.length);
    if (row1 && row1.length > 0 && row1[0].apigee_access_token && row1[0].apigee_access_token.length > 0) {
        if (row1[0].apigee_token_expiry) {
            const newDate = new Date(row1[0].apigee_token_expiry.getTime() + -5 * 60000);
            if (newDate > db.get_ist_current_date()) {
                token = row1[0].apigee_access_token;
                gen = false;
            } else {
                gen = true;
            }
        } else {
            gen = true;
        }
    } else {
        gen = true;
    }
    if (gen) {
        const client = new JWT({
            email: keys.client_email, key: keys.private_key,
            scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });
        const authData = await client.authorize();
        const istTimeString = new Date(authData.expiry_date).toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
        const _query2 = `UPDATE settings SET apigee_access_token = ?, apigee_token_expiry = ? `;
        await db.sequelize.query(_query2, { replacements: [authData.access_token, istTimeString], type: QueryTypes.UPDATE });
        token = authData.access_token;
    }
    return token;
        
    } catch (error) {
        console.log("Token Error : "+ error)
    }
   
   

}

function isValidURL(inputURL) {
    const parsedURL = url.parse(inputURL);
    return !!parsedURL.protocol && !!parsedURL.hostname;
}

function convertStringToJson(inputString) {
    try {
        const jsonObject = JSON.parse(inputString);
        return jsonObject;
    } catch (error) {
        return null;
    }
}

function buildQuery_Obj(query, replacements) {
    const finalizedQuery = query.replace(/:(\w+)/g, (match, placeholder) => {
        return replacements[placeholder] !== undefined ? replacements[placeholder] : match;
    });
    return finalizedQuery;
}

function buildQuery_Array(query, replacements) {
    let currentIndex = 0;
    const finalizedQuery = query.replace(/\?/g, () => {
        const replacementValue = replacements[currentIndex++];
        return db.sequelize.escape(replacementValue); // Escaping the value for proper formatting
    });
    return finalizedQuery;
}

function string_to_date(dateString) {
    try {
        const istDate = parse(dateString, 'yyyy-MM-dd HH:mm:ss', new Date());
        //const dateObject = utcToZonedTime(istDate, timeZone);
        return istDate;
    } catch (_) {
        return null;
    }
}

function upto_date(date) {
    try {
        var _dateTemp = date;
        const dateTemp = new Date(_dateTemp.setTime(_dateTemp.getTime() + (1440 * 60 * 1000)));
        return dateTemp;
    } catch (_) {
        return null;
    }
}

function curl_to_code(curl, language) {
    try {
        curl = curl.replace("curl", "").replace(/\\\\\\n/g, '').replace(/ --header '/g, ' -H \"').replace(/\' --data/g, "\" --data").replace(/\n/g, '');
        curl = curl.replace(/' -H "/g, '\" -H \"').replace(/\\n/g, '');
        const commandToRun = `curlconverter ${curl} --language ${language}`;
        var result = require('child_process').execSync(commandToRun).toString();
        return result;
    } catch (_) {
        return null;
    }
}

function delete_uploaded_files (req) {
    if (req.files && req.files.length > 0) {
        for (let i = 0; i < req.files.length; i++) {
            try {
                fs.unlinkSync(req.files[i].path);
            } catch (err) {
                try { } catch (_) { }
            }
        }
    }
}



