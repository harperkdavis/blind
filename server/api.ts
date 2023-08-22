
import { Router } from 'express';
import * as uuid from 'uuid';
import Jimp from 'jimp';

import spotify from './spotify.ts';
import genius from './genius.ts';
import { writeFileSync } from 'fs';
import axios from 'axios';

const REDIRECT_URI = process.env.SERVER_URL + '/api/auth/callback';

const router = Router();

router.get('/', (req, res) => {
  res.status(200).json({
    message: '🍕 Api route 🍕',
  });
});

const states = [];

router.get('/auth', (req, res) => {

  const state = uuid.v4();
  states.push(state);

  const scope = 'user-read-private user-read-playback-state user-modify-playback-state';

  res.redirect('https://accounts.spotify.com/authorize/?' +
    'response_type=code' +
    '&client_id=' + process.env.SPOTIFY_CLIENT_ID +
    '&scope=' + scope +
    '&redirect_uri=' + REDIRECT_URI +
    '&state=' + state
  );
  
});

router.get('/auth/callback', async (req, res) => {

  const code = req.query.code;

  const response = await spotify.post('https://accounts.spotify.com/api/token', {
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
  }, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + (Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64')),
    },
    validateStatus: () => true,
  });

  if (response.status !== 200) {
    return res.status(401).json({
      message: 'Invalid code',
    });
  }

  res.redirect(process.env.CLIENT_URL + '/?auth=true&access_token=' + response.data.access_token + '&refresh_token=' + response.data.refresh_token);

});

router.get('/auth/refresh', async (req, res) => {

  const refresh_token = req.query.refresh_token;

  const response = await spotify.post('https://accounts.spotify.com/api/token', {
    grant_type: 'refresh_token',
    refresh_token,
  }, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + (Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64')),
    },
    validateStatus: () => true,
  });

  if (response.status !== 200) {
    return res.status(401).json({
      message: 'Invalid refresh token',
    });
  }

  res.status(200).json({
    access_token: response.data.access_token,
  });
});

router.get('/search', async (req, res) => {

  const q = req.query.q;

  if (!q) {
    return res.status(400).json({
      message: 'No query provided',
    });
  }

  const response = await spotify.get('/search', {
    params: {
      q,
      type: 'album',
      limit: 5,
    },
    validateStatus: () => true,
  });

  if (response.status !== 200) {
    return res.status(400).json({
      message: 'Invalid query',
    });
  }

  res.status(200).json(response.data);
});

router.get('/album', async (req, res) => {

  const id = req.query.id;

  if (!id) {
    return res.status(400).json({
      message: 'No id provided',
    });
  }

  const response = await spotify.get('/albums/' + id, {
    validateStatus: () => true,
  });

  if (response.status !== 200) {
    return res.status(400).json({
      message: 'Invalid id',
    });
  }

  // get album cover
  const cover = await spotify.get(response.data.images[2].url, {
    responseType: 'arraybuffer',
  });

  // get bitmap data
  const jimp = await Jimp.read(cover.data);
  const bitmap = jimp.bitmap;
  
  // get all colors from bitmap
  const colors = [];
  for (let i = 0; i < bitmap.data.length; i += 4) {
    const rgba = {
      r: bitmap.data[i + 0],
      g: bitmap.data[i + 1],
      b: bitmap.data[i + 2],
    };
    colors.push(rgba);
  }

  const findBiggestColorRange = (colors: {r: number, g: number, b: number}[]) => {
    let minR = 255;
    let maxR = 0;

    let minG = 255;
    let maxG = 0;

    let minB = 255;
    let maxB = 0;

    for (const color of colors) {
      if (color.r < minR) minR = color.r;
      if (color.r > maxR) maxR = color.r;

      if (color.g < minG) minG = color.g;
      if (color.g > maxG) maxG = color.g;

      if (color.b < minB) minB = color.b;
      if (color.b > maxB) maxB = color.b;
    }

    const rangeR = maxR - minR;
    const rangeG = maxG - minG;
    const rangeB = maxB - minB;

    if (rangeR > rangeG && rangeR > rangeB) {
      return 'r';
    } else if (rangeG > rangeR && rangeG > rangeB) {
      return 'g';
    } else if (rangeB > rangeR && rangeB > rangeG) {
      return 'b';
    } else {
      return 'r';
    }
  };

  const quantization = (rgbValues: {r: number, g: number, b: number}[], depth: number) => {
    const MAX_DEPTH = 3;

    if (depth === MAX_DEPTH || rgbValues.length === 0) {
      const color = rgbValues.reduce(
        (prev, curr) => {
          prev.r += curr.r;
          prev.g += curr.g;
          prev.b += curr.b;

          return prev;
        },
        {
          r: 0,
          g: 0,
          b: 0,
        }
      );

      color.r = Math.round(color.r / rgbValues.length);
      color.g = Math.round(color.g / rgbValues.length);
      color.b = Math.round(color.b / rgbValues.length);
      return [color];
    }
  
    const componentToSortBy = findBiggestColorRange(rgbValues);
    rgbValues.sort((p1, p2) => {
      return p1[componentToSortBy] - p2[componentToSortBy];
    });
  
    const mid = rgbValues.length / 2;
    return [
      ...quantization(rgbValues.slice(0, mid), depth + 1),
      ...quantization(rgbValues.slice(mid + 1), depth + 1),
    ];
  }

  const quantizedColors = quantization(colors, 0);

  res.status(200).json({...response.data, colors: quantizedColors});
});

