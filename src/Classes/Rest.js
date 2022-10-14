const FormData = require('form-data');
const { request } = require('../Util/functions');
const { HTTP_RESPONSE_CODES } = require('../Util/Constants');

/**
 * @typedef RestOptions
 * @prop {String} [dns="discord.dom"] The DNS domain of the api (no need to be changed)
 * @prop {Number} [version=10] The api version, see [Discord api versions]{@link https://discord.com/developers/docs/reference#api-versioning-api-versions}
 * @prop {'Dns' | 'Bearer'} [authPrefix] The auth prefix used to make request
 * @prop {Object} [headers] Base headers (no need to be changed)
 */

/**
 * @typedef FileObject
 * @prop {String} name The name of the file
 * @prop {String} data The content of the file.
 */


/**
 * Used to interact with discord endpoints
 */
class Rest {
    /**
     * @constructor
     * @param {RestOptions} options 
     */
    constructor({
        dns,
        version,
        authPrefix,
        headers
    } = {
        dns: 'discord.com',
        version: 10
    }) {
        this.dns = dns;
        this.version = version;
        this.authPrefix = authPrefix;
        this.headers = Object.assign(headers || {}, { 'Content-Type': 'application/json' });

        this.rateLimits = new Map();
    };
    
    /**
     * @return {String} The base URL used to perform requests
     */
    get baseURL() {
        return `https://${this.dns}${this.basePath}`;
    };

    /**
     * @return {String} The base path used to perform requests
     */
    get basePath() {
        return `/api/v${this.version}`;
    }

    /**
     * Set the token used to perform requests
     * @param {String} token 
     * @returns {Rest}
     */
    setToken(token) {
        this.token = token;
        this.headers.Authorization = this.auth;
        return this;
    };

    /**
     * @return {String} Get the full auth
     */
    get auth() {
        return (this.authPrefix ? this.authPrefix + ' ' : '') + this.token;
    };

    /**
     * Make a request.
     * @param {String} url 
     * @param {FetchOptions} options
     * @param {Array<FileObject>} [files] 
     * @returns {Promise} The response body
     */
    async request(url, options, files) {
        const headers = Object.assign({}, options.headers);
        if (files) {
            delete headers['Content-Type'];
            options.headers = headers;
            const form = new FormData();
            form.append('payload_json', JSON.stringify(options.data), { contentType: this.headers['Content-Type'] });
            for (const index in files) {
                const file = files[index];
                if (!(file.name && file.data)) {
                    throw new Error("Files need 'name' and 'data' fields");
                }
                const extension = file.name.match(/(?<!\.)\.[a-z]+/)?.[0].slice(1);
                if (!['jpg', 'jpeg', 'png', 'webp', 'gif', 'json'].includes(extension)) {
                    throw new Error('Invalid file extension (' + extension + ')');
                }
                form.append(`files[${index}]`, file.data, { contentType: 'image/' + extension, filename: file.name });
            }
            options.body = form;
        } else {
            options.body = JSON.stringify(options.data);
        }
        const res = await request(url, options);
        switch (res.status) {
            case HTTP_RESPONSE_CODES.NO_CONTENT:
                return {};
            case HTTP_RESPONSE_CODES.NOT_MODIFIED:
                return res.json();
            case HTTP_RESPONSE_CODES.OK:
                return res.json();
            case HTTP_RESPONSE_CODES.CREATED:
                return res.json();
            case HTTP_RESPONSE_CODES.BAD_REQUEST:
                console.log(await res.json())
                throw new Error('Bad request (' + url + ')');
            case HTTP_RESPONSE_CODES.UNAUTHORIZED:
                throw new Error('Unauthorized (Headers.Authorization: ' + options.headers.Authorization);
            case HTTP_RESPONSE_CODES.FORBIDDEN:
                throw new Error('Can\'t access ' + url + ' with this token');
            case HTTP_RESPONSE_CODES.NOT_FOUND:
                throw new Error('Not found (' + url + ')');
            case HTTP_RESPONSE_CODES.METHOD_NOT_ALLOWED:
                throw new Error(`Method ${options.method} not allowed on ${url}`);
            case HTTP_RESPONSE_CODES.TOO_MANY_REQUESTS:
                const id = res.headers.get('x-ratelimit-bucket');
                const remaining = Number(res.headers.get('x-ratelimit-reset-after'));
                const baseTime = (Math.ceil(remaining) + 0.5) * 1000;
                const endpoint = url.match(/\/[a-z]+\/\d{17,19}(\/[a-z0-9]+)?(?!.+\d{17,19})/)[0];
                const args = [url, options, files];

                if (!this.rateLimits.has(id)) {
                    this.rateLimits.set(id, {
                        endpoints: new Map([[endpoint, []]]),
                        requests: [],
                        baseTime: baseTime,
                    });
                }
                const bucket = this.rateLimits.get(id);
                if (!bucket.endpoints.has(endpoint)) {
                    bucket.endpoints.set(endpoint,  []);
                }
                const entry = bucket.endpoints.get(endpoint);

                const limit = Number(res.headers.get('x-ratelimit-limit'));

                if (baseTime > bucket.baseTime) bucket.baseTime = baseTime;
                entry.push(args);
                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve(this.request(...entry.shift()));
                        if (entry.length === 0) bucket.endpoints.delete(endpoint);
                    }, bucket.baseTime * Math.floor((entry.length - 1) / limit) + remaining  * 1000);
                });
            default:
                throw new Error('Unknown http status: ' + res.status);
        }
    };

    /**
     * Make a GET request
     * @param {String} path 
     * @returns {Promise} The response body
     */
    get(path) {
        return this.request(this.baseURL + path, { method: 'GET', headers: this.headers });
    };

    /**
     * Make a POST request
     * @param {String} path 
     * @param {Object} data
     * @param {Array<FileObject>} [files]
     * @returns {Promise} The response body
     */
    post(path, data, files) {
        return this.request(this.baseURL + path, { method: 'POST', headers: this.headers, data }, files);
    };

    /**
     * Make a PATCH request
     * @param {String} path 
     * @param {Object} data
     * @param {Array<FileObject>} [files]
     * @returns {Promise} The response body
     */
    patch(path, data, files) {
        return this.request(this.baseURL + path, { method: 'PATCH', headers: this.headers, data }, files);
    };

    /**
     * Make a DELETE request
     * @param {String} path 
     * @returns {Promise} The response body
     */
    delete(path) {
        return this.request(this.baseURL + path, { method: 'DELETE', headers: this.headers });
    };

    /**
     * Make a PUT request
     * @param {String} path 
     * @param {Object} data
     * @param {Array<FileObject>} [files]
     * @returns {Promise} The response body
     */
    put(path, data, files) {
        return this.request(this.baseURL + path, { method: 'PUT', headers: this.headers, data }, files);
    };
}

module.exports = Rest;