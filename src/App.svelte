<script lang="ts">
    import axios from 'axios';

    import { fade } from 'svelte/transition';

    import Gradient from './lib/Gradient.svelte';
    import Info from './lib/Info.svelte';

    import Start from './pages/Start.svelte';
    import Tutorial from './pages/Tutorial.svelte';
    import Auth from './pages/Auth.svelte';
    import Search from './pages/Search.svelte';
    import Confirm from './pages/Confirm.svelte';
    import Listen from './pages/Listen.svelte';
    import Finish from './pages/Finish.svelte';

    const defaultSettings = {
        announceTracks: true,
        informationSnippets: true,
        hideFutureTracks: true,
    };
    let settings = { ...defaultSettings, ...JSON.parse(localStorage.getItem('settings')) } || defaultSettings;
    localStorage.setItem('settings', JSON.stringify(settings));

    const urlParams = new URLSearchParams(window.location.search);
    const auth = urlParams.get('auth');

    let albumId = null;
    let gradientPhase = 0;

    let albumColors: { r: number, g: number, b: number, a: number }[] = [];

    let page = 'start';
    let beginNavigatesTo = 'auth';

    if (localStorage.getItem('fastForward')) {
        localStorage.removeItem('fastForward');
        page = 'search';
    }

    if (auth) {
        localStorage.setItem('earblind', 'true');
        localStorage.setItem('accessToken', urlParams.get('access_token'));
        localStorage.setItem('refreshToken', urlParams.get('refresh_token'));
        localStorage.setItem('fastForward', 'true');
        page = 'search';
        window.history.replaceState({}, document.title, "/");
        window.location.reload();
    }

    let accessToken = localStorage.getItem('accessToken');
    let refreshToken = localStorage.getItem('refreshToken');

    const load = new Promise<void>(async (resolve, reject) => {
        if (!accessToken) {
            beginNavigatesTo = 'auth';
            page = 'start';
            resolve();
            return;
        }
        await axios.get('/auth/refresh?refresh_token=' + refreshToken).then((res) => {
            accessToken = res.data.access_token;
            localStorage.setItem('accessToken', accessToken);
            beginNavigatesTo = 'search';
        }).catch(() => {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            beginNavigatesTo = 'auth';
            page = 'start';
        });
        resolve();
    });

    const navigateTo = (newPage: string) => {
        page = newPage;
        if (newPage === 'start' || newPage == 'search') {
            setGradientPhase(0);
        }
    }

    const setAlbumId = (id: string) => {
        albumId = id;
    }

    const setGradientPhase = (phase: number) => {
        gradientPhase = phase;
    }

    const setSettings = (newSettings: any) => {
        settings = { ...defaultSettings, ...settings, ...newSettings };
        localStorage.setItem('settings', JSON.stringify(settings));
    }

    const setAlbumColors = (colors: any) => {
        albumColors = colors;
    }

</script>

<main>

    <Gradient phase={gradientPhase} {albumColors}/>

    {#await load then}
    {#if page === 'start'}
        <div transition:fade={{ duration: 500 }}>
        <Start {navigateTo} {beginNavigatesTo} />
        </div>
    {:else if page === 'tutorial'}
        <div in:fade={{ delay: 500, duration: 500 }} out:fade={{ duration: 500 }}>
        <Tutorial {navigateTo} />
        </div>
    {:else if page === 'auth'}
        <div in:fade={{ delay: 500, duration: 500 }} out:fade={{ duration: 500 }}>
        <Auth />
        </div>
    {:else if page === 'search'}
        <div in:fade={{ delay: 500, duration: 500 }} out:fade={{ duration: 500 }}>
        <Search {navigateTo} {setAlbumId} />
        </div>
    {:else if page === 'confirm'}
        <div in:fade={{ delay: 500, duration: 500 }} out:fade={{ duration: 500 }}>
        <Confirm {navigateTo} {setGradientPhase} {albumId} {settings} {setSettings} {setAlbumColors}/>
        </div>
    {:else if page === 'listen'}
        <div in:fade={{ delay: 500, duration: 500 }} out:fade={{ duration: 500 }}>
        <Listen {albumId} {settings} {navigateTo} />
        </div>
    {:else if page === 'finish'}
        <div in:fade={{ delay: 500, duration: 500 }} out:fade={{ duration: 500 }}>
        <Finish {albumId} />
        </div>
    {/if}
    {/await}
    
    <div class="info-container">
        <Info />
    </div>
</main>

<style>
    main {
        display: flex;
        flex-direction: column;
        width: 100vw;
        height: 100vh;
        background-color: #000;
        user-select: none;
    }

    .info-container {
        position: absolute;
        bottom: 0;
        left: 0;
        padding: 0.25rem;
    }
</style>
