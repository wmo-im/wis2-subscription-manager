<template>
    <v-card variant="outlined" color="#757575">
        <v-card-item :style="`min-height: ${height}`" :id="id"></v-card-item>
    </v-card>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue';
import { VCard } from 'vuetify/lib/components/index.mjs';
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default defineComponent({
    name: "BboxView",
    components: {
        VCard
    },
    props: {
        coordinates: {},
        id: {
            type: String,
            default: "map"
        },
        height: {
            type: String,
            default: "30rem"
        },
        baseMapUrl: {
            type: String,
            default: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        },
        baseMapAttribution: {
            type: String,
            default: '<a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        }
    },
    setup(props) {

        // Reactive variables
        const map = ref(null);
        const rectangle = ref(null);
        const zoom = ref(3);
        const centre = ref([0, 0]);

        // Computed property for bounds
        const bounds = computed(() => {
            if (props.coordinates) {
                const westLongitude = props.coordinates[0][0];
                const northLatitude = props.coordinates[0][1];
                const eastLongitude = props.coordinates[2][0];
                const southLatitude = props.coordinates[2][1];
                return L.latLngBounds(
                    L.latLng(northLatitude, eastLongitude),
                    L.latLng(southLatitude, westLongitude)
                );
            }
            return null;
        });

        onMounted(() => {
            map.value = L.map(props.id).setView(centre.value, zoom.value);
            map.value.attributionControl.setPrefix('');
            L.tileLayer(props.baseMapUrl, { attribution: props.baseMapAttribution }).addTo(map.value);
            if (rectangle.value) {
                rectangle.value.remove();
            }
            rectangle.value = L.rectangle(bounds.value, { color: "#003DA5", weight: 1 }).addTo(map.value);
            map.value.fitBounds(bounds.value);
        });

        return {
            map,
            bounds
        }
    }
});
</script>