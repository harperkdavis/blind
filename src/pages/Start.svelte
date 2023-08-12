

<div class="content">
    <h1 class="title wide animate-in">EARBLIND</h1>
    <h3 class="difference buttonlike begin-button animate-delayed animate-in">BEGIN</h3>
</div>

<style>
    .content {
        position: absolute;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100vw;
        height: 100vh;
    }
    
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