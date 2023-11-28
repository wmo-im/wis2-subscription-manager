<template>
    <v-row class="justify-center">
        <v-col cols=12 class="max-form-width">
            <v-card>
                <v-card-title class="big-title">Search a WIS2 Global Discovery Catalogue</v-card-title>

                <v-card-item>
                    <v-row>
                        <v-col cols="4">
                            <v-select v-model="selectedCatalogue" :items="catalogueList" label="Choose a catalogue"></v-select>
                        </v-col>
                        <v-col cols="4">
                            <v-text-field v-model="query" label="Search for a dataset" hint="Optional" persistent-hint clearable></v-text-field>
                        </v-col>
                        <v-col cols="3">
                            <v-text-field v-model="bbox" mask="####" label="Bounding box" hint="Optional" persistent-hint clearable></v-text-field>
                        </v-col>
                        <v-col cols="1">
                            <v-btn @click="searchCatalogue" icon="mdi-cloud-search" color="#003DA5" variant="flat" :disabled="!catalogueBoolean"></v-btn>
                        </v-col>
                    </v-row>
                </v-card-item>

                {{ datasets }}
            </v-card>
        </v-col>
    </v-row>
</template>

<script>
import { defineComponent, ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { VCard, VCardTitle, VCardText, VCardItem, VForm, VBtn, VListGroup, VSelect, VTextField, VChipGroup, VChip, VCheckboxBtn } from 'vuetify/lib/components/index.mjs';


export default defineComponent({
    name: 'ConfigSub',
    components: {
        VCard,
        VCardTitle,
        VCardText,
        VCardItem,
        VForm,
        VBtn,
        VListGroup,
        VSelect,
        VTextField,
        VChipGroup,
        VChip,
        VCheckboxBtn
    },
    setup() {

        // Static variables
        const catalogueList = ['Canada Catalogue', 'China Catalogue']
        const catalogueMap = {
            'Canada Catalogue': 'https://api.weather.gc.ca/collections/wis2-discovery-metadata/items',
            'China Catalogue': 'https://gdc.wis.cma.cn/collections/wis2-discovery-metadata/items'
        }

        // Reactive variables
        const selectedCatalogue = ref('');
        const query = ref(null);
        const bbox = ref(null);
        const datasets = ref([]);
        
        // Computed properties

        // Boolean to check if the catalogue is selected
        const catalogueBoolean = computed(() => {
            return selectedCatalogue.value !== ''
        })

        // Map selected catalogue to the catalogue url
        const catalogueUrl = computed(() => {
            return catalogueMap[selectedCatalogue.value]
        })

        // Methods

        // Load catalogue from JSON file
        const loadCatalogue = async () => {
            // Load the datasets from the JSON file
            datasets.value = await window.electronAPI.loadCatalogue()
        }

        // Search the catalogue
        const searchCatalogue = async () => {
            // Build data object to pass to backend
            const data = {
                url: catalogueUrl.value,
                query: query.value,
                bbox: bbox.value
            }
            // Query the catalogue and write the results to JSON file
            await window.electronAPI.searchCatalogue(data)

            // Delay loading of JSON file to allow time for the backend
            setTimeout(() => {
                    loadCatalogue();
                }, 1000);
        }

        return {
            catalogueList,
            selectedCatalogue,
            query,
            bbox,
            catalogueBoolean,
            datasets,
            searchCatalogue
        }
    }
})

</script>

<style scoped>

</style>