router.get('/package', async (req, res) => {

  const id = req.query.id;

  if (!id) {
    return res.status(400).json({
      message: 'No id provided',
    });
  }

  const response = await spotify.get('/albums/' + id, {
    validateStatus: () => true,
  });

  if (response.status !== 200) {
    return res.status(400).json({
      message: 'Invalid id',
    });
  }

  const album = response.data;

  const tracks = [];

  console.log('Listening to: ' + album.name);
  
  for (let i = 0; i < album.tracks.total / 50; i++) {
    const response = await spotify.get('/albums/' + id + '/tracks', {
      params: {
        limit: 50,
        offset: i * 50,
      },
      validateStatus: () => true,
    });

    if (response.status !== 200) {
      return res.status(400).json({
        message: 'Invalid id',
      });
    }

    tracks.push(...response.data.items);
    
  }

  if (tracks.length > 200) {
    return res.status(400).json({
      message: 'Too many tracks',
    });
  }

  await Promise.all(tracks.map(async (track: any) => {
    return genius.get('/search', {
      params: {
        q: track.artists[0].name + ' ' + track.name.split('-')[0], // for things such as - Remastered
      },
      validateStatus: () => true,
    }).then(async (response) => {
      if (response.status !== 200) {
        return;
      }
      let trackIndex = -1;
      const hit = response.data.response.hits.find((hit: any) => {
        const result = hit.result;
        if (!result) {
          console.log('no result');
          return false;
        }
        if (!track.artists.some((artist: any) => artist.name.toLowerCase().trim().includes(result.primary_artist.name.toLowerCase().trim()) ||
          result.primary_artist.name.toLowerCase().trim().includes(artist.name.toLowerCase().trim())
        )) {
          console.log('no artist');
          return false;
        }
        
        const process = (text: string) => {
          // make alphanumeric and lowercase
          return text.toLowerCase().trim().replaceAll('’', '\'').replaceAll('“', '"').replaceAll('”', '"').replaceAll('‘', '\'').replaceAll(',', '');

        }
        let index = tracks.findIndex((track) => 
          process(track.name) === process(result.title)|| 
          process(track.name).includes(process(result.title)) || 
          process(result.title).includes(process(track.name)) ||
          track.name.includes('(') && (
            process(track.name).split('(')[0].trim() === process(result.title).split('(')[0].trim() ||
            process(track.name).includes(process(result.title).split('(')[0].trim()) ||
            process(result.title).includes(process(track.name).split('(')[0].trim())
          )
        );
        if (index === -1) {
          console.log('no track');
          return false;
        }
        trackIndex = index;
        return true;
      });
      if (hit) {
        await genius.get('/songs/' + hit.result.id, {
          validateStatus: () => true,
        }).then(async (response) => {
          if (response.status !== 200) {
            console.log('no song', track.name);
            return;
          }
          const descriptionAnnotation = response.data.response.song.description_annotation;
          if (!descriptionAnnotation) {
            console.log('no description annotation', track.name);
            return;
          }
          const firstAnnotation = descriptionAnnotation.annotations[0];
          if (!firstAnnotation) {
            console.log('no first annotaion', track.name);
            return;
          }

          const annotation = await genius.get('/annotations/' + firstAnnotation.id, {
            validateStatus: () => true,
          });

          if (annotation.status !== 200) {
            console.log('no annotation', track.name);
            return;
          }

          if (!annotation.data.response.annotation.body.dom.children) {
            console.log('no annotation body', track.name);
            return;
          }

          const firstAnnotationParagraph = annotation.data.response.annotation.body.dom.children[0];
          if (!firstAnnotationParagraph) {
            console.log('no first annotation paragraph', track.name);
            return;
          }

          const reduceNext = (curr: any) => {
            if (typeof curr === 'string') {
              return curr;
            } else {
              if (!curr.children) {
                return '';
              }
              return curr.children.reduce((prev: string, curr: any) => {
                return prev + reduceNext(curr);
              }, '');
            }
          }
          
          const text = firstAnnotationParagraph.children.reduce((prev: string, curr: any) => {
            return prev + reduceNext(curr);
          }, '');

          if (!text) {
            console.log('no text', track.name);
            return;
          }

          if (!(text.includes('.') || text.includes('?') || text.includes('!'))) {
            console.log('no punctuation', track.name);
            return;
          }
          
          tracks[trackIndex].genius = {
            text,
            url: annotation.data.response.annotation.url,
          };
        });
      } else {
        console.log('not found', track.name);
      }
    });
  }));

  writeFileSync('./songs.json', JSON.stringify(tracks, null, 2), 'utf8');

  res.status(200).json({
    album,
    tracks,
  })

});

