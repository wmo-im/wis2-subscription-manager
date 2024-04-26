<template>
    <v-row class="justify-center">
        <v-col cols=12 class="max-form-width">
            <v-card min-height="88vh">
                <v-toolbar>
                    <v-toolbar-title class="big-title">WIS2 Subscription Dashboard</v-toolbar-title>
                    <v-toolbar-items class="sync-time pa-5">
                        <transition name="fade-transition">
                            <p v-if="connectionStatus">Last synchronized: <b>{{ lastSyncTime }}</b></p>
                        </transition>
                    </v-toolbar-items>
                </v-toolbar>

                <v-col cols="12" />

                <v-row>
                    <v-col cols="12">
                        <v-card-title>Downloader Server Information</v-card-title>
                        <v-card-subtitle>Enter your server information to get started</v-card-subtitle>
                        <v-card-text>
                            <v-row>
                                <v-col cols="3">
                                    <v-text-field v-model="host" label="Server Host"
                                        :disabled="connectionStatus"></v-text-field>
                                </v-col>
                                <v-col cols="2">
                                    <v-text-field v-model="port" label="Server Port"
                                        :disabled="connectionStatus"></v-text-field>
                                </v-col>
                                <v-col cols="2">
                                    <v-text-field v-model="username" label="Username"
                                        :disabled="connectionStatus"></v-text-field>
                                </v-col>
                                <v-col cols="2">
                                    <v-text-field v-model="password" label="Password"
                                        :disabled="connectionStatus"></v-text-field>
                                </v-col>
                                <v-col cols="3">
                                    <!-- Before connecting -->
                                    <v-btn v-if="!connectionStatus" color="#003DA5" size="x-large" block
                                        append-icon="mdi-link" @click="getServerData"
                                        :loading="connectingToServer">Connect</v-btn>

                                    <!-- After connecting -->
                                    <v-row v-if="connectionStatus" dense>
                                        <v-col cols="5">
                                            <v-btn color="#00ABC9" :size="lgAndUp ? 'x-large' : 'large'" block
                                                append-icon="mdi-sync" @click="getServerData"
                                                :loading="connectingToServer">Sync</v-btn>
                                        </v-col>
                                        <v-col cols="7">
                                            <v-btn color="#E09D00" :size="lgAndUp ? 'x-large' : 'large'" block
                                                append-icon="mdi-link-off" @click="clearServerData"
                                                :loading="connectingToServer">Disconnect</v-btn>
                                        </v-col>
                                    </v-row>
                                </v-col>
                            </v-row>
                        </v-card-text>
                    </v-col>
                </v-row>

                <v-col cols="12" />

                <transition name="slide-y-transition">
                    <v-card-item v-if="connectionStatus">
                        <v-divider class="pa-3" />

                        <v-row>
                            <v-col cols="12">
                                <v-card-title>Currently Subscribed Topics</v-card-title>
                                <v-card-subtitle>Topics actively subscribed to by the downloader</v-card-subtitle>
                                <v-card-item>
                                    <v-table :hover="true">
                                        <thead>
                                            <tr>
                                                <th scope="row" class="topic-column">
                                                    <p v-if="activeTopics.length > 0" class="medium-title">Topic</p>
                                                    <p v-else class="medium-title text-center">No topics are currently
                                                        active
                                                    </p>
                                                </th>
                                                <th scope="row" class="directory-column">
                                                    <p v-if="activeTopics.length > 0" class="medium-title text-center">
                                                        Sub-Directory
                                                    </p>
                                                </th>
                                                <th scope="row" class="button-column">
                                                    <p v-if="activeTopics.length > 0" class="medium-title text-center">
                                                        Actions</p>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="item in activeTopics" :key="item.topic"
                                                @click="configureTopic(item)" class="clickable-row">
                                                <td class="small-title">
                                                    {{ item.topic }}
                                                </td>
                                                <td class="small-title text-center">
                                                    {{ item.target }}
                                                </td>
                                                <td class="text-center">
                                                    <v-btn class="mr-5" append-icon="mdi-chart-box" color="#00ABC9"
                                                        variant="flat" @click.stop="monitorTopic(item.topic)">
                                                        Monitor
                                                    </v-btn>
                                                    {{ topicMetrics }}
                                                    <v-btn append-icon="mdi-delete" color="error" variant="flat"
                                                        @click.stop="confirmRemoval(item.topic, 'active')">Remove</v-btn>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </v-table>
                                </v-card-item>
                            </v-col>
                        </v-row>

                        <v-col cols="12" />
                        <v-divider class="py-3" />

                        <v-row>
                            <v-col cols="12">
                                <v-card-title>Topics To Add</v-card-title>
                                <v-card-subtitle>Pending topics that aren't currently subscribed to by the
                                    downloader</v-card-subtitle>

                                <v-card-item>
                                    <v-table :hover="true">
                                        <thead>
                                            <tr>
                                                <th scope="row" class="topic-column">
                                                    <p v-if="pendingTopics.length > 0" class="medium-title">Topic</p>
                                                    <p v-else class="medium-title text-center">No topics have been added
                                                    </p>
                                                </th>
                                                <th scope="row" class="directory-column">
                                                    <p v-if="pendingTopics.length > 0" class="medium-title text-center">
                                                        Sub-Directory</p>
                                                </th>
                                                <th scope="row" class="button-column">
                                                    <p v-if="pendingTopics.length > 0" class="medium-title text-center">
                                                        Actions
                                                    </p>
                                                    <v-btn v-else block color="#64BF40" append-icon="mdi-plus"
                                                        @click="configureTopic()">Add A
                                                        Topic</v-btn>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="item in pendingTopics" :key="item.topic"
                                                @click="configureTopic(item)" class="clickable-row">
                                                <td class="small-title">
                                                    {{ item.topic }}
                                                </td>
                                                <td class="small-title text-center">
                                                    {{ item.target }}
                                                </td>
                                                <td class="text-center">
                                                    <v-btn class="mr-5" append-icon="mdi-cloud-upload" color="#003DA5"
                                                        variant="flat" @click.stop="addToSubscription(item)"
                                                        :loading="makingServerRequest[item.topic]">
                                                        Activate
                                                    </v-btn>
                                                    <v-btn append-icon="mdi-delete" color="error" variant="flat"
                                                        @click.stop="confirmRemoval(item.topic, 'pending')">Remove</v-btn>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </v-table>
                                    <v-col />

                                    <v-col cols="12">
                                        <v-row>
                                            <v-col cols="6">
                                                <v-btn v-if="pendingTopics.length > 0" block color="#64BF40"
                                                    append-icon="mdi-plus" @click="configureTopic()">Add A
                                                    New Topic</v-btn>
                                            </v-col>
                                            <v-col cols="6">
                                                <v-btn v-if="pendingTopics.length > 0" block color="#003DA5"
                                                    append-icon="mdi-expand-all"
                                                    @click="addAllToSubscription()">Activate All</v-btn>
                                            </v-col>
                                        </v-row>
                                    </v-col>
                                </v-card-item>
                            </v-col>
                        </v-row>
                    </v-card-item>
                </transition>
            </v-card>
        </v-col>
    </v-row>

    <!-- Dialogs -->

    <!-- Shows the topic/target information to be edited -->
    <v-dialog v-model="showTopicConfigDialog" class="max-dialog-width" transition="slide-y-transition">
        <v-card>
            <v-toolbar :title="topicDialogTitle" color="#003DA5">
                <v-btn icon="mdi-close" variant="text" size="small" @click="showTopicConfigDialog = false" />
            </v-toolbar>
            <v-container>
                <v-form @submit.prevent="saveTopic">
                    <v-col cols="12">
                        <v-row>
                            <v-col cols="12">

                                <!-- If active topic -->
                                <v-row v-if="topicFound(topicToAdd, activeTopics)" class="pb-5">
                                    <v-col cols="2">
                                        <p class="medium-title"><b>Topic:</b></p>
                                    </v-col>
                                    <v-col cols="10">
                                        <p class="medium-title">{{ topicToAdd }}</p>
                                    </v-col>
                                </v-row>

                                <v-divider />

                                <v-row v-if="topicFound(topicToAdd, activeTopics)" class="pt-5">
                                    <v-col cols="2">
                                        <p class="medium-title"><b>Target:</b></p>
                                    </v-col>
                                    <v-col cols="8">
                                        <!-- Target switches between read-only and editable -->
                                        <p v-if="!editActiveTarget" class="medium-title">{{ targetToAdd }}</p>
                                        <v-text-field v-else v-model="targetToAdd" density="comfortable"
                                            variant="outlined" clearable :rules="[rules.required, rules.target]" />
                                    </v-col>
                                    <v-col cols="2">
                                        <v-btn v-if="!editActiveTarget" variant="flat" color="#E09D00" block
                                            size="large" @click.stop="editActiveTarget = true">Edit</v-btn>
                                        <v-btn v-if="editActiveTarget" variant="flat" color="#00ABC9" block size="large"
                                            @click.stop="editActiveTarget = false">Confirm</v-btn>
                                    </v-col>
                                </v-row>

                                <!-- If pending topic -->
                                <v-text-field v-if="!topicFound(topicToAdd, activeTopics)" v-model="topicToAdd"
                                    label="Topic" :rules="[rules.required, rules.topic]" />
                            </v-col>
                        </v-row>

                        <v-row>
                            <v-col cols="12">
                                <v-text-field v-if="!topicFound(topicToAdd, activeTopics)" v-model="targetToAdd"
                                    label="Associated Sub-Directory" :rules="[rules.required, rules.target]" />
                            </v-col>
                        </v-row>

                        <v-row>
                            <v-col cols="12">
                                <!-- If an active target is being edited, you can't save -->
                                <v-btn :disabled="editActiveTarget" type="submit" color="#003DA5" variant="flat" block
                                    @click="saveTopic" :loading="makingServerRequest[topicToAdd]">Save</v-btn>
                            </v-col>
                        </v-row>
                    </v-col>
                </v-form>
            </v-container>
        </v-card>
    </v-dialog>

    <!-- Confirm removal of topic -->
    <v-dialog v-model="showRemoveWarningDialog" class="max-dialog-width">
        <v-card>
            <v-toolbar title="Confirm Action" color="error">
                <v-btn icon="mdi-close" variant="text" size="small" @click="showRemoveWarningDialog = false" />
            </v-toolbar>
            <v-card-text>
                <p>Are you sure that you want to remove the topic:</p>
                <br>
                <p class="medium-title text-center">{{ topicToRemove }}</p>
                <br>
                <p>{{ removalMessage }}</p>
            </v-card-text>
            <v-card-actions>
                <v-col cols="6">
                    <!-- Pending topic 'Yes' button -->
                    <v-btn v-if="topicFound(topicToRemove, pendingTopics)" color="error" variant="flat" block
                        @click="removeTopicFromPending">Yes</v-btn>
                    <!-- Active topic 'Yes' button -->
                    <v-btn v-if="topicFound(topicToRemove, activeTopics)" color="error" variant="flat" block
                        @click="removeFromSubscription(topicToRemove)"
                        :loading="makingServerRequest[topicToRemove]">Yes</v-btn>
                </v-col>
                <v-col cols="6">
                    <v-btn color="black" variant="flat" block @click="showRemoveWarningDialog = false">No</v-btn>
                </v-col>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <!-- Error dialogs when something goes wrong connecting to the server, etc. -->
    <v-dialog v-model="showErrorDialog" class="max-error-width">
        <v-card>
            <v-toolbar :title="errorTitle" color="error">
                <v-btn icon="mdi-close" variant="text" size="small" @click="showErrorDialog = false" />
            </v-toolbar>
            <v-card-text>
                <p>{{ errorMessage }}</p>
            </v-card-text>
            <v-card-actions>
                <v-col cols="12">
                    <v-btn color="black" variant="flat" block @click="showErrorDialog = false">OK</v-btn>
                </v-col>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import { defineComponent, ref, computed, onMounted, watch } from 'vue';
