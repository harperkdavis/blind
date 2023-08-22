<script lang="ts">
    import { fade } from 'svelte/transition';

    import axios from 'axios';

    export let navigateTo: (page: string) => void;
    export let setAlbumId: (id: string) => void;

    let query = '';

    async function fetchQueryResults(query) {
        return await axios.get('/search?q=' + query).then((res) => {
            return res.data.albums.items;
        }).catch(() => {
            return [];
        });
    }

    $: searchResults = fetchQueryResults(query);

    function select(id: string) {
        console.log(id);
        setAlbumId(id);
        navigateTo('confirm');
    }

</script>

<div class="content">
    <div class="search-area">
        <!-- svelte-ignore a11y-autofocus -->
        <input
            autofocus
            class="search-input wide"
            type="text"
            placeholder="ENTER AN ALBUM"
            bind:value={query}

        />
        <div class="search-results" class:searching={query.length > 0}>
            {#await searchResults then searchResults}
                {#each searchResults as album, i}
                <button class="album album-visible" style={`animation-delay: ${i * 0.1}s;`} on:click={() => select(album.id)}>
                    <img src={album.images[1].url} class="album-cover" alt={album.name} />
                    <div class="album-info">
                        <p class="album-name wide" class:smaller-name={album.name.length > 80}>{album.name}</p>
                        <p class="artist-name">{album.artists.map(artist => artist.name).join(', ')}</p>
                        <p class="album-data">{album.release_date.split('-')[0]}</p>
                    </div>
                </button>
                {/each}
            {/await}
        </div>
    </div>
</div>

<style>
    .search-area {
        width: 400px;
        max-width: calc(100% - 3rem);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .search-input {
        color: white;
        width: 100%;
        padding: 1rem;
        border: 2px solid #fff;
        border-radius: 0.5rem;
        font-size: 1.5rem;
        text-align: center;
        background-color: transparent;
        mix-blend-mode: difference;
        text-transform: uppercase;
        margin-bottom: 0.5rem;
    }

    .search-results {
        width: 100%;
        display: flex;
        flex-direction: column;
        animation-fill-mode: forwards;
        overflow: hidden;
        height: 0px;
        transition: height 0.5s cubic-bezier(0.33, 1, 0.68, 1);
    }

    .searching {
        height: 400px;
    }

    .album {
        width: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
        background-color: #fff0;
        padding: 0;
        border: none;
        border-radius: 0;
    }

    .album:hover {
        cursor: pointer;
        background-color: #ffff;
        mix-blend-mode: difference;
    }

    .album-visible {
        animation-fill-mode: both !important;
        animation: fade-in 0.5s cubic-bezier(0.33, 1, 0.68, 1);
    }

    .album-info {
        flex-grow: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        text-align: left;
        height: 80px;
        mix-blend-mode: difference;
        padding-left: 0.5rem;
    }

    .album-name {
        font-size: 1rem;
        margin: 0;
        line-height: 1;
    }

    @keyframes fade-in {
        from {
            visibility: hidden;
            opacity: 0;
            transform: translateX(-20px);
        }

        to {
            visibility: visible;
            opacity: 1;
            transform: translateX(0px);
        }
    }

    .artist-name {
        font-size: 0.75rem;
        font-weight: 700;
        margin: 0;
    }

    .album-data {
        font-size: 0.65rem;
        margin: 0;
        line-height: 1;
    }

    .smaller-name {
        font-size: 0.6rem;
    }

    .album-cover {
        width: 80px;
        height: 80px;
    }

</style>