<script lang="ts">
    import axios from "axios";
    import { onMount } from "svelte";

    export let albumId;
    export let settings;

    export let navigateTo: (page: string) => void;

    $: data = axios.get('/package/?id=' + albumId).then(res => { console.log(res); return res.data; });
    
    let currentTrack = -1;

    let playingInterval = null;
    let startNext = true;

    onMount(async () => {
        const awaitedData = await data;
        await asyncSay('You are listening to: ' + awaitedData.album.name + '. . . Enjoy!');
        await playNextTrack();
    });

    const asyncSay = async (text: string) => {
        return new Promise((resolve, reject) => {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.onend = resolve;
            utterance.onerror = reject;
            window.speechSynthesis.speak(utterance);
        });
    }

    const playNextTrack = async () => {
        if (!startNext) return;
        startNext = false;

        if (playingInterval) {
            clearInterval(playingInterval);
        }

        const awaitedData = await data;
        let text = '';

        if (settings.announceTracks && currentTrack >= 0) {
            await asyncSay(`That was: ${awaitedData.tracks[currentTrack].name}.`);
        }

        currentTrack++;

        if (currentTrack >= awaitedData.tracks.length) {
            await asyncSay('That was the last track. Thank you for listening!');
            navigateTo('finish');
            return;
        }

        if (settings.announceTracks) {

            if (currentTrack === 0) {
                text = 'First up: ';
            } else if (currentTrack === awaitedData.tracks.length - 1) {
                text = 'Finally: ';
            } else {
                text = 'Next up: ';
            }
            
            text += 'Track ' + (currentTrack + 1) + '. ';
            text += awaitedData.tracks[currentTrack].name + '. . . ';
            
            if (settings.informationSnippets) {
                if (awaitedData.tracks[currentTrack].genius && awaitedData.tracks[currentTrack].genius.text) {
                    text += awaitedData.tracks[currentTrack].genius.text;
                } else {
                    text += 'No annotation provided.';
                }
            }

        }

        await asyncSay(text);
        await playSong(awaitedData.album.id, awaitedData.tracks[currentTrack].id);

        startNext = true;
    }

    const check = async () => {
        const res = await axios.get('/check/?access_token=' + localStorage.getItem('accessToken'));
        if (res.data.move_on) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            await playNextTrack();
        }
    }

    const playSong = async (album_id: string, track_id: string) => {
        await axios.post('/play', {album_id, track_id, access_token: localStorage.getItem('accessToken')});

        if (playingInterval) {
            clearInterval(playingInterval);
        }

        playingInterval = setInterval(check, 1000);
    }
</script>

{#await data then data}
<div class="top-left">
    <h1 class="wide album-name">{data.album.name}</h1>
    <div class="track-list">
        {#each data.tracks as track, i}
            <div class="track" style={`animation-delay: ${i * 0.2}s;`}>
                <p>{i + 1}.</p>
                <p class:blurred={settings.hideFutureTracks && i > currentTrack}>{track.name}</p>
            </div>
        {/each}
    </div>
</div>

<div class="links">
    {#if currentTrack >= 0 && currentTrack < data.tracks.length}
        <a href={data.tracks[currentTrack].external_urls.spotify} target="_blank">VIEW ON SPOTIFY</a>
        {#if data.tracks[currentTrack].genius}
            <a href={data.tracks[currentTrack].genius.url} target="_blank">VIEW ON GENIUS</a>
        {/if}
    {/if}
</div>
<img src={data.album.images[0].url} alt="Album cover" class="album-cover" />

{/await}

<style>
    .top-left {
        position: absolute;
        top: 1rem;
        left: 1rem;
        max-height: 98vh;

        color: #fff;
        mix-blend-mode: difference;
        text-align: left;
        filter: contrast(10000%)
    }

    .album-name {
        font-size: 2rem;
        margin: 0;
        line-height: 1;
    }

    .track-list {
        margin-top: 1rem;
        display: grid;
        max-height: 80vh;
        height: 80vh;
        row-gap: 0.25rem;
        column-gap: 1rem;
        grid-auto-flow: column;
        grid-template-rows: repeat(auto-fill, 1rem);
    }

    .track {
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 0.5rem 0;
        font-size: 1rem;
        font-weight: 700;
        gap: 0.25rem;

        animation: appear 0.5s cubic-bezier(0.390, 0.575, 0.565, 1.000) both;
    }

    .track > p {
        line-height: 0;
        margin: 0;
    }

    .album-cover {
        position: absolute;
        right: 1rem;
        bottom: 1rem;
        width: 50vw;
        max-width: 300px;
        opacity: 0;
        animation: blink-appear 0.5s linear both;
    }

    .links {
        position: absolute;
        bottom: calc(2rem + min(50vw, 300px));
        right: 1rem;
        display: flex;
        flex-direction: row;
        gap: 1rem;
    }

    @keyframes appear {
        from {
            visibility: hidden;
        }
        to {
            visibility: visible;
        }
    }

    @keyframes blink-appear {
        0% {
            opacity: 0;
        }
        0.1% {
            opacity: 1;
        }
        20% {
            opacity: 1;
        }
        20.1% {
            opacity: 0;
        }
        40% {
            opacity: 0;
        }
        40.1% {
            opacity: 1;
        }
        60% {
            opacity: 1;
        }
        60.1% {
            opacity: 0;
        }
        80% {
            opacity: 0;
        }
        80.1% {
            opacity: 1;
        }
        100% {
            opacity: 1;
        }
    }

    a {
        color:#fff;
        mix-blend-mode: difference;
    }
</style>