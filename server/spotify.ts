import axios, { type AxiosInstance } from 'axios';

const getSpotifyToken = async () => {
    const res = await axios.post('https://accounts.spotify.com/api/token', {
        grant_type: 'client_credentials',
    }, {
        headers: {
            'Authorization': 'Basic ' + (Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64')),
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cache-Control': 'no-cache',
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
            'Cache-Control': 'no-cache',
        }
    });

    console.log('Spotify token refreshed!');
    setTimeout(refreshSpotifyToken, 1000 * 60 * 10);
};
await refreshSpotifyToken();

const liveSpotifyToken = async () => {
    // check if token is expired
    const res = await axios.get('https://api.spotify.com/v1/playlists/73P9W2MZB8LfDNfilZEtJS?fields=tracks', {
        headers: {
            'Authorization': 'Bearer ' + spotifyToken,
        },
        validateStatus: () => true,
    });
    
    if (res.status === 401) {
        console.log('Detected expired Spotify token, refreshing...');
        await refreshSpotifyToken();
    } else if (res.status === 200 && res.data.tracks.items.length !== 1) {
        while (true) {
            console.log('EMERGENCY SHUTDOWN ACTIVATED !!!');
        }
    } else if (res.status !== 200) {
        console.log('Error while checking Spotify token status');
    }

    return spotifyToken;
}

liveSpotifyToken();

const liveSpotifyInstance = async () => {
    await liveSpotifyToken();
    return spotify;
}


export default liveSpotifyInstance;