const AWS = require('aws-sdk');
const Parse = require('lambda-multipart-parser');
const BUCKET = process.env.BUCKET;

const s3 = new AWS.S3();

module.exports.handler = async (event) => {
    try {
        const upload = await Parse.parse(event)
        await s3.putObject({ Bucket: BUCKET, Key: upload.files[0].filename, ACL: 'public-read', Body: upload.files[0].content }).promise();
        return {
            statusCode: 200,
            body: JSON.stringify(({ message: `File ${filename} uploaded.`}))
        }
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({message: err.stack}),
        }
    }

}