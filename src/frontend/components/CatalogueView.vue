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
                            <v-select v-model="country" :items="countryList" item-title="country" item-value="code"
                                label="Country" hint="Optional" persistent-hint></v-select>
                        </v-col>
                        <v-col cols="1">
                            <v-btn @click="searchCatalogue" icon="mdi-cloud-search" color="#003DA5" variant="flat"
                                :disabled="!catalogueBoolean" :loading="loadingBoolean" class="mx-3"></v-btn>
                        </v-col>
                    </v-row>
                </v-card-item>

                <!-- Display catalogue datasets searched by user -->
                <v-card-item>
                    <v-table v-if="tableBoolean === true" hover="true">
                        <thead>
                            <tr>
                                <th class="text-left">
                                    Discovery Metadata Records Found
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in datasets" :key="item.title" @click="openDialog(item)" class="clickable-row">
                                <td>
                                    {{ item.title }}
                                </td>
                            </tr>
                        </tbody>
                    </v-table>

                    <!-- Dialog to display dataset metadata -->
                    <v-dialog v-model="dialog" transition="dialog-bottom-transition">
                        <v-card class="overflow-hidden">
                            <v-toolbar :title="selectedItem.title" color="#003DA5">
                                <v-btn icon="mdi-close" variant="text" @click="dialog = false" />
                            </v-toolbar>
                            <v-table density="comfortable" class="my-4">
                                <template v-for="(value, key) in selectedItem">
                                    <tbody>
                                        <tr v-if="key !== 'title'">
                                            <td><b>{{ formatKey(key) }}</b></td>
                                            <td>{{ value }}</td>
                                        </tr>
                                    </tbody>
                                </template>
                            </v-table>
                            <v-card-actions>
                                <v-row>
                                    <v-col cols="6">
                                        <v-btn color="#E09D00" variant="flat" block @click="openJSON(selectedItem.id)">
                                            View JSON
                                        </v-btn>
                                    </v-col>
                                    <v-col cols="6">
                                        <v-btn color="#64BF40" variant="flat" block>
                                            Add Dataset to Subscription</v-btn>
                                    </v-col>
                                </v-row>
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
        const countryList = ref([]);
        const country = ref(null);
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

        // Methods

        // Load country code mappings from JSON file
        const loadCountries = async () => {
            try {
                const response = await fetch('backend/country_codes.json');
                if (!response.ok) {
                    throw new Error('Failed to load country codes')
                }
                const mappings = await response.json();
                // Build object containing country names and codes
                countryList.value = Object.entries(mappings).map(([key, value]) => ({ country: key, code: value }));
                // Order this by alphabetical order of country name
                countryList.value.sort((a, b) => {
                    return a.country.localeCompare(b.country)
                })
            } catch (error) {
                console.error(error);
            }
        }

        // Load catalogue from JSON file
        const loadCatalogue = async () => {
            try {
                const response = await fetch('backend/datasets.json');
                if (!response.ok) {
                    throw new Error('Failed to load datasets')
                }
                datasets.value = await response.json();
                // Order this by alphabetical order of title
                datasets.value.sort((a, b) => {
                    return a.title.localeCompare(b.title)
                })
            } catch (error) {
                console.error(error);
            }
        }

        // Search the catalogue
        const searchCatalogue = async () => {
            // Enable the button loading animation
            loadingBoolean.value = true;
            // Build data object to pass to backend
            const data = {
                url: catalogueUrl.value,
                query: query.value,
                country: country.value
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

        // Format the key to be more readable
        const formatKey = (key) => {
            return key
                // Replace underscores with spaces
                .replace(/_/g, ' ')
                // Capitalize the first letter of each word
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
        }

        // Opens JSON of dataset metadata
        const openJSON = (id) => {
            const url = `https://api.weather.gc.ca/collections/wis2-discovery-metadata/items/${id}?f=json`;
            window.open(url, '_blank');
        }

        // Mounted methods
        onMounted(() => {
            loadCountries();
        })

        return {
            catalogueList,
            selectedCatalogue,
            query,
            country,
            countryList,
            datasets,
            loadingBoolean,
            tableBoolean,
            catalogueBoolean,
            selectedItem,
            dialog,
            searchCatalogue,
            openDialog,
            formatKey,
            openJSON
        }
    }
})

</script>

<style scoped>
.clickable-row {
    cursor: pointer;
}
</style>