<template>
    <img src="@/assets/foot.png"/>
    <v-footer class="footer-text">
        <div>
            {{ new Date().getFullYear() }} — <strong>World Meteorological Organization</strong>
        </div>
    </v-footer>
</template>

<style scoped>

.footer-text {
    display: flex;
    justify-content: center;
    align-items: center;
    color: #888;
}
</style>