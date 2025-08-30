import https from 'node:https';
import { URL } from 'node:url';

class HTTPSClient {
    constructor(options = {}) {
        this.timeout = options.timeout || 30000;
        this.retries = options.retries || 3;
    }

    async makeRequest(url, options = {}) {
        const parsedUrl = new URL(url);
        
        const requestOptions = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || 443,
            path: parsedUrl.pathname + parsedUrl.search,
            method: options.method || 'GET',
            headers: {
                'User-Agent': 'HTTPSClient/1.0',
                ...options.headers
            },
            timeout: this.timeout
        };

        return new Promise((resolve, reject) => {
            const req = https.request(requestOptions, (res) => {
                let data = '';
                
                res.setEncoding('utf8');
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        data: data
                    });
                });
            });

            req.on('error', (error) => {
                reject(new Error(`Request failed: ${error.message}`));
            });

            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });

            if (options.body) {
                req.write(options.body);
            }

            req.end();
        });
    }

    async get(url, options = {}) {
        try {
            return await this.makeRequest(url, { ...options, method: 'GET' });
        } catch (error) {
            throw error;
        }
    }
}

// Usage example
const client = new HTTPSClient({ timeout: 10000 });

client.get('https://example.com')
    .then(response => {
        console.log('Status:', response.statusCode);
        console.log('Headers:', response.headers);
        console.log('Data:', response.data);
    })
    .catch(error => {
        console.error('Error:', error.message);
    });
