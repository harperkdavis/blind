<script lang="ts">
    import axios from "axios";

    function auth() {
        window.open(axios.defaults.baseURL + "/auth", "_self");
    }

</script>

<div class="content">
    <div class="window window-short">
        <div class="inner-content">
            <h2 class="wide">AUTH</h2>
            <p>GRANT ACCESS WITH YOUR SPOTIFY ACCOUNT</p>
            <button on:click={auth}>
                <h3>LOGIN</h3>
            </button>
        </div>
    </div>
</div>

<style>
    .inner-content {
        padding-left: 2rem;
        padding-right: 2rem;
    }

    button {
        background-color: #fff;
        color: #000;
        border-radius: 0.5rem;
        padding: 0 1rem;
    }
</style>