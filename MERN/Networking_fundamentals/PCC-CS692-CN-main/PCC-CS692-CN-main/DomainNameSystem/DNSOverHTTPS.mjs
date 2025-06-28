import https from 'https';
import { URL } from 'url';

class DNSOverHTTPS {
    constructor(dohServer = 'https://cloudflare-dns.com/dns-query') {
        this.dohServer = dohServer;
    }

    async query(domain, recordType = 'A') {
        const url = new URL(this.dohServer);
        url.searchParams.set('name', domain);
        url.searchParams.set('type', recordType);

        const options = {
            method: 'GET',
            headers: {
                'Accept': 'application/dns-json'
            }
        };

        return new Promise((resolve, reject) => {
            const req = https.request(url, options, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    try {
                        const response = JSON.parse(data);
                        resolve(this.parseResponse(response));
                    } catch (error) {
                        reject(new Error('Failed to parse DNS response'));
                    }
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.end();
        });
    }

    parseResponse(response) {
        const result = {
            status: response.Status,
            question: response.Question,
            answers: []
        };

        if (response.Answer) {
            result.answers = response.Answer.map(answer => ({
                name: answer.name,
                type: answer.type,
                ttl: answer.TTL,
                data: answer.data
            }));
        }

        return result;
    }

    async resolve(domain) {
        try {
            const result = await this.query(domain, 'A');
            return result.answers.map(answer => answer.data);
        } catch (error) {
            throw new Error(`DNS resolution failed: ${error.message}`);
        }
    }
}

// Usage example
const dns = new DNSOverHTTPS();

// Example usage
dns.query('example.com', 'A')
    .then(result => {
        console.log('DNS Query Result:', JSON.stringify(result, null, 2));
    })
    .catch(error => {
        console.error('DNS Query Error:', error.message);
    });

// Resolve to get IP addresses directly
dns.resolve('google.com')
    .then(ips => {
        console.log('IP Addresses:', ips);
    })
    .catch(error => {
        console.error('Resolution Error:', error.message);
    });

export default DNSOverHTTPS;