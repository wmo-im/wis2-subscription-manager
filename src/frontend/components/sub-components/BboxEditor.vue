<template>
    <v-card variant="outlined" color="#757575">
        <v-card-item class="map" :id="id"></v-card-item>
    </v-card>
</template>

<script>
import { defineComponent, ref, computed, onMounted, watch } from 'vue';
import { VCard } from 'vuetify/lib/components/index.mjs';
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default defineComponent({
    name: "BboxEditor",
    components: {
        VCard
    },
    props: {
        boxBounds: {}
    },
    setup(props) {

        // Reactive variables
        const map = ref(null);
        const id = ref('map');
        const rectangle = ref(null);
        const zoom = ref(1.5);
        const centre = ref([0, 0]);

        // Computed property for bounds
        const bounds = computed(() => {
            if (props.boxBounds) {
                return L.latLngBounds(
                    L.latLng(props.boxBounds[0], props.boxBounds[1]),
                    L.latLng(props.boxBounds[2], props.boxBounds[3])
                );
            }
            return null;
        });

        onMounted(() => {
            // Add 1 second delay to load map or Vue will call mounted before DOM is available
            setTimeout(() => {
                map.value = L.map(id.value).setView(centre.value, zoom.value);
                map.value.attributionControl.setPrefix('');
                L.tileLayer(`${import.meta.env.VITE_BASEMAP_URL}`, { attribution: `${import.meta.env.VITE_BASEMAP_ATTRIBUTION}` }).addTo(map.value);
            }, 1)
        });

        watch(bounds, (newBounds) => {
            // If bounds added, add a rectangle to the map
            if (newBounds) {
                if (rectangle.value) {
                    rectangle.value.remove();
                }
                rectangle.value = L.rectangle(newBounds, { color: "#003DA5", weight: 1 }).addTo(map.value);
                map.value.fitBounds(newBounds);
            }
            // If bounds removed, remove the corresponding rectangle
            else if (rectangle.value) {
                rectangle.value.remove();
                rectangle.value = null;
            }
        });

        return {
            map,
            id
        }
    }
});
</script>

<style scoped>
.map {
    height: 100%;
    width: 100%;
    min-height: 320px;
}
</style>