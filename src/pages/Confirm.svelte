<script lang="ts">
    import axios from "axios";
    import { onMount } from "svelte";

    export let navigateTo: (page: string) => void;
    export let setSettings: (settings: object) => void;
    export let setGradientPhase: (phase: number) => void;
    export let setAlbumColors: (colors: object) => void;

    export let albumId;
    export let settings;

    let animating = false;

    onMount(() => {
        setGradientPhase(1);
    });

    $: albumInfo = axios.get('/album?id=' + albumId).then((res) => {
        setAlbumColors(res.data.colors);
        return res.data;
    }).catch(() => {
        return {};
    });

    const navigateBack = () => {
        navigateTo('search');
        setGradientPhase(0);
    }

    const startAnimation = () => {
        if (animating) return;
        setGradientPhase(2);
        animating = true;
        
        setTimeout(() => {
            navigateTo('listen');
        }, 6000);
    }
</script>

<div class="content">
    <div class="album-confirm">
        {#await albumInfo then albumInfo}
            <h5 class="dissapearing" class:dissapeared={animating}>ARE YOU READY TO LISTEN?</h5>
            <h2 class="wide album-name dissapearing" class:dissapeared={animating}>{albumInfo.name}</h2>
            <h3 class="artist-name dissapearing" class:dissapeared={animating}>{albumInfo.artists.map(artist => artist.name).join(', ')}</h3>
            <button class="album-container" on:click={startAnimation}>
                <img class="album-cover" src={albumInfo.images[0].url} alt="album cover" />
            </button>
            <h5  class="dissapearing" class:dissapeared={animating}>CLICK ON ALBUM TO BEGIN</h5>
            <div class="settings dissapearing" class:dissapeared={animating}>
                <button class="settings-option" class:setting-enabled={settings.announceTracks} on:click={() => setSettings({ announceTracks: !settings.announceTracks})}>
                    <p>ANNOUNCE TRACKS</p>
                </button>
                <button class="settings-option" class:setting-enabled={settings.informationSnippets} on:click={() => setSettings({ informationSnippets: !settings.informationSnippets})}>
                    <p>INFORMATION SNIPPETS</p>
                </button>
                <button class="settings-option" class:setting-enabled={settings.hideFutureTracks} on:click={() => setSettings({ hideFutureTracks: !settings.hideFutureTracks})}>
                    <p>HIDE FUTURE TRACKS</p>
                </button>
            </div>
            <button on:click={navigateBack} class="dissapearing" class:dissapeared={animating}>
                <h2 class="wide back">GO BACK</h2>
            </button>
        {/await}
    </div>
</div>

<style>

    .album-confirm {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100%;
    }

    .album-container {
        width: 100%;
        height: 100%;
        max-width: 320px;
        max-height: 320px;
        padding: 0;
        margin: 0;
        border: 0;
        border-radius: 0;
        background: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        transition: transform 0.1s cubic-bezier(0.390, 0.575, 0.565, 1.000);
    }

    .album-container:hover {
        cursor: pointer;
        transform: scale(1.02);
    }

    .album-cover {
        width: 100%;
        height: 100%;
        animation: scale-up 1.0s cubic-bezier(0.390, 0.575, 0.565, 1.000) both;
    }

    .album-name {
        line-height: 0;
        margin: 0;
    }

    .settings-option {
        background-color: #000;
        color: #fff;
        padding: 0;
    }

    .settings-option > p {
        margin: 0;
        padding: 0.25rem;
        font-weight: 700;
        font-size: 0.75rem;
    }

    .setting-enabled {
        background-color: #fff;
        color: #000;
    }

    .dissapearing {
        opacity: 1;
        transition: opacity 0.5s ease-in-out;
    }

    .dissapeared {
        opacity: 0;
    }

    .back {
        color: #777;
    }

    @keyframes scale-up {
        0% {
            transform: scale(0.5);
        }
        100% {
            transform: scale(1);
        }
    }
</style>