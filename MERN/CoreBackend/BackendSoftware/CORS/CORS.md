# Cross-Origin Resource Sharing (CORS)

## What is CORS?

Cross-Origin Resource Sharing (CORS) is a security mechanism implemented by web browsers that allows or restricts web pages running at one domain to access resources from another domain. It's a relaxation of the Same-Origin Policy (SOP) that enables controlled cross-origin requests.

## Same-Origin Policy

Before understanding CORS, it's important to understand the Same-Origin Policy:

- **Same Origin**: Same protocol, domain, and port
- **Example**: `https://example.com:443/page1` and `https://example.com:443/page2` are same-origin
- **Different Origins**: Different protocol, domain, or port

## How CORS Works

CORS uses HTTP headers to tell browsers to give a web application running at one origin access to selected resources from a different origin.

### Simple Requests

A request is considered "simple" if it meets all these conditions:

- **Methods**: GET, HEAD, or POST
- **Headers**: Only CORS-safelisted headers
- **Content-Type**: `application/x-www-form-urlencoded`, `multipart/form-data`, or `text/plain`

### Preflight Requests

For non-simple requests, browsers send a preflight request using the OPTIONS method:

```http
OPTIONS /api/data HTTP/1.1
Host: api.example.com
Origin: https://webapp.com
Access-Control-Request-Method: PUT
Access-Control-Request-Headers: Content-Type
```

## CORS Headers

### Request Headers

- **Origin**: Indicates the origin of the cross-origin request
- **Access-Control-Request-Method**: Used in preflight to indicate the HTTP method
- **Access-Control-Request-Headers**: Used in preflight to indicate custom headers

### Response Headers

- **Access-Control-Allow-Origin**: Specifies allowed origins (`*` or specific origin)
- **Access-Control-Allow-Methods**: Lists allowed HTTP methods
- **Access-Control-Allow-Headers**: Lists allowed request headers
- **Access-Control-Allow-Credentials**: Indicates if credentials are allowed
- **Access-Control-Expose-Headers**: Lists headers exposed to the client
- **Access-Control-Max-Age**: Specifies preflight cache duration

## Implementation Examples

### Basic Server Setup (Node.js/Express)

```javascript
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});
```

### Using CORS Middleware

```javascript
const cors = require('cors');

const corsOptions = {
    origin: ['https://frontend.com', 'https://app.com'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

app.use(cors(corsOptions));
```

## Common CORS Configurations

### Allow All Origins (Development Only)

```javascript
res.header('Access-Control-Allow-Origin', '*');
```

### Specific Origins

```javascript
const allowedOrigins = ['https://frontend.com', 'https://app.com'];
const origin = req.headers.origin;
if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
}
```

### With Credentials

```javascript
res.header('Access-Control-Allow-Origin', 'https://frontend.com');
res.header('Access-Control-Allow-Credentials', 'true');
```

## CORS Error Types

### Common Error Messages

1. **No 'Access-Control-Allow-Origin' header**
2. **CORS policy blocks request**
3. **Preflight request failed**
4. **Credentials flag mismatch**

### Debugging CORS Issues

- Check browser developer tools Network tab
- Verify Origin header in requests
- Confirm server response headers
- Test with simple requests first

## Security Considerations

### Best Practices

- **Never use `*` with credentials enabled**
- **Whitelist specific origins in production**
- **Validate and sanitize all inputs**
- **Use HTTPS for sensitive operations**

### Potential Vulnerabilities

- **Overly permissive CORS policies**
- **Misconfigured wildcard origins**
- **Exposed sensitive headers**

## Advanced CORS Scenarios

### Dynamic Origin Validation

```javascript
const corsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
};
```

### Conditional CORS

```javascript
app.use('/api/public', cors({ origin: '*' }));
app.use('/api/private', cors({ origin: 'https://trusted.com' }));
```

## Testing CORS

### Using cURL

```bash
curl -H "Origin: https://frontend.com" \
         -H "Access-Control-Request-Method: POST" \
         -X OPTIONS \
         https://api.example.com/data
```

### Browser Testing

```javascript
fetch('https://api.example.com/data', {
    method: 'POST',
    credentials: 'include',
    headers: {
        'Content-Type': 'application/json'
    }
});
```

## Browser Support

CORS is supported by all modern browsers:
- Chrome 4+
- Firefox 3.5+
- Safari 4+
- IE 10+
- Edge (all versions)

## Alternatives and Workarounds

- **JSONP** (for GET requests only)
- **Server-side proxy**
- **Postmessage API** (for iframe communication)
- **WebSockets** (different security model)

## Conclusion

CORS is essential for modern web applications that need to make cross-origin requests. Proper implementation balances functionality with security, ensuring applications can access necessary resources while protecting against malicious attacks.