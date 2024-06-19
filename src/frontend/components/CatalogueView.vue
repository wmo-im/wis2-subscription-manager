<template>
    <v-row class="justify-center">
        <v-col cols=12 class="max-form-width">
            <v-card min-height="88vh">
                <v-toolbar dense>
                    <v-toolbar-title class="big-title">Search a WIS2 Global Discovery Catalogue</v-toolbar-title>
                </v-toolbar>
                <v-card-subtitle>Explore and find datasets to add to your list of pending subscriptions</v-card-subtitle>

                <v-col cols="12" />

                <v-card-item>
                    <v-row dense>
                        <v-col cols="5.5">
                            <v-select v-model="selectedCatalogue" :items="catalogueList" item-title="title"
                                item-value="url" label="Choose a catalogue"></v-select>
                        </v-col>
                        <v-col cols="5.5">
                            <v-text-field v-model="query" label="Search the catalogue" hint="Optional" persistent-hint
                                clearable></v-text-field>
                        </v-col>
                        <v-col cols="1">
                            <v-btn @click="searchCatalogue" icon="mdi-cloud-search" color="#003DA5" variant="flat"
                                :disabled="!catalogueBoolean" :loading="loadingBoolean" class="mx-3"></v-btn>
                        </v-col>
                    </v-row>
                </v-card-item>

                <!-- Dialog to display typical error messages -->
                <v-dialog v-model="showErrorDialog" max-width="600px" persistent>
                    <v-card>
                        <v-toolbar :title="errorTitle" color="#003DA5">
                        </v-toolbar>
                        <v-card-text>
                            {{ errorMessage }}
                        </v-card-text>
                        <v-card-actions>
                            <v-btn color="#003DA5" block @click="showErrorDialog = false">
                                OK
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>

                <!-- Display catalogue datasets searched by user -->
                <v-card-item>
                    <v-table :hover="true">
                        <thead>
                            <tr>
                                <th scope="row" class="topic-column">
                                    <p class="medium-title">Discovery Metadata Records Found</p>
                                </th>
                                <th scope="row" class="button-column">
                                    <v-row justify="center" class="pa-2"
                                        v-if="tableBoolean === true && connectionStatus">
                                        <v-switch inset label="Add All" v-model="addAllTopics"
                                            @change="addOrRemoveAllTopics(datasets, addAllTopics)"
                                            :disabled="tableBoolean === false" color="#003DA5" />
                                    </v-row>
                                </th>
                            </tr>
                        </thead>
                        <transition name="slide-y-transition">
                            <tbody v-show="tableBoolean === true">
                                <tr v-for="item in datasets" :key="item.title" @click="openDialog(item)"
                                    class="clickable-row">
                                    <td class="small-title">
                                        {{ item.title }}
                                    </td>
                                    <td>
                                        <!-- If topic not added, allow them to add -->
                                        <v-btn block
                                            v-if="!topicFound(item.topic_hierarchy, selectedTopics) && item.topic_hierarchy && connectionStatus"
                                            color="#64BF40" append-icon="mdi-plus" variant="flat"
                                            @click.stop="addTopicToPending(item)">
                                            Add</v-btn>
                                        <v-btn block
                                            v-if="topicFound(item.topic_hierarchy, pendingTopics) && connectionStatus"
                                            color="error" append-icon="mdi-minus" variant="flat"
                                            @click.stop="removeTopicFromPending(item)">
                                            Remove</v-btn>
                                        <v-btn block v-if="topicFound(item.topic_hierarchy, activeTopics)" disabled
                                            color="#003DA5" append-icon="mdi-download-multiple" variant="flat">
                                            Active</v-btn>
                                        <v-btn block v-if="!item.topic_hierarchy && connectionStatus" disabled variant="flat">
                                            No Topic</v-btn>
                                    </td>
                                </tr>
                            </tbody>
                        </transition>
                    </v-table>

                    <!-- Dialog to display dataset metadata -->
                    <v-dialog v-model="dialog" transition="scroll-y-transition" class="max-dialog-width">
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
                                    <v-col cols="12">
                                        <v-btn color="#E09D00" append-icon="mdi-code-json" variant="flat" block
                                            @click="openJSON(selectedItem.identifier, selectedItem.title)" :loading="loadingJsonBoolean">
                                            View JSON
                                        </v-btn>
                                    </v-col>
                                </v-row>
                            </v-card-actions>
                        </v-card>
                    </v-dialog>

                    <!-- Dialog to display the whole JSON object -->
                    <v-dialog v-model="jsonDialog" max-height="600px" max-width="1200px" scrollable
                        transition="scale-transition">
                        <v-card>
                            <v-toolbar :title="selectedItem.title" color="#E09D00">
                                <v-btn icon="mdi-close" variant="text" @click="jsonDialog = false" />
                            </v-toolbar>
                            <v-card-text>
                                <pre class="wrap-text">{{ formattedJson }}</pre>
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

