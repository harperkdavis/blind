<script lang="ts">
    
    import { fade } from 'svelte/transition';
    import { ChevronLeftIcon, ChevronRightIcon } from 'svelte-feather-icons'
    export let navigateTo: (page: string) => void;

    let page = 0;

</script>

<div class="content">
    <div class="window">
        <div class="tutorial-content">
            {#if page == 0}
                <div class="page">
                    <h2 class="wide">HEY THERE</h2>
                    <p>WELCOME TO EARBLIND</p>
                    <p>THIS APP IS DESIGNED TO MAKE IT EASIER TO LISTEN TO NEW MUSIC</p>
                    <p>OR TO PROVIDE A MORE COMPLETE LISTENING EXPERIENCE</p>
                    <p>SO HOW DOES IT WORK?</p>
                </div>
            {:else if page == 1}
                <div class="page">
                    <h2 class="wide">PLAYBACK</h2>
                    <p>EARBLIND WILL CONTROL YOUR SPOTIFY PLAYBACK AND PLAY THROUGH EVERY TRACK OF AN ALBUM OF YOUR CHOICE</p>
                    <p>DON'T WORRY, YOU CAN ALWAYS RESUME CONTROL OF PLAYBACK AT ANY TIME</p>
                </div>
            {:else if page == 2}
                <div class="page">
                    <h2 class="wide">NARRATION</h2>
                    <p>EARBLIND WILL GRAB SNIPPETS OF INFO ABOUT EACH TRACK</p>
                    <p>EACH SONG WILL BE ANNOUNCED AND INTRODUCED WITH A BIT OF CONTEXT</p>
                    <p>THIS IS TO MIMIC THE FEELING OF A LIVE PERFORMANCE</p>
                </div>
            {:else if page == 3}
                <div class="page">
                    <h2 class="wide">BLIND</h2>
                    <p >WHEN LISTENING, ALL TRACKS THAT YOU HAVE NOT HEARD YET WILL BE</p>
                    <p class="light-blur" style="line-height: 0;">OBFUSCATED</p>
                    <p>IN ORDER TO ALLOW A BLIND LISTEN</p>
                    <div class="track-list">
                        <div class="track">
                            <p>1.</p>
                            <p>SONG #1</p>
                        </div>
                        <div class="track">
                            <p>2.</p>
                            <p>SONG #2</p>
                        </div>
                        <div class="track">
                            <p>3.</p>
                            <p class="blurred">SONG #3</p>
                        </div>
                    </div>
                </div>
            {:else}
                <div class="page">
                    <h2 class="wide">THAT'S IT</h2>
                    <p>LEAVE THIS WINDOW OPEN IN THE BACKGROUND</p>
                    <p>PLAYBACK AND ALBUMS PROVIDED BY SPOTIFY</p>
                    <p>ANNOTATIONS PROVIDED BY GENIUS</p>
                    <p>WITHOUT FURTHER ADO, GET COMFORTABLE AND LISTEN TO SOMETHING NEW</p>
                    <button class="wide" on:click={() => navigateTo('auth')}>CONTINUE</button>
                </div>
            {/if}
        </div>
        <div class="tutorial-navigate">
            <button disabled={page == 0} on:click={() => page -= 1}>
                <ChevronLeftIcon />
            </button>
            <button disabled={page == 4} on:click={() => page += 1}>
                <ChevronRightIcon />
            </button>
        </div>
    </div>
</div>

<style>

    .tutorial-content {
        padding-left: 2rem;
        padding-right: 2rem;
        flex-grow: 1;
        display: flex;
        flex-direction: column;
    }

    .tutorial-navigate {
        width: 100%;
        display: flex;
        justify-content:space-evenly;
        padding: 0.5rem;
    }

    .page {
        animation: fade-in 1s cubic-bezier(0.33, 1, 0.68, 1);
    }

    .light-blur {
        filter: blur(2px);
        opacity: 0.5;
    }

    button {
        padding: 0.5rem 3rem;
        margin: 0;
        background: 0;
        border: 0;
        outline: 0;
        color: white;
    }

    button:disabled {
        color: #333;
    }
    .track-list {
        display: grid;
        grid-auto-flow: row;
        line-height: 0;
    }

    .track {
        display: flex;
        flex-direction: row;
        gap: 0.5rem;
    }

    @keyframes fade-in {
        from {
            opacity: 0;
            transform: translateY(0.25rem);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

</style>