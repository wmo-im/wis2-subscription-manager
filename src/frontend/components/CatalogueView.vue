<template>
    <v-row class="justify-center">
        <v-col cols=12 class="max-form-width">
            <v-card min-height="700px">
                <v-card-title class="big-title">Search a WIS2 Global Discovery Catalogue</v-card-title>

                <v-card-item>
                    <v-row dense>
                        <v-col cols="4">
                            <v-select v-model="selectedCatalogue" :items="catalogueList" item-title="title" item-value="url"
                                label="Choose a catalogue"></v-select>
                        </v-col>
                        <v-col cols="4">
                            <v-text-field v-model="searchedTitle" label="Enter a title" hint="Optional" persistent-hint
                                clearable></v-text-field>
                        </v-col>
                        <v-col cols="3">
                            <v-text-field v-model="query" label="Search the catalogue" hint="Optional" persistent-hint
                                clearable></v-text-field>
                        </v-col>
                        <v-col cols="1">
                            <v-btn @click="searchCatalogue" icon="mdi-cloud-search" color="#003DA5" variant="flat"
                                :disabled="!catalogueBoolean" :loading="loadingBoolean" class="mx-3"></v-btn>
                        </v-col>
                    </v-row>
                </v-card-item>

                <!-- Display catalogue datasets searched by user -->
                <v-card-item>
                    <v-table v-if="tableBoolean === true" :hover="true">
                        <thead>
                            <tr>
                                <th scope="row" class="text-left">
                                    Discovery Metadata Records Found
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in datasets" :key="item.title" @click="openDialog(item)" class="clickable-row">
                                <td>
                                    {{ item.title }}
                                </td>
                                <td class="check-mark">
                                    <v-icon v-if="selectedTopics.includes(item.topic_hierarchy)" icon="mdi-check-circle" />
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
                                        <v-btn color="#E09D00" variant="flat" block
                                            @click="openJSON(selectedItem.identifier)" :loading="loadingJsonBoolean">
                                            View JSON
                                        </v-btn>
                                    </v-col>
                                    <v-col cols="6">
                                        <!-- If topic not added, allow them to add -->
                                        <v-btn v-if="!selectedTopics.includes(selectedItem.topic_hierarchy)" color="#64BF40"
                                            variant="flat" block @click="addToSubscription(selectedItem.topic_hierarchy)">
                                            Add Dataset to Subscription</v-btn>
                                        <v-btn v-if="selectedTopics.includes(selectedItem.topic_hierarchy)" color="#D90429"
                                            variant="flat" block
                                            @click="removeFromSubscription(selectedItem.topic_hierarchy)">
                                            Remove Dataset from Subscription</v-btn>
                                    </v-col>
                                </v-row>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>

                    <!-- Dialog to display the whole JSON object -->
                    <v-dialog v-model="jsonDialog" transition="dialog-bottom-transition" max-height="600px" scrollable>
                        <v-card>
                            <v-toolbar :title="selectedItem.title" color="#003DA5">
                                <v-btn icon="mdi-close" variant="text" @click="jsonDialog = false" />
                            </v-toolbar>
                            <v-card-text>
                                <pre>{{ formattedJson }}</pre>
                            </v-card-text>
                        </v-card>
                    </v-dialog>
                </v-card-item>
            </v-card>
        </v-col>
    </v-row>
</template>