const activeTracks = new Map<string, { trackId: string }>();

router.post('/play', async (req, res) => {
  const { album_id, track_id, access_token } = req.body;

  if (!album_id) {
    return res.status(400).json({
      message: 'Missing album id',
    });
  }

  if (!track_id) {
    return res.status(400).json({
      message: 'Missing index',
    });
  }

  if (!access_token) {
    return res.status(400).json({
      message: 'Missing access token',
    });
  }

  const devices: { id: string, is_active: boolean, is_restricted: boolean }[] = await axios.get('https://api.spotify.com/v1/me/player/devices', {
    headers: {
      Authorization: 'Bearer ' + access_token,
    },
    validateStatus: () => true,
  }).then(res => res.data.devices);

  let deviceId;

  if (devices.length === 0 || devices.every((device: any) => device.is_restricted)) {
    return res.status(400).json({
      message: 'No devices available',
    });
  }

  let device = devices.find((device) => device.is_active);
  if (!device) {
    device = devices.find((device) => !device.is_restricted);
  }

  deviceId = device.id;

  const response = await axios.put('https://api.spotify.com/v1/me/player/play?device_id=' + deviceId, {
    context_uri: 'spotify:album:' + album_id,
    offset: {
      uri: 'spotify:track:' + track_id,
    },
    position_ms: 0,
  }, {
    headers: {
      Authorization: 'Bearer ' + access_token,
    },
    validateStatus: () => true,
  });

  activeTracks.set(access_token as string, {
    trackId: track_id,
  });
  
  res.status(200).json({
    success: true,
  });
}); 

router.get('/check', async (req, res) => {

  const { access_token } = req.query;

  if (!access_token) {
    return res.status(400).json({
      message: 'Missing access token',
    });
  }

  const track = activeTracks.get(access_token as string);

  if (!track) {
    return res.status(400).json({
      message: 'No track playing',
    });
  }

  const state = await axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
    headers: {
      Authorization: 'Bearer ' + access_token,
    },
  }).then(res => res.data);

  
  if (!state.item || !state.item.id || !track || !track.trackId || state.item.id != track.trackId) {

    await axios.put('https://api.spotify.com/v1/me/player/pause', {}, {
      headers: {
        Authorization: 'Bearer ' + access_token,
      },
      validateStatus: () => true,
    });

    return res.status(200).json({
      move_on: true,
    });
  }

  res.status(200).json({
    move_on: false,
  });
});

export default router;