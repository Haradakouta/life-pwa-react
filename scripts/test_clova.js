const secret = process.env.CLOVA_SECRET_KEY;
const url = process.env.CLOVA_API_URL;

if (!secret || !url) {
    console.error('Missing env vars: CLOVA_API_URL / CLOVA_SECRET_KEY');
    console.error('Example: CLOVA_API_URL=... CLOVA_SECRET_KEY=... node scripts/test_clova.js');
    process.exit(1);
}

async function test() {
    const body = {
        version: 'V2',
        requestId: 'test-' + Date.now(),
        timestamp: Date.now(),
        lang: 'ja',
        images: [
            {
                format: 'jpg',
                name: 'test_image',
                url: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/ReceiptSwiss.jpg'
            }
        ]
    };

    console.log('Sending request to CLOVA OCR...');
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-OCR-SECRET': secret
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('Error:', e);
    }
}

test();
