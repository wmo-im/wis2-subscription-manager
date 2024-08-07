<template>
    <v-row class="justify-center">
        <v-col cols=12 class="max-form-width">
            <v-card min-height="88vh">
                <v-toolbar dense>
                    <v-toolbar-title class="big-title">Search a WIS2 Global Discovery Catalogue</v-toolbar-title>
                </v-toolbar>
                <v-card-subtitle class="py-2">
                    Explore and find datasets to add to your list of pending
                    subscriptions.
                    <br>
                    If you have not yet connected to a WIS2 Downloader, you will only be able to view the datasets.
                </v-card-subtitle>

                <v-card-item>
                    <v-row dense>
                        <v-col cols="5">
                            <v-select v-model="selectedCatalogue" :items="catalogueList" item-title="title"
                                item-value="url" label="Choose a catalogue"></v-select>
                        </v-col>
                        <v-col cols="5">
                            <v-text-field v-model="query" label="Search the catalogue" hint="Optional" persistent-hint
                                clearable></v-text-field>
                        </v-col>
                        <v-col cols="2">
                            <v-select v-model="limit" :items="limitOptions" label="Limit"></v-select>
                        </v-col>
                    </v-row>

                    <!-- Most screens -->
                    <SearchBar v-if="mdAndUp" :searchCatalogue="searchCatalogue" :catalogueBoolean="catalogueBoolean"
                        :loadingBoolean="loadingBoolean" barSize="4" />

                    <!-- Very small screens -->
                    <SearchBar v-if="!mdAndUp"
                        :searchCatalogue="searchCatalogue" :catalogueBoolean="catalogueBoolean"
                        :loadingBoolean="loadingBoolean" barSize="6" />

                </v-card-item>

                <!-- Dialog to display typical error messages -->
                <v-dialog v-model="showErrorDialog" max-width="600px" persistent>
                    <v-card>
                        <v-toolbar :title="errorTitle" color="error">
                        </v-toolbar>
                        <v-card-text>
                            {{ errorMessage }}
                        </v-card-text>
                        <v-card-actions>
                            <v-btn color="black" variant="flat" block @click="showErrorDialog = false">
                                OK
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>

                <!-- Display catalogue datasets searched by user -->
                <transition name="slide-y-transition">
                    <v-card-item class="scrollable-results" v-scroll.self="onScroll">
                        <!-- Scroll to top button -->
                        <v-row>
                            <v-col cols="12">
                                <div class="overlay-container">
                                    <v-fade-transition>
                                        <v-btn v-if="offsetTop > 500" class="overlay-button" color="#003DA5" icon="mdi-arrow-up"
                                            @click="toTop" />
                                    </v-fade-transition>
                                </div>
                            </v-col>
                        </v-row>

                        <!-- Table title -->
                        <v-banner v-if="tableBoolean === true" sticky class="pt-0 pb-0" id="top-banner">
                            <v-row class="align-center">
                                <v-col cols="auto">
                                    <p class="text-h5 font-weight-light pb-4">
                                        Discovery Metadata Records Found:
                                        <b v-if="tableBoolean" class="hint-default"> {{ filteredDatasets.length
                                            }}</b>
                                    </p>
                                </v-col>

                                <!-- Date order button -->
                                <v-col cols="2">
                                    <v-select label="Date"
                                    v-model="dateOrder"
                                    :items="['Latest', 'Oldest']"
                                    variant="underlined" density="compact"/>
                                </v-col>

                                <!-- Filter by topic button -->
                                <v-col cols="2">
                                    <v-checkbox label="Topic Available"
                                    v-model="filterByTopic" dense/>
                                </v-col>

                                <v-col v-if="connectedToDownloader" class="mr-3 d-flex justify-end">
                                    <v-switch inset label="Add All" v-model="addAllTopics"
                                        @change="addOrRemoveAllTopics(filteredDatasets, addAllTopics)"
                                        :disabled="tableBoolean === false" color="#003DA5" />
                                </v-col>
                            </v-row>
                        </v-banner>

                        <!-- Search results -->
                        <v-table :hover="true">
                            <tbody v-show="tableBoolean === true">
                                <!-- Inform user if search returned nothing -->
                                <tr v-if="filteredDatasets.length === 0">
                                    <td class="small-title py-3">
                                        <p>No datasets found. Please try a different search.</p>
                                    </td>
                                    <td></td>
                                </tr>
                                <!-- If datasets found, display them -->
                                <tr v-for="item in filteredDatasets" :key="`${item.title}-${item.creation_date}`"
                                    @click="openDialog(item)" class="clickable-row">
                                    <td class="small-title topic-column py-3">
                                        <div class="title-section">
                                            <span><b v-if="item.centre_identifier">{{ item.centre_identifier }}:</b>
                                                {{
                                formatValue(item.title) }}</span>
                                            <v-chip class="policy-section" label>{{ formatValue(item.data_policy)
                                                }}</v-chip>
                                        </div>
                                        <div class="description-section">
                                            <p>{{ item.description.substring(0, 120) + '...' }}</p>
                                        </div>
                                        <div class="keywords-section">
                                            <p><b>Keywords:</b> {{ formatValue(item.keywords) }}</p>
                                        </div>
                                        <div class="country-section">
                                            <p><b>Country:</b> {{ formatValue(item.country) }}</p>
                                        </div>
                                        <div class="date-section">
                                            <p><b>Creation Date:</b> {{ formatValue(item.creation_date) }}</p>
                                        </div>
                                    </td>
                                    <td>
                                        <!-- Buttons to add, remove, or show topic status -->
                                        <v-btn block
                                            v-if="!topicFound(item.topic_hierarchy, selectedTopics) && item.topic_hierarchy && connectedToDownloader"
                                            color="#64BF40" append-icon="mdi-plus" variant="flat"
                                            @click.stop="addTopicToPending(item)">
                                            Add</v-btn>
                                        <v-btn block
                                            v-if="topicFound(item.topic_hierarchy, pendingTopics) && connectedToDownloader"
                                            color="error" append-icon="mdi-minus" variant="flat"
                                            @click.stop="removeTopicFromPending(item.topic_hierarchy)">
                                            Remove</v-btn>
                                        <v-btn block v-if="topicFound(item.topic_hierarchy, activeTopics)" disabled
                                            color="#003DA5" append-icon="mdi-download-multiple" variant="flat">
                                            Active</v-btn>
                                        <v-btn block v-if="!item.topic_hierarchy && connectedToDownloader" disabled
                                            variant="flat">
                                            No Topic</v-btn>
                                    </td>
                                </tr>
                            </tbody>
                        </v-table>
                    </v-card-item>
                </transition>

                <!-- Dialog to display dataset metadata -->
                <v-dialog v-model="featureDialog" transition="scroll-y-transition" class="max-dataset-width max-dataset-height">
                    <v-card class="overflow-hidden">
                        <v-toolbar :title="selectedItem.title" color="#003DA5">
                            <v-btn icon="mdi-close" variant="text" @click="featureDialog = false" />
                        </v-toolbar>
                        <div class="scrollable-table">
                            <v-container class="pa-8">
                                <bbox-view :coordinates="selectedItem.coordinates" height="16rem" id="map"></bbox-view>
                            </v-container>
                            <v-table class="px-4">
                                <tbody>
                                    <tr v-for="([key, value], _) in filteredFeatures">
                                        <td class="feature-column"><b>{{ formatKey(key) }}</b></td>
                                        <td>{{ formatValue(value) }}</td>
                                    </tr>
                                </tbody>
                            </v-table>
                        </div>
                        <v-card-actions>
                            <v-row>
                                <v-col cols="12">
                                    <v-btn color="#E09D00" append-icon="mdi-code-json" variant="flat" block
                                        @click="openJSON(selectedItem.identifier, selectedItem.title)"
                                        :loading="loadingJsonBoolean">
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
            </v-card>
        </v-col>
    </v-row>
