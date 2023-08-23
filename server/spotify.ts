import axios, { type AxiosInstance } from 'axios';

const getSpotifyToken = async () => {
    const res = await axios.post('https://accounts.spotify.com/api/token', {
        grant_type: 'client_credentials',
    }, {
        headers: {
            'Authorization': 'Basic ' + (Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64')),
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });
    if (res.status === 200) {
        return res.data.access_token;
    }
};

let spotifyToken: string, spotify: AxiosInstance;

const refreshSpotifyToken = async () => {
    console.log('Refreshing Spotify token...');

    spotifyToken = await getSpotifyToken();
    spotify = axios.create({
        baseURL: 'https://api.spotify.com/v1',
        headers: {
            'Authorization': 'Bearer ' + spotifyToken,
        }
    });

    console.log('Spotify token refreshed!');
    setTimeout(refreshSpotifyToken, 1000 * 60 * 10);
};
await refreshSpotifyToken();

export default spotify;