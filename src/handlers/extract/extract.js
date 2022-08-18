const AWS = require('aws-sdk');
const csvtojson = require('csvtojson');

const s3 = new AWS.S3();
const docClient = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});

const BUCKET = process.env.BUCKET;
const TableName = process.env.INVENTORY_TABLE;
module.exports.handle = async (event) => {

    const file = event[0].s3.object.key;
    const s3stream = s3.getObject({ Bucket: BUCKET, Key: file }).createReadStream();

    csv().fromStream(s3stream).on('data', (row) => {
        let jsonContent = JSON.parse(row);
        if (file.includes('product')) {
            addProduct(jsonContent);

        } else if (file.includes('ware')) {
            addWarehouse(jsonContent);

        } else {
            addInventory(jsonContent);

        }

    });
}

const getProduct = async (daidta) => {
    const params = {
        TableName: TableName,
        Key: {"productId": id}
    }
    try {
        const result =  docClient.get(params).promise();
        return result.Item;
    } catch (err) {
        console.error(err);
        return err
    }
}

const addProduct = async (data) => {
    const params = {
        TableName: TableName,
        Item: {
            productId: data.id,
            name: data.name,
            cost: data.cost,
            price: data.price,
        }
    };


    try {
        await docClient.put(params).promise();

    } catch (err) {
        console.error(err)

    }

}

const addWarehouse = async (data) => {
    let params = {
        TableName: TableName,
        Item: {
            warehouseId: data.id,
            name: data.name,
            address: data.address,
            city: data.city,
            state: data.state,
            zipcode: data.zipcode,
            phoneNumber: data.phoneNumber,
        }
        };

    try {
        await docClient.put(params).promise();

    } catch (err) {
        console.error(err)

    }

}

const addInventory = async (data) => {
    const product = await getProduct();
    const params = {
        TableName: TableName,
        Item: {
            productId: product.id,
            name: product.name,
            cost: product.cost,
            price: product.price,
            inventory: data.inventory,
            warehouseId: data.warehouseId
        }
    };
    try {
        await docClient.put(params).promise();

    } catch (err) {
        console.error(err)

    }

}