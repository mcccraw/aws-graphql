const AWS = require('aws-sdk');
const parse = require('parse-multipart');
const {createSourceEventStream} = require("graphql/execution");

const BUCKET = process.env.BUCKET;

const s3 = new AWS.S3();

module.exports.handle = async (event) => {
    try {
        const { filename, data } = extractFile(event);
        await s3.putObject({ Bucket: BUCKET, Key: filename, ACL: 'public-read', Body: data }).promise();
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
const extractFile = event => {
    const boundary = parse.getBoundary((event.headers)['content-type']);
    const parts = parse.Parse(Buffer.from(event.body), boundary);
    const [{ filename, data }] = parts

    return {
        filename,
        data
    }
}