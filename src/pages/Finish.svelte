<script lang="ts">
    import axios from "axios";
    import { TwitterIcon } from "svelte-feather-icons";

    export let albumId;

    let tweetLink;

    $: albumInfo = axios.get('/album?id=' + albumId).then((res) => {
        tweetLink = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent('I JUST LISTENED TO ' + res.data.name + ' on EARBLIND. CHECK IT OUT. https://earblind.hked.live');
        return res.data;
    }).catch(() => {
        return {};
    });
</script>

{#await albumInfo then albumInfo}
<div class="content">
    <div class="window window-tall">
        <div class="window-content">
            <h2 class="wide">ALL DONE</h2>
            <p>THANK YOU FOR LISTENING.</p>
            <img src={albumInfo.images[0].url} alt="album cover" class="album-cover">
            <h3 class="wide">{albumInfo.name}</h3>
            <p>IF YOU ENJOYED, PLEASE CONSIDER SHARING</p>
            <div class="shareables">
                <a href={tweetLink} target="_blank">
                    <TwitterIcon />
                </a>
            </div>
            <a href="https://earblind.hked.live" target="_blank">https://earblind.hked.live</a>
            <button on:click={() => location.reload()}>
                <h2 class="wide">LISTEN AGAIN</h2>
            </button>
        </div>
    </div>
</div>
{/await}

<style>

    .window-content {
        padding-left: 2rem;
        padding-right: 2rem;
    }

    .album-cover {
        width: 70%;
        object-fit: cover;
        border-radius: 0.5rem;
    }

    .shareables {
        display: flex;
        justify-content: space-evenly;
        flex-direction: row;
    }
</style>