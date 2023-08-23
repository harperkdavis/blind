import axios, { type AxiosInstance } from 'axios';

const getGeniusToken = async () => {
    const res = await axios.post('https://api.genius.com/oauth/token', {
        grant_type: 'client_credentials',
    }, {
        headers: {
            'Authorization': 'Basic ' + (Buffer.from(process.env.GENIUS_CLIENT_ID + ':' + process.env.GENIUS_CLIENT_SECRET).toString('base64')),
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });
    if (res.status === 200) {
        return res.data.access_token;
    }
};

let geniusToken: string, genius: AxiosInstance;
const refreshGeniusToken = async () => {
    console.log('Refreshing Genius token...');

    geniusToken = await getGeniusToken();
    genius = axios.create({
        baseURL: 'https://api.genius.com',
        headers: {
            'Authorization': 'Bearer ' + geniusToken,
        }
    });

    console.log('Genius token refreshed!');
    setTimeout(refreshGeniusToken, 1000 * 60 * 10);
};

await refreshGeniusToken();

export default genius;