import { VCard, VCardTitle, VCardText, VCardItem, VForm, VBtn, VListGroup, VSelect, VTextField, VChipGroup, VChip, VCheckboxBtn } from 'vuetify/lib/components/index.mjs';
import { useDisplay } from 'vuetify';

// Utilities
import { HTTP_CODES } from '@/utils/constants.js';
import { topicsIntersect } from '@/utils/topicTools.js';
import { parsePrometheusText } from '@/utils/prometheusTools.js';


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
        // Deep clone function to avoid reference issues between model and default model
        function deepClone(obj) {
            return JSON.parse(JSON.stringify(obj));
        };

        // Static variables
        const rules = {
            required: value => !!value || 'Field is required.',
            topic: value => {
                if (topicFound(value, activeTopics.value) || topicFound(value, pendingTopics.value)) {
                    return 'This topic is already added to or overlaps with an existing topic';
                }
            },
            target: value => {
                // Check if the target is exactly "$TOPIC"
                if (value === "$TOPIC") {
                    return true;
                }
                // Regular expression for whitelisted characters
                const validPattern = /^[A-Za-z0-9/_-]+$/;
                return validPattern.test(value) || 'Invalid target';
            }
        };

        const { mdAndUp, lgAndUp } = useDisplay();

        // Reactive variables

        // Server information
        const host = ref('127.0.0.1');
        const port = ref('8080');
        const username = ref('');
        const password = ref('');
        const connectionStatus = ref(false);

        // The topics (as keys) and their associated targets (as values)
        const activeTopics = ref([]);
        const pendingTopics = ref([]);

        // Download metrics of all topics, file types, etc.
        const metrics = ref({});

        // The topic and associated target to be added/deleted
        const topicToAdd = ref('')
        const targetToAdd = ref('')
        const topicToRemove = ref('');

        // Loading animation when connecting to the server or making requests
        const connectingToServer = ref(false);
        const makingServerRequest = ref({});

        // Last time the frontend was synced with the backend
        const lastSyncTime = ref(new Date().toLocaleTimeString());

        // Topic configuration dialog
        const showTopicConfigDialog = ref(false);
        const topicDialogTitle = ref('Create New Topic');
        const previousTopic = ref('');
        const previousTarget = ref('');
        const editActiveTarget = ref(false);

        // Topic metric monitoring dialog
        const showTopicMonitorDialog = ref(false);
        const topicMetrics = ref({});

        // Warning dialog for removing a topic
        const showRemoveWarningDialog = ref(false);
        const removalMessage = ref('');

        // Error dialog
        const showErrorDialog = ref(false);
        const errorMessage = ref('');
        const errorTitle = ref('');

        // Computed
        const settings = computed(() => {
            return {
                host: host.value,
                port: port.value,
                username: username.value,
                password: password.value,
                connectionStatus: connectionStatus.value,
                activeTopics: activeTopics.value,
                pendingTopics: pendingTopics.value
            }
        });

        // Base URL to use with Flask endpoints (list, add, delete, etc.)
        const serverLink = computed(() => {
            if (port.value === '')
                return `http://${host.value}`;
            else
                return `http://${host.value}:${port.value}`;
        });

        // Methods

        // Load the saved information from the electron API
        const loadSettings = async () => {
            try {
                const storedSettings = await window.electronAPI.loadSettings();
                if (storedSettings) {
                    host.value = storedSettings?.host || '127.0.0.1';
                    port.value = storedSettings?.port || '8080';
                    username.value = storedSettings?.username || '';
                    password.value = storedSettings?.password || '';
                    connectionStatus.value = storedSettings?.connectionStatus || false;
                    activeTopics.value = storedSettings?.activeTopics || [];
                    pendingTopics.value = storedSettings?.pendingTopics || [];
                }
            }
            catch (error) {
                console.error('Error loading stored settings: ', error);
            }
        }

        // Server interaction

        // Processes the data from the /list endpoint to display in the table
        const processTopicData = (data) => {
            const processedData = [];
            for (const topic in data) {
                const target = data[topic].target;

                processedData.push({
                    topic: topic,
                    target: target
                });
            }
            return processedData;
        };

        // Get the topics and their associated targets from the /list endpoint
        const getTopicList = async () => {
            // Build the full URL for listing subscriptions
            const url = `${serverLink.value}/list`;

            try {
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (!response.ok) {
                    // Show a readable error and disconnect
                    const readableError = HTTP_CODES[response.status] || response.statusText;
                    errorMessage.value = `There was a problem getting the subscribed topics: ${readableError}`;
                    errorTitle.value = "Error Listing Topics";
                    showErrorDialog.value = true;
                    connectionStatus.value = false;
                    return;
                }

                const data = await response.json();
                console.log('Server topic data:', data);

                // Process the data before displaying the table
                activeTopics.value = processTopicData(data);

                // Display the table of active/pending topics
                connectionStatus.value = true;
            }
            catch (error) {
                errorMessage.value = `There was a problem connecting to the server (${error}). Please check the server is running and the settings are correct.`;
                errorTitle.value = "Server Error";
                showErrorDialog.value = true;
                connectionStatus.value = false;
            }
        };

        // Get download metrics by querying Prometheus /metrics endpoint
        const getMetrics = async () => {

            // Build the full URL for Prometheus metrics
            const url = `${serverLink.value}/metrics`;

            try {
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    const readableError = HTTP_CODES[response.status] || response.statusText;
                    // Display the error message from server response, if available
                    errorMessage.value = readableError;
                    errorTitle.value = "Error Fetching Metrics";
                    showErrorDialog.value = true;
                    return;
                }

                const data = await response.text();

                // Parse the Prometheus text data into an object
                metrics.value = parsePrometheusText(data);
            }
            catch (error) {
                errorMessage.value = `There was a problem connecting to the server (${error}). Please check the server is running and the settings are correct.`;
                errorTitle.value = "Server Error";
                showErrorDialog.value = true;
            }
        };

        // Get the data from the server, such as topics, their associated
        // targets, and the current status of the server
        const getServerData = async () => {
            // Start the button loading animation
            connectingToServer.value = true;

            // Use various endpoints to get the data
            await getTopicList();
            await getMetrics();

            // If the connection is successful, update the last sync time
            if (connectionStatus.value) {
                lastSyncTime.value = new Date().toLocaleTimeString();
            }

            // Stop the button loading animation
            connectingToServer.value = false;
        };

        // Clear the server data and reset the connection status
        const clearServerData = () => {
            connectionStatus.value = false;
            activeTopics.value = [];
        };

        // Add the topic and target to the downloader using the /add endpoint
        const addToSubscription = async (item) => {
            // Start the button loading animation for this topic
            makingServerRequest.value[item.topic] = true;

            // The topic, in particular the wildcards (+,#), must be URI encoded
            const encodedTopic = encodeURIComponent(item.topic);

            // Build the full URL for adding a subscription
            const url = `${serverLink.value}/add?topic=${encodedTopic}&target=${item.target}`;

            try {
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    const readableError = HTTP_CODES[response.status] || response.statusText;
                    // Display the error message from server response, if available
                    errorMessage.value = errorData.error ? errorData.error : readableError;
                    errorTitle.value = "Error Adding Topic";
                    showErrorDialog.value = true;
                    // End the button loading animation for this topic
                    makingServerRequest.value[item.topic] = false;
                    return;
                }

                topicToRemove.value = item.topic;
                removeTopicFromPending();

                // Update the active topics
                await getTopicList();

                // End the button loading animation for this topic
                makingServerRequest.value[item.topic] = false;
            }
            catch (error) {
                errorMessage.value = `There was a problem connecting to the server (${error}). Please check the server is running and the settings are correct.`;
                errorTitle.value = "Server Error";
                showErrorDialog.value = true;
            }
        };

        const addAllToSubscription = async () => {
            for (const item of pendingTopics.value) {
                await addToSubscription(item);
            }
        };

        const removeFromSubscription = async (topic) => {
            // Start the button loading animation for this topic
            makingServerRequest.value[topic] = true;

            // The topic, in particular the wildcards (+,#), must be URI encoded
            const encodedTopic = encodeURIComponent(topic);

            // Build the full URL for deleting a subscription
            const url = `${serverLink.value}/delete?topic=${encodedTopic}`;

            try {
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    const readableError = HTTP_CODES[response.status] || response.statusText;
                    // Display the error message from server response, if available
                    errorMessage.value = errorData.error ? errorData.error : readableError;
                    errorTitle.value = "Error Removing Topic";
                    showErrorDialog.value = true;
                    // End the button loading animation for this topic
                    makingServerRequest.value[topic] = false;
                    return;
                }

                // Update the active topics
                await getTopicList();

                // Close the warning dialog
                showRemoveWarningDialog.value = false;

                // End the button loading animation for this topic
                makingServerRequest.value[topic] = false;
            }
            catch (error) {
                errorMessage.value = `There was a problem connecting to the server (${error}). Please check the server is running and the settings are correct.`;
                errorTitle.value = "Server Error";
                showErrorDialog.value = true;
            }
        };

        // Local interaction

        // Check if the topic is found in the list of topic items
        const topicFound = (topicToFind, topicList) => {
            return topicList.some(item => topicsIntersect(item.topic, topicToFind));
        };

        const populateFields = (item) => {
            // If item exists, show existing values
            if (item) {
                topicToAdd.value = item.topic;
                targetToAdd.value = item.target;
            }
            // Otherwise show empty fields
            else {
                topicToAdd.value = '';
                targetToAdd.value = '';
            }
        };

        // Configure pending topic and target
        const configureTopic = (item) => {
            showTopicConfigDialog.value = true;

            if (!item) {
                topicDialogTitle.value = 'Create New Topic';
            }
            else {
                topicDialogTitle.value = 'Edit Topic';
            }

            // Save the original plugin name and filetype
            previousTopic.value = item?.topic;
            previousTarget.value = item?.target;

            populateFields(item);
        };

        // Adds or updates the topic, both in the list of active topics and pending topics
        const saveTopic = async () => {
            const isActive = topicFound(topicToAdd.value, activeTopics.value);

            if (isActive) {
                // To update the topic's target, we must first remove it and then add it back
                await removeFromSubscription(topicToAdd.value);

                const updatedItem = {
                    topic: topicToAdd.value,
                    target: targetToAdd.value
                };

                await addToSubscription(updatedItem);
                // Close the dialog
                showTopicConfigDialog.value = false;
                return;
            }

            const isPending = topicFound(previousTopic.value, pendingTopics.value);

            if (isPending) {
                updateTopicInPending();
            } else {
                addTopicToPending();
            }

            // Close the dialog
            showTopicConfigDialog.value = false;
        };

        // Add metric totals (e.g. total downloaded files) to topic metric data
        const getTotal = (data) => {
            Object.keys(data).forEach(metricName => {

                if (typeof data[metricName] !== 'object' || !data[metricName]) {
                    return;
                }

                // Calculate the total for each object-based metric (e.g. downloaded files by type)
                data[metricName]['total'] = Object.values(data[metricName]).reduce(
                    (acc, val) => acc + val, 0);
            })

            return data;
        }

        // Monitor the topic's metrics
        const monitorTopic = (topic) => {
            // Wipe the metrics clean for this topic
            topicMetrics.value = {};

            // Iterate over each metric
            Object.keys(metrics.value).forEach(metricName => {
                const metricData = metrics.value[metricName];

                // Only metric data that's a non-empty object will contain the topic
                if (typeof metricData !== 'object' || !metricData) {
                    return;
                }

                // The topic may have wildcards, so we must aggregate the metric data
                // We do this using 'reduce'
                topicMetrics.value[metricName] = Object.keys(metricData).reduce((acc, topicKey) => {

                    if (!topicsIntersect(topic, topicKey)) {
                        return acc;
                    }

                    const data = metricData[topicKey];

                    // If the data has no other labels, then it will be a number, not an object
                    // e.g. number of failed downloads
                    if (typeof data === 'number' && data) {
                        acc = (acc || 0) + data;
                    }

                    // If the data has other labels, then it will be an object
                    // e.g. number of downloads for each file type
                    else if (typeof data === 'object' && data) {
                        for (const key in data) {
                            acc[key] = (acc[key] || 0) + data[key];
                        }
                    }

                    return acc;
                }, {});
            })

            // Now finally totals to the metrics with additional labels
            // e.g. downloaded files by file type
            topicMetrics.value = getTotal(topicMetrics.value);

            // Display the metrics to the user
            showTopicMonitorDialog.value = true;
        };

        // Update topic and target in the list of pending topics
        const updateTopicInPending = () => {
            const updatedPendingTopics = pendingTopics.value.map(item => {
                if (item.topic === previousTopic.value && item.target === previousTarget.value) {
                    return {
                        topic: topicToAdd.value,
                        target: targetToAdd.value
                    };
                }
                return item;
            });

            pendingTopics.value = updatedPendingTopics;
        };

        // Add a topic and its associated target to the list of pending topics
        const addTopicToPending = () => {

            const toAdd = {
                topic: topicToAdd.value,
                target: targetToAdd.value
            };

            const topicIsDuplicate = topicFound(toAdd.topic, activeTopics.value);

            if (topicIsDuplicate) {
                errorMessage.value = 'Topic is already subscribed to';
                return;
            }

            const updatedTopics = [...pendingTopics.value, toAdd];

            pendingTopics.value = updatedTopics;

            // Clear the input fields
            topicToAdd.value = '';
            targetToAdd.value = '';
        };

        // Remove a topic and its associated target from the list of pending topics
        const removeTopicFromPending = () => {

            const topicCanBeRemoved = topicFound(topicToRemove.value, pendingTopics.value);

            if (!topicCanBeRemoved) {
                console.log(`Topic ${topicToRemove.value} not found in subscription, nothing to remove`);
                return;
            }

            let updatedTopics = [...pendingTopics.value];

            updatedTopics = updatedTopics.filter(item => item.topic !== topicToRemove.value);

            pendingTopics.value = updatedTopics;

            // Close the warning dialog
            showRemoveWarningDialog.value = false;
        };

        // Dialog to confirm deletion of a topic, with associated message depending on
        // whether the topic is pending or active
        const confirmRemoval = (topic, list) => {
            showRemoveWarningDialog.value = true;

            topicToRemove.value = topic;

            if (list === 'pending') {
                removalMessage.value = `This topic is not currently actively subscribed to. It can be easily added back later.`;
            }
            else if (list === 'active') {
                removalMessage.value = `This topic is an active topic. Removing it will stop any real-time data being downloaded from it.`;
            }
        };

        onMounted(() => {
            // Get settings from GDC or previous usage of configuration page
            loadSettings();
            // If the connection is already established, get the topic list every 5 minutes
            if (connectionStatus.value) {
                setInterval(getServerData, 5 * 60 * 1000);
            }
        });

        // Watch for changes in any of the user inputs, so that if they
        // navigate to the Explore page and return, their configuration is not lost
        watch(settings, () => {
            // As reactive objects aren't serialisable, we must deep copy it
            const settingsToStore = deepClone(settings.value);
            console.log("Storing settings:", settingsToStore);
            // Store the information in the electron API
            window.electronAPI.storeSettings(settingsToStore);
        }, { deep: true }); // Use deep watch to track nested array


        return {
            // Static variables
            rules,
            mdAndUp,
            lgAndUp,

            // Reactive variables
            host,
            port,
            username,
            password,
            connectionStatus,
            activeTopics,
            pendingTopics,
            metrics,
            topicToAdd,
            targetToAdd,
            topicToRemove,
            connectingToServer,
            makingServerRequest,
            lastSyncTime,
            showTopicConfigDialog,
            topicDialogTitle,
            editActiveTarget,
            showTopicMonitorDialog,
            topicMetrics,
            showRemoveWarningDialog,
            removalMessage,
            showErrorDialog,
            errorMessage,
            errorTitle,

            // Computed variables
            settings,
            serverLink,

            // Methods
            processTopicData,
            getTopicList,
            getMetrics,
            getServerData,
            clearServerData,
            monitorTopic,
            topicFound,
            configureTopic,
            saveTopic,
            addToSubscription,
            addAllToSubscription,
            removeFromSubscription,
            addTopicToPending,
            removeTopicFromPending,
            confirmRemoval
        }
    }
})

</script>

<style scoped>
.topic-column {
    width: 40%;
}

.directory-column {
    width: 20%;
}

.button-column {
    width: 30%;
}

.small-button-column {
    width: 20%;
}

.sync-time {
    color: #666;
    opacity: 0.75;
    font-size: 1.1em;
}
</style>