// Utilities
import { HTTP_CODES } from '@/utils/constants.js';


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
        VTable
    },
    setup() {
        // Deep clone function to avoid reference issues between model and default model
        function deepClone(obj) {
            return JSON.parse(JSON.stringify(obj));
        }

        // Static variables
        const catalogueList = [
            { title: 'Meteorological Service of Canada', url: 'https://api.weather.gc.ca/collections/wis2-discovery-metadata/items' },
            { title: 'China Meteorological Administration', url: 'https://gdc.wis.cma.cn/collections/wis2-discovery-metadata/items?f=json' }
        ];

        // Reactive variables
        const selectedCatalogue = ref('');
        const query = ref(null);
        const datasets = ref([]);
        const loadingBoolean = ref(false);
        const tableBoolean = ref(false);
        const addAllTopics = ref(false);
        const selectedItem = ref(null);
        const dialog = ref(false);
        const formattedJson = ref(null);
        const loadingJsonBoolean = ref(false);
        const jsonDialog = ref(false);

        // Information from Subscribe page
        const serverLink = ref('');
        const token = ref('');
        const connectionStatus = ref(false);
        const activeTopics = ref([]);
        const pendingTopics = ref([]);

        // Error from the catalogue
        const errorMessage = ref('');
        const showErrorDialog = ref(false);

        // Computed properties

        // Stored settings from Subscribe page
        const settings = computed(() => {
            return {
                serverLink: serverLink.value,
                token: token.value,
                connectionStatus: connectionStatus.value,
                activeTopics: activeTopics.value,
                pendingTopics: pendingTopics.value
            }
        });

        // Boolean to check if the catalogue is selected
        const catalogueBoolean = computed(() => {
            return selectedCatalogue.value !== ''
        });

        // Concatenation of active and pending topics selected
        const selectedTopics = computed(() => {
            return [...activeTopics.value, ...pendingTopics.value];
        });

        // Methods

        // Handle errors displayed to user
        const handleError = (title, message) => {
            errorTitle.value = title;
            errorMessage.value = message;
            showErrorDialog.value = true;
        };

        // Load the saved information from the electron API
        const loadSettings = async () => {
            try {
                const storedSettings = await window.electronAPI.loadSettings();
                if (!storedSettings) {
                    handleError('Error Loading Settings', 'There was an issue loading the settings or topics you selected. Please try reloading the application.');
                    return;
                }
                serverLink.value = storedSettings?.serverLink || '';
                token.value = storedSettings?.token || '';
                connectionStatus.value = storedSettings?.connectionStatus || false;
                activeTopics.value = storedSettings?.activeTopics || [];
                pendingTopics.value = storedSettings?.pendingTopics || [];
            }
            catch (error) {
                handleError('Error Loading Settings', `There was an issue loading the settings or topics you selected (${error.message}). Please try reloading the application.`);
            }
        }

        // Helper function to fetch API data
        const fetchAPI = async (url, params) => {
            try {
                const response = await fetch(`${url}?${params}`);
                if (!response.ok) {
                    const readableError = HTTP_CODES[response.status] || response.statusText;
                    throw new Error(`There was an error connecting to the catalogue: ${readableError}`);
                }
                return await response.json();
            } catch (error) {
            throw new Error(`There was an error connecting to the catalogue: ${error.message}`);
            }
        };

        // Search the catalogue
        const searchCatalogue = async () => {
            // Enable the button loading animation
            loadingBoolean.value = true;

            // Query the catalogue and write the results to JSON file
            const params = new URLSearchParams();

            // Add query if it exists
            if (query.value) {
                params.append('q', query.value);
            }

            let items;
            // Query the catalogue
            try {
                items = await fetchAPI(selectedCatalogue.value, params);
            } catch (error) {
                handleError('Error Searching Catalogue', error.message);
                loadingBoolean.value = false; // Disable loading animation of button
                return;
            }

            // check if items exists before trying to retrieve features
            const features = items?.features;
            if (!features) {
                handleError('No Datasets Found', 'No features were found under this search. Please try a different search or catalogue.')
                loadingBoolean.value = false;
                return;
            }

            datasets.value = features.map(item => {
                const properties = item.properties;

                // Initialise other features we want to extract
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
                const identifier = properties?.identifier

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
                    title: properties?.title,
                    creation_date: properties?.created,
                    topic_hierarchy: topic_hierarchy,
                    data_policy: properties?.['wmo:dataPolicy'],
                }
            });

            // Order this by alphabetical order of title
            datasets.value.sort((a, b) => {
                return a.title.localeCompare(b.title)
            })

            // Display table
            tableBoolean.value = true;

            // Disable loading animation of button
            loadingBoolean.value = false;
        };

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
        const openJSON = async (id, title) => {
            // Enable the button loading animation
            loadingJsonBoolean.value = true;

            let url;

            // Try to get the JSON url by ID or title
            if (id) {
                url = `${selectedCatalogue.value}/${id}?f=json`;
            }
            else if (selectedItem.value && selectedItem.value.title) {
                url = `${selectedCatalogue.value}?title=${encodeURIComponent(selectedItem.value.title)}&f=json`;
            }
            else {
                handleError('Error Opening JSON', 'There was a problem viewing the JSON: Missing identifier or title');
                loadingJsonBoolean.value = false;
                return;
            }

            // Format the JSON content
            const response = await fetch(url);

            if (!response.ok) {
                handleError('Error Opening JSON', `Error fetching JSON data: ${response.statusText}`);
                loadingJsonBoolean.value = false;
                return;
            }

            const data = await response.json();
            formattedJson.value = JSON.stringify(data, null, 2);

            // Open the dialog screen
            jsonDialog.value = true;

            // Disable loading animation of button
            loadingJsonBoolean.value = false;
        };

        // Converts wildcards (+, #) to regex, if present
        const wildcardToRegex = (topic) => {
            return new RegExp("^" + topic.split("/")
                .map(part => {
                    if (part === "+") return "[^/]+";   // Matches one level
                    if (part === "#") return ".*";      // Matches multiple levels
                    return part;                        // Regular topic level
                }).join("\\/") + "$");
        };

        // Check if the topic is found in the list of topic items, or falls under a category
        // of topics in the list (if a topic in the list uses wildcards)
        const topicFound = (topicToFind, topicList) => {
            return topicList.some(item => {
                const regex = wildcardToRegex(item.topic);
                return regex.test(topicToFind);
            });
        };

        // When the user clicks 'Add dataset to subscription', add the
        // associated topic to an array which will be parsed to the Electron API
        const addTopicToPending = (item) => {
            const topicToAdd = item.topic_hierarchy;

            // Check if there is any topic hierarchy associated with the dataset
            if (!topicToAdd) {
                return;
            }

            const toAdd = {
                topic: topicToAdd,
                target: "$TOPIC"
            };

            // Make sure there are no duplicates before adding
            const isDuplicate = topicFound(topicToAdd, selectedTopics.value);
            if (isDuplicate) {
                handleError('Error Adding Topic', 'The topic has already been added to subscription');
                return;
            }

            const updatedTopics = [...pendingTopics.value, toAdd];
            pendingTopics.value = updatedTopics;

            // Close the dialog
            dialog.value = false;
        }

        // When the user clicks 'Remove dataset from subscription', remove
        // the associated topic from the array which will be parsed to the Electron API
        const removeTopicFromPending = (item) => {
            const topicToRemove = item.topic_hierarchy;

            // Check if there is any topic hierarchy associated with the dataset
            if (!topicToRemove) {
                return;
            }

            // Remove it from the array if it can be found
            const topicCanBeRemoved = topicFound(topicToRemove, pendingTopics.value);

            if (!topicCanBeRemoved) {
                handleError('Error Removing Topic', 'The topic was not found in the subscription');
                return;
            }

            let updatedTopics = [...pendingTopics.value];
            updatedTopics = updatedTopics.filter(item => item !== topicToRemove);
            pendingTopics.value = updatedTopics;

            // Close the dialog
            dialog.value = false;
        };

        // Toggles the selection of all topics
        const addOrRemoveAllTopics = async (items, shouldSelectAll) => {
            if (shouldSelectAll === true) {
                for (const item of items) {
                    addTopicToPending(item);
                }
            }
            else if (shouldSelectAll === false) {
                // Empty the pending topics array
                pendingTopics.value = [];
            }
        };

        // Watch for changes in any of the user inputs, so that if they
        // navigate to the Subscribe page and return, their configuration is not lost
        watch(settings, () => {
            // As reactive objects aren't serialisable, we must deep copy it
            const settingsToStore = deepClone(settings.value);
            // Store the information in the electron API
            window.electronAPI.storeSettings(settingsToStore);
        }, { deep: true }); // Use deep watch to track nested array

        onMounted(() => {
            // Get settings from GDC or previous usage of configuration page
            loadSettings();
        })

        return {
            // Static variables
            catalogueList,

            // Reactive variables
            selectedCatalogue,
            query,
            datasets,
            loadingBoolean,
            tableBoolean,
            addAllTopics,
            selectedItem,
            dialog,
            formattedJson,
            loadingJsonBoolean,
            jsonDialog,
            connectionStatus,
            activeTopics,
            pendingTopics,
            errorMessage,
            showErrorDialog,

            // Computed variables
            catalogueBoolean,
            selectedTopics,

            // Methods
            searchCatalogue,
            openDialog,
            formatKey,
            openJSON,
            topicFound,
            addTopicToPending,
            removeTopicFromPending,
            addOrRemoveAllTopics
        }
    }
})

</script>

<style scoped>
.topic-column {
    width: 83%;
}

.button-column {
    width: 17%;
}
</style>