<script>
import { defineComponent, ref, computed, watch, onMounted } from 'vue';
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
        const catalogueList = [
            { title: 'Meteorological Service of Canada', url: 'https://api.weather.gc.ca/collections/wis2-discovery-metadata/items' },
            { title: 'China Meteorological Administration', url: 'https://gdc.wis.cma.cn/collections/wis2-discovery-metadata/items' }
        ];

        // Reactive variables
        const selectedCatalogue = ref('');
        const searchedTitle = ref(null);
        const query = ref(null);
        const datasets = ref([]);
        const loadingBoolean = ref(false);
        const tableBoolean = ref(false);
        const selectedItem = ref(null);
        const dialog = ref(false);
        const formattedJson = ref(null);
        const loadingJsonBoolean = ref(false);
        const jsonDialog = ref(false);
        const selectedTopics = ref([]);
        const broker = ref("");
        const downloadDirectory = ref("");
        const subscribeStatus = ref(false);

        // Computed properties

        // Boolean to check if the catalogue is selected
        const catalogueBoolean = computed(() => {
            return selectedCatalogue.value !== ''
        })

        // Methods

        // Load the saved information from the electron API
        const loadSettings = async () => {
            try {
                const settings = await window.electronAPI.loadSettings();
                if (settings) {
                    broker.value = settings.broker;
                    selectedTopics.value = settings.topics;
                    downloadDirectory.value = settings.downloadDirectory;
                    subscribeStatus.value = settings.subscribeStatus;
                }
            }
            catch (error) {
                console.error('Error loading settings: ', error);
            }
        }

        // Search the catalogue
        const searchCatalogue = async () => {
            // Enable the button loading animation
            loadingBoolean.value = true;

            // Query the catalogue and write the results to JSON file
            const params = new URLSearchParams();
            // Add searched title if it exists
            if (searchedTitle.value) {
                params.append('title', searchedTitle.value);
            }
            // Add query if it exists
            if (query.value) {
                params.append('q', query.value);
            }

            // Query the catalogue
            const response = await fetch(`${selectedCatalogue.value}?${params}`);
            if (!response.ok) {
                throw new Error('Failed to query catalogue')
            }
            const items = await response.json();
            const features = items.features;

            if (features) {
                datasets.value = features.map(item => {
                    const properties = item.properties || {};

                    // Extract features from properties
                    const identifier = properties.identifier;
                    const title = properties.title;
                    const creation_date = properties.created;
                    const data_policy = properties['wmo:dataPolicy']

                    // Initiate other features we want to extract
                    let topic_hierarchy = null;
                    let center_id = null;

                    // The topic hierarchy is found in the 'channel'
                    // property in 'links' where the 'rel' is 'items'
                    // and the href starts with 'mqtt'
                    for (const link of item.links || []) {
                        if (link.rel === 'items' && link.href.startsWith('mqtt')) {
                            topic_hierarchy = link.channel;
                            // Once found, exit loop
                            break;
                        }
                    }

                    // Get the center ID from the identifier,
                    // depending on the structure of the identifier
                    if (identifier) {
                        if (identifier.includes(':')) {
                            const tokens = identifier.split(':');
                            center_id = tokens.length < 5 ? tokens[1] : tokens[3];
                        }
                        else {
                            const tokens = identifier.split('.');
                            center_id = tokens[1];
                        }
                    }

                    return {
                        identifier: identifier,
                        center_identifier: center_id,
                        title: title,
                        creation_date: creation_date,
                        topic_hierarchy: topic_hierarchy,
                        data_policy: data_policy,
                    }
                })
            }

            // Order this by alphabetical order of title
            datasets.value.sort((a, b) => {
                return a.title.localeCompare(b.title)
            })

            // Display table
            tableBoolean.value = true;
            // Disable loading animation of button
            loadingBoolean.value = false;
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
        const openJSON = async (id) => {
            // Enable the button loading animation
            loadingJsonBoolean.value = true;

            const url = `${selectedCatalogue.value}/${id}?f=json`;

            // Format the JSON content
            const response = await fetch(url);
            const data = await response.json();
            formattedJson.value = JSON.stringify(data, null, 1);

            // Open the dialog screen
            jsonDialog.value = true;

            // Disable loading animation of button
            loadingJsonBoolean.value = false;
        }

        // When the user clicks 'Add dataset to subscription', add the
        // associated topic to an array which will be parsed to the Electron API
        const addToSubscription = async (topic) => {
            console.log("Adding topic to subscription: " + topic)
            // Make sure there are no duplicates
            if (!selectedTopics.value.includes(topic)) {
                selectedTopics.value.push(topic);
            }
            // If the user is currently subscribed, handle the Flask API call
            if (subscribedStatus.value) {
                const data = {
                    topic: topic,
                    action: 'add'
                }
                await window.electronAPI.manageTopics(data);
            }
            // Close the dialog
            dialog.value = false;
        }

        // When the user clicks 'Remove dataset from subscription', remove
        // the associated topic from the array which will be parsed to the Electron API
        const removeFromSubscription = async (topic) => {
            console.log("Removing topic from subscription: " + topic)
            // Remove it from the array
            if (selectedTopics.value.includes(topic)) {
                selectedTopics.value.splice(selectedTopics.value.indexOf(topic), 1);
            }
            // If the user is currently subscribed, handle the Flask API call
            if (subscribedStatus.value) {
                const data = {
                    topic: topic,
                    action: 'delete'
                }
                await window.electronAPI.manageTopics(data);
            }
            // Close the dialog
            dialog.value = false;
        }

        // Watch for changes in the selected topics
        watch(selectedTopics, (newValue, oldValue) => {
            const settings = {
                broker: broker.value,
                topics: Array.from(selectedTopics.value),
                downloadDirectory: downloadDirectory.value,
                subscribeStatus: subscribeStatus.value
            };
            console.log("Storing settings:", settings);
            // Store the information in the electron API
            window.electronAPI.storeSettings(settings);
        }, { deep: true }); // Use deep watch to track nested array

        onMounted(() => {
            // Get settings from GDC or previous usage of configuration page
            loadSettings();
        })

        return {
            catalogueList,
            selectedCatalogue,
            searchedTitle,
            query,
            datasets,
            loadingBoolean,
            tableBoolean,
            catalogueBoolean,
            selectedItem,
            dialog,
            searchCatalogue,
            openDialog,
            formatKey,
            openJSON,
            formattedJson,
            loadingJsonBoolean,
            jsonDialog,
            selectedTopics,
            addToSubscription,
            removeFromSubscription,
            subscribeStatus
        }
    }
})

</script>

<style scoped>
.clickable-row {
    cursor: pointer;
}

.check-mark {
    text-align: right;
    vertical-align: middle;
}
</style>