</template>

<script>
import { defineComponent, ref, computed, watch, onMounted } from 'vue';
import { VCard, VCardTitle, VCardText, VCardItem, VForm, VBtn, VListGroup, VSelect, VTextField, VTable, VDatePicker, VDivider } from 'vuetify/lib/components/index.mjs';
import { useDisplay } from 'vuetify';

// Sub-components
import SearchBar from '@/components/sub-components/SearchBar.vue';
import BboxView from "@/components/sub-components/BboxView.vue";

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
        VTable,
        VDatePicker,
        VDivider,
        SearchBar,
        BboxView
    },
    setup() {
        // Deep clone function to avoid reference issues between model and default model
        function deepClone(obj) {
            return JSON.parse(JSON.stringify(obj));
        };

        // Static variables
        const catalogueList = [
            { title: 'Meteorological Service of Canada', url: 'https://wis2-gdc.weather.gc.ca/collections/wis2-discovery-metadata/items' },
            { title: 'China Meteorological Administration', url: 'https://gdc.wis.cma.cn/api/collections/wis2-discovery-metadata/items' }
        ];
        const limitOptions = [10, 100, 500, 1000];

        // Breakpoints
        const { mdAndUp } = useDisplay();

        // Reactive variables

        // Scroll
        const offsetTop = ref(0);

        // Catalogue query variables
        const selectedCatalogue = ref('');
        const limit = ref(10);
        const query = ref(null);
        const dateOrder = ref(null);
        const filterByTopic = ref(false);

        // Dataset information
        const datasets = ref([]);
        const loadingBoolean = ref(false);
        const tableBoolean = ref(false);
        const addAllTopics = ref(false);
        const selectedItem = ref(null);
        const featureDialog = ref(false);
        const formattedJson = ref(null);
        const loadingJsonBoolean = ref(false);
        const jsonDialog = ref(false);

        // Information from Subscribe page
        const serverLink = ref('');
        const token = ref('');
        const connectedToDownloader = ref(false);
        const activeTopics = ref([]);
        const pendingTopics = ref([]);

        // Error from the catalogue
        const errorTitle = ref('');
        const errorMessage = ref('');
        const showErrorDialog = ref(false);

        // Computed properties

        // Stored settings from Subscribe page
        const settings = computed(() => {
            return {
                serverLink: serverLink.value,
                token: token.value,
                connectedToDownloader: connectedToDownloader.value,
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

        // Items to display in the table, depending on the date ordering and topic filter
        const filteredDatasets = computed(() => {
            // Date ordering
            if (dateOrder.value === 'Latest') {
                datasets.value.sort((a, b) => {
                    return new Date(b.creation_date) - new Date(a.creation_date);
                });
            }
            else if (dateOrder.value === 'Oldest') {
                datasets.value.sort((a, b) => {
                    return new Date(a.creation_date) - new Date(b.creation_date);
                });
            }
            
            // Topic filter
            if (filterByTopic.value) {
                return datasets.value.filter(item => item.topic_hierarchy);
            }

            return datasets.value;
        });

        // Features to display in the dataset metadata dialog
        const filteredFeatures = computed(() => {
            return Object.entries(selectedItem.value || {}).filter(([key, _]) => key !== 'title' && key !== 'coordinates');
        });

        // Methods

        // Scroll to top button
        const onScroll = (e) => {
            offsetTop.value = e.target.scrollTop;
        };
        const toTop = () => {
            const element = document.getElementById("top-banner");
            element.scrollIntoView({ block: 'end', behavior: 'smooth' });
        };

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
                serverLink.value = storedSettings?.serverLink || 'http://localhost:5050';
                token.value = storedSettings?.token || '';
                connectedToDownloader.value = storedSettings?.connectedToDownloader || false;
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
                const response = await fetch(`${url}?f=json&${params}`);
                if (!response.ok) {
                    const readableError = HTTP_CODES[response.status] || response.statusText;
                    throw new Error(`There was an error connecting to the catalogue: ${readableError}`);
                }
                return await response.json();
            } catch (error) {
                throw new Error(error.message);
            }
        };

        // Helper function to capitalise the first letter of a string
        const capitalizeFirstLetter = (s) => {
            if (typeof s !== 'string') return '';
            return s.charAt(0).toUpperCase() + s.slice(1);
        };

        // Helper function to find topic - the string starting with 'cache/'
        // or 'origin/' that has href starting with 'mqtt'
        const findTopic = (links) => {
            if (!links) {
                return null;
            }

            for (const link of links || []) {
                if (link.href.startsWith('mqtt')) {
                    for (const key in link) {
                        if (link[key].startsWith('cache/') || link[key].startsWith('origin/')) {
                            return link[key];
                        }
                    }
                }
            }
        }

        // Search the catalogue
        const searchCatalogue = async () => {
            // Enable the button loading animation
            loadingBoolean.value = true;

            // Query the catalogue with the selected parameters
            const params = new URLSearchParams();

            params.append('limit', limit.value)

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
                let centre_id = null;

                // Get the center ID from the identifier,
                // depending on the structure of the identifier
                const identifier = properties?.identifier

                if (identifier) {
                    if (identifier.includes(':')) {
                        const tokens = identifier.split(':');
                        centre_id = tokens.length < 5 ? tokens[1] : tokens[3];
                    }

                    else {
                        const tokens = identifier.split('.');
                        centre_id = tokens[1];
                    }
                }

                let data_policy;
                if (properties?.['wmo:dataPolicy']) {
                    data_policy = capitalizeFirstLetter(properties['wmo:dataPolicy']);
                }

                // Earth system discipline is the id item of concept whose scheme is
                // "https://codes.wmo.int/wis/topic-hierarchy/earth-system-discipline"
                let discipline;
                if (properties?.themes) {
                    const earthSystemDiscipline = properties.themes.find(theme => theme.scheme === 'https://codes.wmo.int/wis/topic-hierarchy/earth-system-discipline');
                    if (earthSystemDiscipline) {
                        discipline = earthSystemDiscipline.concepts[0]?.id;
                        discipline = capitalizeFirstLetter(discipline);
                    }
                }

                return {
                    identifier: identifier,
                    centre_identifier: centre_id,
                    title: properties?.title,
                    country: properties.contacts?.[0]?.addresses?.[0]?.country,
                    creation_date: properties?.created,
                    last_metadata_update: properties?.updated,
                    topic_hierarchy: findTopic(item.links),
                    data_policy: data_policy,
                    keywords: properties?.keywords?.join(', '),
                    earth_system_discipline: discipline,
                    description: properties.description,
                    coordinates: item.geometry?.coordinates[0]
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
            featureDialog.value = true;
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

        // Format the value of this key to show 'N/A' if it is null
        const formatValue = (value) => {
            return value ? value : 'N/A';
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
        const addTopicToPending = (item, addingAllTopics) => {
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
            // If the user has pressed the 'Add All' button, prevent confusion
            // by not displaying the error message
            if (isDuplicate && !addingAllTopics) {
                handleError('Error Adding Topic', 'The topic has already been added to subscription');
                return;
            }

            const updatedTopics = [...pendingTopics.value, toAdd];
            pendingTopics.value = updatedTopics;
        }

        // When the user clicks 'Remove dataset from subscription', remove
        // the associated topic from the array which will be parsed to the Electron API
        const removeTopicFromPending = (topicToRemove) => {
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
            updatedTopics = updatedTopics.filter(item => item.topic !== topicToRemove);
            pendingTopics.value = updatedTopics;
        };

        // Toggles the selection of all topics
        const addOrRemoveAllTopics = async (items, shouldSelectAll) => {
            const addingAllTopics = true;

            if (shouldSelectAll === true) {
                for (const item of items) {
                    addTopicToPending(item, addingAllTopics);
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
            limitOptions,
            mdAndUp,

            // Reactive variables
            offsetTop,
            selectedCatalogue,
            query,
            limit,
            dateOrder,
            filterByTopic,
            datasets,
            loadingBoolean,
            tableBoolean,
            addAllTopics,
            selectedItem,
            featureDialog,
            formattedJson,
            loadingJsonBoolean,
            jsonDialog,
            connectedToDownloader,
            activeTopics,
            pendingTopics,
            errorTitle,
            errorMessage,
            showErrorDialog,

            // Computed variables
            catalogueBoolean,
            selectedTopics,
            filteredDatasets,
            filteredFeatures,

            // Methods
            onScroll,
            toTop,
            searchCatalogue,
            openDialog,
            formatKey,
            formatValue,
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
    width: 85%;
}

.title-section {
    font-size: 1rem;
}

.policy-section {
    margin-left: 0.5rem;
    color: #888;
}

.keywords-section {
    margin-top: 0.5rem;
    font-size: 0.75rem;
    color: #555;
    font-style: italic;
}

.country-section {
    margin-top: 0.5rem;
    font-size: 0.75rem;
    color: #555;
}

.date-section {
    margin-top: 0.5rem;
    font-size: 0.75rem;
    color: #555;
}

.description-section {
    margin-top: 0.5rem;
    font-size: 0.75rem;
    color: #888;
}

.feature-column {
    width: 15%
}

.scrollable-table {
    max-height: 50rem;
    overflow-y: auto;
}

.scrollable-results {
    max-height: 60vh;
    overflow-y: auto;
}

.overlay-container {
  position: relative;
  height: 0vh;
  display: flex;
  justify-content: center;
}

.overlay-button {
    position: fixed;
    z-index: 10;
}
</style>