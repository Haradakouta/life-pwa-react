const secret = 'UHFpR3VYTFhLUVFPV212T1JMbnJWRGVOZldOdHh5c3E=';
const url = 'https://18o058flkh.apigw.ntruss.com/custom/v1/83/7aa3c233bc71b3bb695f28e415b76623b44b8198fef8ac4d18ee5eb86c6f6ad2/general';

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
