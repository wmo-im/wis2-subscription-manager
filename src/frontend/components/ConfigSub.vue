<template>
    <v-row class="justify-center">
        <v-col cols=12 class="max-form-width">
            <v-card>
                <v-row dense>
                    <v-col cols="auto">
                        <v-card-title class="big-title">WIS2 Subscription Configuration</v-card-title>
                    </v-col>
                    <v-spacer />
                    <v-col cols="4">
                        <v-select label="Configurations" density="comfortable" variant="solo-filled" class="mx-3"
                            :items="configList" v-model="selectedConfig"></v-select>
                    </v-col>
                    <v-col cols="1">
                        <v-btn color="#003DA5" variant="flat" icon="mdi-delete" class="mx-1" @click="configDialog = true" />
                    </v-col>
                </v-row>

                <!-- Configuration deletion dialog -->
                <v-dialog v-model="configDialog" max-width="300px">
                    <v-card>
                        <v-toolbar title="Delete Configurations" color="#003DA5">
                            <v-btn icon="mdi-close" variant="text" @click="configDialog = false" />
                        </v-toolbar>
                        <v-card-text>
                            <div v-if="configList.length === 0">No configurations to delete</div>
                            <v-checkbox v-for="(config, index) in configList" :key="index" :label="config" :value="config"
                                color="#E09D00" @change="handleCheckboxes(config)" />
                        </v-card-text>
                        <v-card-actions>
                            <v-btn @click="deleteConfigs" color="#E09D00" variant="flat" block
                                :loading="deleteLoadingBoolean">Delete Configurations</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>

                <v-form>
                    <v-card-item class="py-0">
                        <v-card-title>Global broker</v-card-title>
                        <v-row>
                            <v-col cols="11">
                                <v-select label="Please choose a broker" :items="brokerList" item-title="title"
                                    item-value="url" variant="solo-filled" v-model="selectedBroker"
                                    :disabled="syncLoadingBoolean"></v-select>
                            </v-col>
                            <v-col cols="1">
                                <v-btn color="#003DA5" variant="flat" icon="mdi-sync" size="large" @click="syncBrokers"
                                    :loading="syncLoadingBoolean"></v-btn>
                            </v-col>
                        </v-row>
                    </v-card-item>

                    <v-card-item class="py-0">
                        <v-card-title>Topics</v-card-title>
                        <v-row>
                            <v-col cols="11">
                                <v-text-field label="Please enter one or more topics" variant="solo-filled"
                                    v-model="topicEntry" @keyup.enter="addTopic" :disabled="!isBrokerSelected">
                                </v-text-field>
                            </v-col>
                            <v-col cols="1">
                                <v-btn color="#003DA5" variant="flat" icon="mdi-plus" size="large" @click="addTopic"
                                    :disabled="!isBrokerSelected"></v-btn>
                            </v-col>
                        </v-row>

                        <v-chip-group>
                            <v-chip v-for="(topic, index) in topicsList" closable :key="index"
                                @click:close="removeTopic(index)">
                                {{ topic }}
                            </v-chip>
                        </v-chip-group>
                    </v-card-item>

                    <v-card-item class="py-4">
                        <v-row align="center" class="ma-1">
                            <v-card-title>Download data</v-card-title>
                        </v-row>
                        <v-row align="center">
                            <v-col cols="auto">
                                <v-btn prepend-icon="mdi-folder-download" color="#003DA5" variant="flat"
                                    :disabled="!isBrokerSelected" @click="selectDirectory">Select a
                                    folder</v-btn>
                            </v-col>
                            <v-col cols="auto">
                                <v-chip label v-if="selectedDirectory">{{ truncatedDirectory }}</v-chip>
                            </v-col>
                        </v-row>
                    </v-card-item>


                    <v-card-item>
                        <div class="d-flex justify-center">
                            <!-- Save configuration button -->
                            <v-btn @click="showSaveDialog = true" :disabled="!canSubscribe" color="#64BF40" variant="flat"
                                class="ma-1" block>
                                Save Configuration</v-btn>
                        </div>
                        <div class="d-flex justify-center">

                            <!-- Subscribe/Unsubscribe buttons -->
                            <v-btn v-if="!subscribePressed" :disabled="!canSubscribe" @click="toggleSubscription"
                                color="#003DA5" variant="flat" class="ma-1" block>Subscribe</v-btn>
                            <v-btn v-if="subscribePressed" @click="toggleSubscription" color="#E09D00" variant="flat"
                                class="ma-1" block>Cancel Subscription</v-btn>
                        </div>
                    </v-card-item>
                </v-form>

                <!-- Dialog for saving configuration, appears when 'Save Configuration' clicked -->
                <v-dialog v-model="showSaveDialog" max-width="750px">
                    <v-card>
                        <v-card-title>
                            Save Configuration
                            <v-btn icon="mdi-close" variant="text" class="close-button" @click="showSaveDialog = false" />
                        </v-card-title>
                        <v-text-field v-model="configName" label="Configuration Name"></v-text-field>
                        <v-card-actions>
                            <v-btn @click="saveConfiguration" color="#64BF40" variant="flat" block>Save As Preset</v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
            </v-card>
        </v-col>
    </v-row>

    <v-row class="justify-center">
        <v-col cols="12" class="max-form-width">
            <v-card>
                <v-card-title class="big-title">
                    Notifications
                </v-card-title>
                <v-card-item>
                    <v-card variant="tonal">
                        <v-container class="backend-output">
                            {{ backendOutput }}
                            <!-- Empty div to scroll to the bottom -->
                            <div ref="latestResponse"></div>
                        </v-container>
                    </v-card>
                </v-card-item>
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

        // Reactive variables
        const configDialog = ref(false);
        const deleteLoadingBoolean = ref(false);
        const brokerList = ref([]);
        const syncLoadingBoolean = ref(false);
        const selectedBroker = ref('');
        const topicEntry = ref('')
        const topicsList = ref([]);
        const selectedDirectory = ref('');
        const subscribePressed = ref(false);
        const backendOutput = ref('');
        const latestResponse = ref(null);
        const selectedConfig = ref(null);
        const configList = ref([]);
        const showSaveDialog = ref(false);
        const configName = ref('');
        const configsToDelete = ref([]);

        // Computed

        // Checks if the global broker has been selected
        const isBrokerSelected = computed(() => {
            return selectedBroker.value !== ''
        });

        // Checks if the global broker has been selected and at
        // least one topic has been added
        const canSubscribe = computed(() => {
            return isBrokerSelected.value && topicsList.value.length > 0 && selectedDirectory.value !== '';
        });

        // Truncates the selected folder directory if it is too long
        const truncatedDirectory = computed(() => {
            const maxPathLength = 30;
            if (selectedDirectory.value.length > maxPathLength) {
                return '...' + selectedDirectory.value.slice(-maxPathLength);
            }
            // If the selected directory is less than 30 characters, leave as is
            return selectedDirectory.value;
        });

        // Methods

        // Load the list of saved configurations
        const loadConfigNames = async () => {
            try {
                const configs = await window.electronAPI.loadConfigNames();
                configList.value = configs;
            }
            catch (error) {
                console.error('Error loading config list: ', error);
            }
        };

        // Adds or removes configurations to delete
        const handleCheckboxes = (config) => {
            if (configsToDelete.value.includes(config)) {
                // Remove it if it's already there
                configsToDelete.value.splice(configsToDelete.value.indexOf(config), 1);
            }
            else {
                // If it's not there, add it
                configsToDelete.value.push(config);
            }
        };

        // Deletes this configurations selected in the dialog
        const deleteConfigs = async () => {
            try {
                // Enable loading animation of button
                deleteLoadingBoolean.value = true;
                // Send array of configs to delete to backend
                await window.electronAPI.deleteConfigs(Array.from(configsToDelete.value));
                // Reload the list of configurations after a short delay
                setTimeout(() => {
                    loadConfigNames();
                    // Close the dialog
                    configDialog.value = false;
                    // Disable loading animation of button
                    deleteLoadingBoolean.value = false;
                    // Clear the list of configs to delete
                    configsToDelete.value = [];
                }, 1000);
            }
            catch (error) {
                console.error('Error deleting configurations: ', error);
            }
        };

        // Load the list of brokers from the JSON file when application is started
        const loadBrokers = async () => {
            try {
                const data = await window.electronAPI.loadBrokers();
                brokerList.value = data;
            }
            catch (error) {
                console.error('Error loading brokers: ', error);
            }
        };

        // Get the latest list of brokers for the Canada GDC API
        const syncBrokers = async () => {
            try {
                // Set loading animation to true
                syncLoadingBoolean.value = true;

                // Query the catalogue
                const CANADA_GDC_API = "https://api.weather.gc.ca/collections/wis2-discovery-metadata/items"
                const response = await fetch(CANADA_GDC_API);
                if (!response.ok) {
                    throw new Error('Failed to query catalogue')
                }
                const items = await response.json();
                const firstFeature = items.features[0];

                if (firstFeature) {
                    // Initialise array for broker URLs and titles
                    const brokerList = [];
                    let brokerURL = '';
                    let brokerTitle = '';

                    // In the links where the rel is 'items', the href starts with 'mqtt',
                    // and the channel starts with 'cache', the global broker URLs can be found
                    // in the the href after the 'mqtt://every.everyone@' part and before
                    // the ':8883' part, and the global broker titles can be found
                    // in the title after the 'Notifications from ' part
                    firstFeature.links.forEach(link => {
                        if (link.rel === 'items' && link.href.startsWith('mqtt') && link.channel.startsWith('cache')) {
                            brokerURL = link.href.split('@')[1].split(':')[0];
                            if (link.title) {
                                brokerTitle = link.title.split('Notifications from ')[1];
                            }
                            else {
                                brokerTitle = brokerURL;
                            }
                            brokerList.push({ title: brokerTitle, url: brokerURL });
                        }
                    });
                    // Write it to the JSON file 'backend/brokers.json'
                    window.electronAPI.writeBrokers(brokerList);
                }

                // Delay loading of JSON file to allow time for the backend
                setTimeout(() => {
                    // Load the brokers from the JSON file
                    loadBrokers();
                    // Disable loading animation of button
                    syncLoadingBoolean.value = false;
                }, 1000);
            }
            catch (error) {
                console.error('Error syncing brokers: ', error);
            }
        };

        // Load the topics selected in the GDC page
        const loadTopics = async () => {
            try {
                const topics = await window.electronAPI.loadTopics();
                // Add all topics loaded to the topicsList array
                if (topics.length > 0) {
                    topics.forEach(topic => {
                        // Ensure there are no duplicate topics
                        if (!topicsList.value.includes(topic)) {
                            topicsList.value.push(topic);
                        }
                    });
                }
            }
            catch (error) {
                console.error('Error loading topics: ', error);
            }
        };

        // If the user types a topic and presses +, it will add it to the
        // topic list and reset the text field
        const addTopic = () => {
            if (topicEntry.value.trim() !== '') {
                topicsList.value.push(topicEntry.value);
                topicEntry.value = '';
            }
        };

        // If the user clicks the 'close' button on a pre-entered topic,
        // the topic will be removed from the list
        const removeTopic = (index) => {
            topicsList.value.splice(index, 1);
        };

        // Communicates with the electron API to use the
        // openDialog method, allowing the user to pick a folder
        const selectDirectory = async () => {
            try {
                // Use the method exposed in preload.js
                const path = await window.electronAPI.openDialog();
                if (path) {
                    selectedDirectory.value = path;
                }
            }
            catch (error) {
                console.error('Error selecting directory:', error);
            }
        };

        // Saves the configuration settings to a local JSON file
        const saveConfiguration = () => {
            try {
                const name = configName.value;

                const data = {
                    brokerURL: selectedBroker.value,
                    topicsList: Array.from(topicsList.value), // Convert Proxy to regular array
                    selectedDirectory: selectedDirectory.value
                };

                // Write to file named by user
                window.electronAPI.saveConfig(name, data);

                // Check if the config name already exists in the list,
                // if not, add it
                if (!configList.value.includes(name)) {
                    configList.value.push(name);
                };

                // Close the dialog
                showSaveDialog.value = false;
            }

            catch (error) {
                console.error('Error saving config: ', error);
            }
        }

        // Toggles the subscription process depending on whether the user
        // intends to start a subscription or cancel a subscription
        const toggleSubscription = () => {
            // When subscribe/cancel button pressed, change boolean state
            subscribePressed.value = !subscribePressed.value;

            try {
                // Construct data to be sent
                const data = {
                    broker: selectedBroker.value,
                    topics: Array.from(topicsList.value), // Convert Proxy to regular array
                    downloadDirectory: selectedDirectory.value,
                    shouldSubscribe: subscribePressed.value
                };

                console.log('Data sent to backend: ', data)

                // Start or kill backend process
                window.electronAPI.handleSubscription(data);
            }
            catch (error) {
                console.error('Error subscribing: ', error);
                backendOutput.value = 'Error occurred with backend subscriber';
            }
        };

        // Start listeners of standard out and error from the 
        // backend process

        const handleBackendStatus = (event, response) => {
            console.log('Backend response:', response);
            backendOutput.value += "\n" + response.status + "\n";
        };

        const handleStdout = (event, message) => {
            backendOutput.value += "\n" + message + "\n";
        };

        const handleStderr = (event, message) => {
            backendOutput.value += "\n" + message + "\n";
        };

        onMounted(() => {
            // Get topics list
            loadTopics();
            // Get config list
            loadConfigNames();
            // Get broker list
            loadBrokers();
            // Get responses from backend to be displayed in frontend
            window.electronAPI.onSubscriptionResponse(handleBackendStatus);
            window.electronAPI.onBackendStdout(handleStdout);
            window.electronAPI.onBackendStderr(handleStderr);
        });

        // Watch for changes in selectedConfig and update the UI
        watch(selectedConfig, async () => {
            if (selectedConfig.value) {
                // Get the config data from the file
                const configData = await window.electronAPI.loadConfig(selectedConfig.value);

                // Log the config data obtained
                console.log('Config data obtained: ', configData);

                // Update the UI

                selectedBroker.value = configData.brokerURL;
                topicsList.value = configData.topicsList;
                selectedDirectory.value = configData.selectedDirectory;
            }
        });

        // Watch for changes in backendOutput and scroll to bottom
        watch(backendOutput, () => {
            nextTick(() => {
                if (latestResponse.value) {
                    latestResponse.value.scrollIntoView();
                }
                // Trim excess newline from backendOutput
                backendOutput.value = backendOutput.value.trim();
            });
        });

        // Clean up listeners
        onUnmounted(() => {
            window.electronAPI.removeListener('subscription-response',
                handleBackendStatus);
            window.electronAPI.removeListener('backend-stdout',
                handleStdout);
            window.electronAPI.removeListener('backend-stderr',
                handleStderr);
        });

        return {
            brokerList,
            syncLoadingBoolean,
            selectedBroker,
            topicEntry,
            topicsList,
            selectedDirectory,
            isBrokerSelected,
            canSubscribe,
            truncatedDirectory,
            addTopic,
            removeTopic,
            selectDirectory,
            subscribePressed,
            backendOutput,
            latestResponse,
            toggleSubscription,
            selectedConfig,
            configList,
            configDialog,
            showSaveDialog,
            saveConfiguration,
            configName,
            loadBrokers,
            syncBrokers,
            configsToDelete,
            handleCheckboxes,
            deleteConfigs,
            deleteLoadingBoolean
        }
    }
})

</script>

<style scoped>
.backend-output {
    max-height: 200px;
    /* Adjust as needed */
    overflow-y: auto;
    white-space: pre-wrap;
    /* To respect line breaks and spaces */
}
</style>