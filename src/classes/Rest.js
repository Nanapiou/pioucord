import { StatusCode } from 'status-code-enum';
import fetch from 'node-fetch';

/**
 * @typedef RestOptions
 * @property {"Bot" | "Bearer"} [authPrefix=null]
 * @property {string} version
 * @property {string} [baseUrl="https://discord.com/api"]
 * @property {string} [token=null]
 */

/**
 * @typedef EndpointData
 * @property {string} bucket The bucket id
 * @property {number} remaining The requests count remaining on the endpoint
 * @property {(string | object)[][]} queue The requests' data queue
 */

/**
 * @typedef BucketData
 * @property {number} limit How many request max
 * @property {number} retryAfter How much time between each limitation
 */

export default class Rest {
    /**
     * @param {RestOptions} restOptions
     */
    constructor({ authPrefix, version, baseUrl, token }) {
        this.authPrefix = authPrefix ?? null;
        this.version = version;
        this.baseUrl = baseUrl ?? "https://discord.com/api";
        this.token = token ?? null;

        /**
         * @type {Map<string, EndpointData>}
         */
        this.endpointsQueue = new Map();
        /**
         * @type {Map<string, BucketData>}
         */
        this.bucketsData = new Map();
    };

    /**
     * The token, including the prefix
     * @returns {string}
     */
    get resolvedToken() {
        return (this.authPrefix ? this.authPrefix + ' ' : '') + this.token;
    };

    /**
     * The rest default's headers
     * @returns {{authorization: string, "content-type": string}}
     */
    get defaultHeaders() {
        return {
            authorization: this.resolvedToken,
            'content-type': 'application/json'
        }
    };

    /**
     * Set the rest token to a new one
     * @param {string} token
     */
    setToken(token) {
        if (!(/[\w-]{24}\.[\w-]{6}\.[\w-]{27}/.test(token) || /mfa\.[\w-]{84}/.test(token))) throw new Error('Not a token');
        this.token = token;
        return this;
    };

    /**
     * Make a request, using the rest instance
     * @param {string} url
     * @param {string} [body]
     * @param {object} [headers=this.defaultHeaders]
     * @param {"GET" | "POST" | "PATCH" | "PUT" | "DELETE" | "HEAD"} [method="GET"]
     * @returns {Promise<any>}
     */
    async request(url, body, headers=this.defaultHeaders, method='GET') {
        if (this.token === null) throw new Error('No token');
        const endpoint = this.extractEndpoint(url);
        const res = await fetch(url, { method, body, headers });

        const endpointData = this._updateEndpointData(endpoint, res);

        switch (res.status) {
            case StatusCode.SuccessOK:
            case StatusCode.RedirectNotModified:
            case StatusCode.SuccessCreated:
                return res.json()
            case StatusCode.SuccessNoContent:
                return {}
            case StatusCode.ClientErrorBadRequest:
            case StatusCode.ClientErrorUnauthorized:
            case StatusCode.ClientErrorForbidden:
            case StatusCode.ClientErrorNotFound:
            case StatusCode.ClientErrorMethodNotAllowed:
                const { message, code, errors } = await res.json();
                throw new Error(`${StatusCode[res.status]}\nMessage: ${message}\nCode: ${code}\nErrors: ${JSON.stringify(errors, null, 2)}`);
            case StatusCode.ClientErrorTooManyRequests:
            case StatusCode.ServerErrorBadGateway:
                const args = [url, body, headers, method];

                if (!this.bucketsData.has(endpointData.bucket)) {
                    const retryAfter = res.headers.get('retry-after');
                    const limit = res.headers.get('x-rateLimit-limit');
                    this.bucketsData.set(endpointData.bucket, {
                        retryAfter,
                        limit
                    });
                }

                const endpoint = this.extractEndpoint(url);
                return this.addToQueue(endpoint, args);
            default:
                throw new Error('Unknown HTTP code: ' + res.status)
        }
    };

    /**
     * Extract an endpoint from an url
     * @param {string} url
     * @returns {string | null}
     * @example
     * extractEndpoint("https://discord.com/api/v10/channels/1036710154319708241/messages/");
     * // -> "/channels/1036710154319708241/messages"
     */
    extractEndpoint(url) {
        return url.match(/\/v[0-9]{1,2}([a-zA-Z0-9\/]*)\/?(\?.+)?$/)?.[1];
    };

    /**
     * Update an endpoint data
     * *Used for ratelimit managing*
     * @private
     * @param {string} endpoint
     * @param {Response} res
     * @returns {EndpointData}
     */
    _updateEndpointData(endpoint, res) {
        const remaining = res.headers.get('x-rateLimit-remaining');
        const bucket = res.headers.get('x-ratelimit-bucket');
        let endpointData = this.endpointsQueue.get(endpoint)
        if (!endpointData) {
            endpointData = {
                remaining,
                bucket,
                queue: []
            };
            this.endpointsQueue.set(endpoint, endpointData);
        } else {
            Object.assign(endpointData,  {
                remaining,
                bucket
            });
        }
        return endpointData;
    };

    /**
     * Add a request to the endpoint's queue
     * @param {string} endpoint
     * @param {(string | object)[]} args
     * @returns {Promise<any>}
     */
    addToQueue(endpoint, args) {
        const endpointData = this.endpointsQueue.get(endpoint);
        endpointData.queue.push(args);

        const bucketData = this.bucketsData.get(endpointData.bucket);

        return new Promise(resolve => {
            setTimeout(() => {
                resolve(this.request(...endpointData.queue.shift()));
            }, bucketData.retryAfter * 1000 + Math.floor((endpointData.queue.length - 1) / bucketData.limit) * bucketData.retryAfter * 1000);
        });
    };

    /**
     * Make a get request
     * @param {string} endpoint
     * @returns {Promise<*>}
     */
    get(endpoint) {
        return this.request(this.buildFullUrl(endpoint));
    };

    /**
     * Make a delete request
     * @param {string} endpoint
     * @returns {Promise<*>}
     */
    delete(endpoint) {
        return this.request(this.buildFullUrl(endpoint), undefined, this.defaultHeaders, 'DELETE');
    };

    /**
     * Make a post request
     * @param {string} endpoint
     * @param {object} data
     * @returns {Promise<*> | void}
     */
    post(endpoint, data) {
        if (data.files !== undefined) return console.log("|!| Files aren't supported") ;
        else return this.request(this.buildFullUrl(endpoint), JSON.stringify(data), this.defaultHeaders, 'POST');
    };

    /**
     * Make a patch request
     * @param {string} endpoint
     * @param {object} data
     * @returns {Promise<*> | void}
     */
    patch(endpoint, data) {
        if (data.files !== undefined) return console.log("|!| Files aren't supported") ;
        else return this.request(this.buildFullUrl(endpoint), JSON.stringify(data), this.defaultHeaders, 'PATCH');
    };

    /**
     * Make a put request
     * @param {string} endpoint
     * @param {object} data
     * @returns {Promise<*> | void}
     */
    put(endpoint, data) {
        if (data.files !== undefined) return console.log("|!| Files aren't supported") ;
        else return this.request(this.buildFullUrl(endpoint), JSON.stringify(data), this.defaultHeaders, 'PUT');
    };

    /**
     * Build a full url from the provided endpoint
     * @param {string} endpoint
     * @returns {string}
     */
    buildFullUrl(endpoint) {
        return `${this.baseUrl}/v${this.version}${endpoint}`;
    };
};