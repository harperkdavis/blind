<script lang="ts">
    export let navigateTo: (page: string) => void;
    export let beginNavigatesTo: string;

    function begin() {
        if (!localStorage.getItem("earblind")) {
            localStorage.setItem("earblind", "true");
            navigateTo('tutorial');
        } else {
            navigateTo(beginNavigatesTo);
        }
    }
</script>

<div class="content">
    <h1 class="title wide animate-in">EARBLIND</h1>
    <button class="difference buttonlike begin-button animate-delayed animate-in" on:click={begin}>
        <h3>BEGIN</h3>
    </button>
</div>

<style>
    .title {
        text-align: center;
        line-height: 0;
        font-size: 14vw;
        mix-blend-mode: difference;
    }

    .difference {
        mix-blend-mode: difference;
    }

    .begin-button {
        font-size: 2rem;
        line-height: 0;
        color: white;
    }

    .animate-in {
        animation: fade-in 2s cubic-bezier(0.33, 1, 0.68, 1);
    }

    .animate-delayed {
        animation-delay: 1s;
        animation-fill-mode: forwards;
        opacity: 0;
    }

    button {
        padding: 0;
        margin: 0;
        background: 0;
        border: 0;
        outline: 0;
    }

    @keyframes fade-in {
        from {
        opacity: 0;
        transform: translateY(1rem);
        }
        to {
        opacity: 1;
        transform: translateY(0rem);
        }
    }

</style>