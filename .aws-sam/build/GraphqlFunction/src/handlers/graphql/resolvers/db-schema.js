const AWS = require('aws-sdk');

// Create DynamoDB document client
const docClient = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});

const INVENTORY_TABLE = process.env.WAREHOUSE_TABLE //set this from the template
const DB_MAP = {
    PRODUCT: {
        get: ({ productId }) => ({
            pk: 'product#'+productId,
            sk: '#',
        }),
        put: ({ productId, warehouseId, productName, cost, price, inventory }) => ({
            pk: 'product#'+productId,
            sk: '#',
            gsi1pk: 'product#'+productId,
            gsi1sk: productName,
            gsi2pk: 'warehouse#'+warehouseId,
            gsi2sk: '#',
            _tp: 'Product',
            pn: productName,
            co: cost,
            pr: price,
            iv: inventory
        }),
        parse: ({ pk, pn, _tp, co, pr, iv, gsi2sk }) => {
            if (_tp === 'Product') {
                return {
                    id: pk.slice(2),
                    warehouse: {id: gsi2sk.slice(2)},
                    name: pn,
                    cost: co,
                    price: pr,
                    inventory: iv,
                };
            } else return null;
        },
        queryByName: ({ productName }) => ({
            IndexName: 'gsi1pk-gsi1sk-index',
            ExpressionAttributeNames: { '#p': 'gsi1pk', '#s': 'gsi1sk' },
            KeyConditionExpression: '#p = :p AND #s = :s',
            ExpressionAttributeValues: { ':p': 'Product', ':s': productName },
            ScanIndexForward: true,
        }),
        queryByWarehouseId: ({ warehouseId }) => ({
            IndexName: "gsi2pk-gsi2sk-index",
            ExpressionAttributeNames: { "#p": "gsi2pk" },
            KeyConditionExpression: "#p = :p ",
            ExpressionAttributeValues: { ":p": "warehouse#" + warehouseId },
            ScanIndexForward: true,
        }),
        queryAll: {
            IndexName: 'gsi1pk-gsi1sk-index',
            ExpressionAttributeNames: { '#p': 'gsi1pk' },
            KeyConditionExpression: '#p = :p ',
            ExpressionAttributeValues: { ':p': 'Product' },
            ScanIndexForward: true,
        },
    },
    WAREHOUSE: {
        get: ({ warehouseId }) => ({
            pk: 'warehouse#'+warehouseId,
            sk: '#',
        }),
        put: ({ warehouseId, warehouseName, address, city, state, zipcode, phoneNumber }) => ({
            pk: 'warehouse#'+warehouseId,
            sk: '#',
            gsi1pk: 'Warehouse',
            gsi1sk: warehouseName,
            _tp: 'Warehouse',
            wn: warehouseName,
            ad: address,
            ci: city,
            st: state,
            zp: zipcode,
            pn: phoneNumber,
        }),
        parse: ({ pk, wn, _tp, ad, ci, st, zp, pn }) => {
            if (_tp === 'Warehouse') {
                return {
                    id: pk.slice(2),
                    name: wn,
                    address: ad,
                    city: ci,
                    state: st,
                    zipcode: zp,
                    phoneNumber: pn
                };
            } else return null;
        },
        queryByName: ({ warehouseName }) => ({
            IndexName: 'gsi1pk-gsi1sk-index',
            ExpressionAttributeNames: { '#p': 'gsi1pk', '#s': 'gsi1sk' },
            KeyConditionExpression: '#p = :p AND #s = :s',
            ExpressionAttributeValues: { ':p': 'Warehouse', ':s': warehouseName },
            ScanIndexForward: true,
        }),
        queryAll: {
            IndexName: 'gsi1pk-gsi1sk-index',
            ExpressionAttributeNames: { '#p': 'gsi1pk' },
            KeyConditionExpression: '#p = :p ',
            ExpressionAttributeValues: { ':p': 'Warehouse' },
            ScanIndexForward: true,
        },
    },
    parseList: (list, type) => {
        if (Array.isArray(list)) {
            return list.map(i => DB_MAP[type].parse(i));
        }
        if (Array.isArray(list.Items)) {
            return list.Items.map(i => DB_MAP[type].parse(i));
        }
    },
};

module.exports = { DB_MAP };