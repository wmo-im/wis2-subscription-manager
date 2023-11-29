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
                            <v-btn @click="searchCatalogue" icon="mdi-cloud-search" color="#003DA5" variant="flat" :disabled="!catalogueBoolean"
                            :loading="loadingBoolean"></v-btn>
                        </v-col>
                    </v-row>
                </v-card-item>

                <!-- Display catalogue datasets searched by user -->
                <v-container>
                    <v-data-table :items="datasets" :key="tableKey">
                        <template v-slot:item.title="{item}">
                            <v-btn text @click="openDialog(item)">
                                {{ item.title }}
                            </v-btn>
                        </template>
                    </v-data-table>

                    <!-- Dialog to display dataset metadata -->
                    <v-dialog v-model="dialog" max-width="750px">
                        <v-card>
                            <v-card-title>{{ selectedItem.title }}</v-card-title>
                            <v-table>
                                <template v-for="(value, key) in selectedItem">
                                    <tr v-if="key !== 'title'">
                                        <td>{{ key }}</td>
                                        <td>{{ value }}</td>
                                    </tr>
                                </template>
                            </v-table>
                        </v-card>
                    </v-dialog>

                </v-container>
            </v-card>
        </v-col>
    </v-row>
</template>

<script>
import { defineComponent, ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { VCard, VCardTitle, VCardText, VCardItem, VForm, VBtn, VListGroup, VSelect, VTextField, VTable } from 'vuetify/lib/components/index.mjs';
import { VDataTable } from 'vuetify/lib/labs/VDataTable/index.mjs';


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
        VTable,
        VDataTable
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
        const loadingBoolean = ref(false);
        const tableKey = ref(0);
        const selectedItem = ref(null);
        const dialog = ref(false);
        
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
            // Enable the button loading animation
            loadingBoolean.value = true;
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
                    // Add 1 to the key so that the table is forced to update
                    tableKey.value++
                    // Disable loading animation of button
                    loadingBoolean.value = false;
                }, 1000);
        }
        
        // Open the dialog to display dataset metadata
        const openDialog = (item) => {
            selectedItem.value = item;
            dialog.value = true;
        }

        return {
            catalogueList,
            selectedCatalogue,
            query,
            bbox,
            loadingBoolean,
            tableKey,
            catalogueBoolean,
            selectedItem,
            dialog,
            datasets,
            searchCatalogue,
            openDialog
        }
    }
})

</script>

<style scoped>

</style>