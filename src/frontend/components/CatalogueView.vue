<template>
    <v-row class="justify-center">
        <v-col cols=12 class="max-form-width">
            <v-card min-height="700px">
                <v-card-title class="big-title">Search a WIS2 Global Discovery Catalogue</v-card-title>

                <v-card-item>
                    <v-row dense>
                        <v-col cols="4">
                            <v-select v-model="selectedCatalogue" :items="catalogueList"
                                label="Choose a catalogue"></v-select>
                        </v-col>
                        <v-col cols="4">
                            <v-text-field v-model="query" label="Search for a dataset" hint="Optional" persistent-hint
                                clearable></v-text-field>
                        </v-col>
                        <v-col cols="3">
                            <v-text-field v-model="bbox" label="Bounding box" hint="Optional" persistent-hint
                                clearable></v-text-field>
                        </v-col>
                        <v-col cols="1">
                            <v-btn @click="searchCatalogue" icon="mdi-cloud-search" color="#003DA5" variant="flat"
                                :disabled="!catalogueBoolean" :loading="loadingBoolean"
                                class="mx-3"></v-btn>
                        </v-col>
                    </v-row>
                </v-card-item>

                <!-- Display catalogue datasets searched by user -->
                <v-card-item>
                    <v-table v-if="tableBoolean === true" hover="true">
                        <thead>
                            <tr>
                                <th class="text-left">
                                    Datasets Found
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in sortedDatasets" :key="item.title" @click="openDialog(item)"
                                class="clickable-row">
                                <td>
                                    {{ item.title }}
                                </td>
                            </tr>
                        </tbody>
                    </v-table>

                    <!-- Dialog to display dataset metadata -->
                    <v-dialog v-model="dialog" max-width="900px">
                        <v-card>
                            <v-card-title>
                                {{ selectedItem.title }}
                                <v-btn icon="mdi-close" variant="text" class="close-button" @click="dialog = false" />
                            </v-card-title>
                            <v-table density="comfortable" class="my-4">
                                <template v-for="(value, key) in selectedItem">
                                    <tbody>
                                        <tr v-if="key !== 'title'">
                                            <td><b>{{ key }}</b></td>
                                            <td>{{ value }}</td>
                                        </tr>
                                    </tbody>
                                </template>
                            </v-table>
                            <v-card-actions>
                                <v-btn color="#64BF40" variant="flat" block>
                                    Add Dataset to Subscription</v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>

                </v-card-item>
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
        const catalogueList = ['Meteorological Service of Canada', 'China Meteorological Administration']
        const catalogueMap = {
            'Meteorological Service of Canada': 'https://api.weather.gc.ca/collections/wis2-discovery-metadata/items',
            'China Meteorological Administration': 'https://gdc.wis.cma.cn/collections/wis2-discovery-metadata/items'
        }

        // Reactive variables
        const selectedCatalogue = ref('');
        const query = ref(null);
        const bbox = ref(null);
        const datasets = ref([]);
        const loadingBoolean = ref(false);
        const tableBoolean = ref(false);
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

        // Sorts dataset by alphabetical order of title
        const sortedDatasets = computed(() => {
            return datasets.value.sort((a, b) => {
                return a.title.localeCompare(b.title)
            })
        });

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
            // Build bbox array
            const bboxArray = bbox.value ? bbox.value.split(',').map(Number) : null;
            // Build data object to pass to backend
            const data = {
                url: catalogueUrl.value,
                query: query.value,
                bbox: bboxArray
            }
            // Query the catalogue and write the results to JSON file
            await window.electronAPI.searchCatalogue(data)

            // Delay loading of JSON file to allow time for the backend
            setTimeout(() => {
                loadCatalogue();
                // Display table
                tableBoolean.value = true;
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
            tableBoolean,
            catalogueBoolean,
            selectedItem,
            dialog,
            sortedDatasets,
            searchCatalogue,
            openDialog
        }
    }
})

</script>

<style scoped>
.clickable-row {
    cursor: pointer;
}
</style>