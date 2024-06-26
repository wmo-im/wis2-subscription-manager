<template>
    <v-row class="justify-center">
        <v-col cols=12 class="max-form-width">
            <v-card min-height="88vh">
                <v-toolbar>
                    <v-toolbar-title class="big-title">WIS2 Subscription Dashboard</v-toolbar-title>
                    <v-toolbar-items class="sync-time pa-5">
                        <transition name="fade-transition">
                            <p v-if="connectedToDownloader">Last synchronized: <b>{{ lastSyncTime }}</b></p>
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
                                <v-col cols="5">
                                    <v-text-field v-model="serverLink" label="Server URL"
                                        :disabled="connectedToDownloader"></v-text-field>
                                </v-col>
                                <v-col cols="4">
                                    <v-text-field v-model="token" label="API Token"
                                        :disabled="connectedToDownloader"></v-text-field>
                                </v-col>
                                <v-col cols="3">
                                    <!-- Before connecting -->
                                    <v-btn v-if="!connectedToDownloader" color="#003DA5" size="x-large" block
                                        append-icon="mdi-link" @click="getServerData"
                                        :loading="connectingToServer">Connect</v-btn>

                                    <!-- After connecting -->
                                    <v-row v-if="connectedToDownloader" dense>
                                        <template v-if="lgAndUp">
                                            <v-col cols="5">
                                                <v-btn color="#00ABC9" size="x-large" block append-icon="mdi-sync"
                                                    @click="getServerData" :loading="connectingToServer">Sync</v-btn>
                                            </v-col>
                                            <v-col cols="7">
                                                <v-btn color="#E09D00" size="x-large" block append-icon="mdi-link-off"
                                                    @click="clearServerData">Disconnect</v-btn>
                                            </v-col>
                                        </template>
                                        <template v-else>
                                            <v-col cols="12">
                                                <v-btn color="#00ABC9" block append-icon="mdi-sync"
                                                    @click="getServerData" :loading="connectingToServer">Sync</v-btn>
                                            </v-col>
                                            <v-col cols="12">
                                                <v-btn color="#E09D00" block append-icon="mdi-link-off"
                                                    @click="clearServerData">Disconnect</v-btn>
                                            </v-col>
                                        </template>
                                    </v-row>

                                </v-col>
                            </v-row>
                        </v-card-text>
                    </v-col>
                </v-row>

                <v-col cols="12" />

                <transition name="slide-y-transition">
                    <v-card-item v-if="connectedToDownloader">
                        <v-divider class="pa-3" />

                        <v-row>
                            <v-col cols="12">
                                <v-row justify="space-between" align="center">
                                    <v-col cols="8">
                                        <v-card-title>Currently Subscribed Topics</v-card-title>
                                        <v-card-subtitle>Topics actively subscribed to by the
                                            downloader</v-card-subtitle>
                                    </v-col>
                                    <v-col cols="4" class="text-right">
                                        <v-card-title>Queue Size:
                                            <v-chip size="large" class="number">{{ metrics['queue_size'] || 0
                                                }}</v-chip>
                                        </v-card-title>
                                    </v-col>
                                </v-row>
                                <v-card-item>
                                    <v-table :hover="true" class="equal-width">
                                        <thead>
                                            <tr>
                                                <th scope="row">
                                                    <p v-if="activeTopics.length > 0" class="medium-title">Topic</p>
                                                    <p v-else class="medium-title text-center">No topics are currently
                                                        active
                                                    </p>
                                                </th>
                                                <th scope="row">
                                                    <p v-if="activeTopics.length > 0" class="medium-title text-center">
                                                        Sub-Directory
                                                    </p>
                                                </th>
                                                <th scope="row">
                                                    <p v-if="activeTopics.length > 0" class="medium-title text-center">
                                                        Actions</p>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="item in activeTopics" :key="item.topic"
                                                @click="configureTopic('active', item)" class="clickable-row">
                                                <td class="small-title">
                                                    {{ item.topic }}
                                                </td>
                                                <td class="small-title text-center">
                                                    {{ item.target }}
                                                </td>
                                                <td class="text-center">
                                                    <v-btn class="mr-5" :append-icon="lgAndUp ? 'mdi-chart-box' : ''"
                                                        color="#00ABC9" variant="flat"
                                                        @click.stop="monitorTopic(item.topic)">
                                                        <p v-if="mdAndUp">Monitor</p>
                                                        <v-icon v-if="!mdAndUp" icon="mdi-chart-box" />
                                                    </v-btn>
                                                    <v-btn :append-icon="lgAndUp ? 'mdi-delete' : ''" color="error"
                                                        variant="flat"
                                                        @click.stop="confirmRemoval(item.topic, 'active')">
                                                        <p v-if="mdAndUp">Remove</p>
                                                        <v-icon v-if="!mdAndUp" icon="mdi-chart-box" />
                                                    </v-btn>
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
                                    <v-table :hover="true" class="equal-width">
                                        <thead>
                                            <tr>
                                                <th scope="row">
                                                    <p v-if="pendingTopics.length > 0" class="medium-title">Topic</p>
                                                    <p v-else class="medium-title text-center">No topics have been added
                                                    </p>
                                                </th>
                                                <th scope="row">
                                                    <p v-if="pendingTopics.length > 0" class="medium-title text-center">
                                                        Sub-Directory</p>
                                                </th>
                                                <th scope="row">
                                                    <p v-if="pendingTopics.length > 0" class="medium-title text-center">
                                                        Actions
                                                    </p>
                                                    <v-btn v-else block color="#64BF40" append-icon="mdi-plus"
                                                        @click="configureTopic('pending')">Add A
                                                        Topic</v-btn>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="item in pendingTopics" :key="item.topic"
                                                @click="configureTopic('pending', item)" class="clickable-row">
                                                <td class="small-title">
                                                    {{ item.topic }}
                                                </td>
                                                <td class="small-title text-center">
                                                    {{ item.target }}
                                                </td>
                                                <td class="text-center">
                                                    <v-btn class="mr-5" :append-icon="lgAndUp ? 'mdi-cloud-upload' : ''"
                                                        color="#003DA5" variant="flat"
                                                        @click.stop="addToSubscription(item)"
                                                        :loading="makingServerRequest[item.topic]">
                                                        <p v-if="mdAndUp">Activate</p>
                                                        <v-icon v-if="!mdAndUp" icon="mdi-cloud-upload" />
                                                    </v-btn>
                                                    <v-btn :append-icon="lgAndUp ? 'mdi-delete' : ''" color="error"
                                                        variant="flat"
                                                        @click.stop="confirmRemoval(item.topic, 'pending')">
                                                        <p v-if="mdAndUp">Remove</p>
                                                        <v-icon v-if="!mdAndUp" icon="mdi-delete" />
                                                    </v-btn>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </v-table>
                                    <v-col />

                                    <v-col cols="12">
                                        <v-row>
                                            <v-col cols="6">
                                                <v-btn v-if="pendingTopics.length > 0" block color="#64BF40"
                                                    append-icon="mdi-plus" @click="configureTopic('pending')">Add A
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
            <v-sheet class="mx-auto py-5" width="95%">
                <!-- Pending topics -->
                <v-form ref="form" v-if="configuredTopicIsPending">
                    <v-text-field v-model="topicToAdd" label="Topic" :rules="[rules.required, rules.topic]" class="my-2"/>

                    <v-text-field v-model="targetToAdd" label="Associated Sub-Directory"
                        :rules="[rules.required, rules.target]" class="my-2"/>

                    <v-btn type="submit" color="#003DA5" variant="flat" block @click="saveTopic"
                        :loading="makingServerRequest[topicToAdd]" class="mt-2">Save</v-btn>
                </v-form>

                <!-- Active topics -->
                <v-form ref="form" v-if="!configuredTopicIsPending">
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
                            <v-text-field v-else v-model="targetToAdd" density="comfortable" variant="outlined"
                                clearable :rules="[rules.required, rules.target]" />
                        </v-col>
                        <v-col cols="2">
                            <v-btn v-if="!editActiveTarget" variant="flat" color="#E09D00" block size="large"
                                @click.stop="editActiveTarget = true">Edit</v-btn>
                            <v-btn v-if="editActiveTarget" variant="flat" color="#00ABC9" block size="large"
                                @click.stop="configureActiveTarget">Confirm</v-btn>
                        </v-col>
                    </v-row>

                    <v-row>
                        <v-col cols="12">
                            <!-- If an active target hasn't changed or is being edited, you can't save -->
                            <v-btn :disabled="!canSaveActiveChanges" type="submit" color="#003DA5" variant="flat" block
                                @click="saveTopic" :loading="makingServerRequest[topicToAdd]">Save</v-btn>
                        </v-col>
                    </v-row>
                </v-form>
            </v-sheet>
        </v-card>
    </v-dialog>

    <!-- Shows Prometheus metrics of topic -->
    <v-dialog v-model="showTopicMonitorDialog" class="max-table-width" transition="slide-y-transition">
        <v-card>
            <v-toolbar :title="monitorDialogTitle" color="#003DA5">
                <v-btn icon="mdi-close" variant="text" size="small" @click="showTopicMonitorDialog = false" />
            </v-toolbar>
            <v-container v-if="topicHasMetrics">
                <v-row class="py-5">
                    <v-col cols="6">
                        <v-card-title class="text-center">Downloaded Files
                        </v-card-title>
                        <vue-apex-charts ref="chart" type="bar" height="300" :options="chartOptions"
                            :series="buildSeries('downloaded_files_total')">
                        </vue-apex-charts>
                    </v-col>
                    <v-col cols="6">
                        <v-card-title class="text-center">Downloaded Bytes
                        </v-card-title>
                        <vue-apex-charts ref="chart" type="bar" height="300" :options="chartOptions"
                            :series="buildSeries('downloaded_bytes_total')">
                        </vue-apex-charts>
                    </v-col>
                </v-row>

                <v-divider />

                <v-row class="py-5">
                    <v-col cols="3" />
                    <v-col cols="6">
                        <v-card-title class="text-center">Failed Downloads:
                            <v-chip size="large" class="number">{{ topicMetrics['failed_downloads_total'] || 0
                                }}</v-chip>
                        </v-card-title>
                    </v-col>
                    <v-col cols="3" />
                </v-row>
            </v-container>

            <!-- If no metric data to present, show a message -->
            <v-container v-else>
                <v-row>
                    <v-col cols="12">
                        <p class="medium-title text-center">No metrics to display, as no notifications have been
                            received
                            yet from this topic.</p>
                    </v-col>
                </v-row>
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
import VueApexCharts from 'vue3-apexcharts'

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
        VCheckboxBtn,
        VueApexCharts
    },
    setup() {
        // Deep clone function to avoid reference issues between model and default model
        function deepClone(obj) {
            return JSON.parse(JSON.stringify(obj));
        };

        // Static variables
        const rules = {
            required: input => !!input || 'Field is required.',
            topic: input => {
                if (topicFound(input, activeTopics.value) ||
                    (topicFound(input, pendingTopics.value) && isTopicNew.value)) {
                    return 'This topic is already added to or overlaps with an existing topic';
                }
            },
            target: input => {
                // Check if the target is exactly "$TOPIC"
                if (input === "$TOPIC") {
                    return true;
                }
                // Regular expression for whitelisted characters
                const validPattern = /^[A-Za-z0-9/_-]+$/;
                return validPattern.test(input) || 'Invalid target';
            }
        };

        const { mdAndUp, lgAndUp } = useDisplay();

        // Bar chart options
        const chartOptions = {
            chart: {
                id: 'chart-by-filetype',
                animations: {
                    enable: true,
                    easy: 'linear'
                },
                toolbar: {
                    show: false
                }
            },
            plotOptions: {
                bar: {
                    borderRadius: 2,
                    columnWidth: '50%',
                    dataLabels: {
                        position: 'top',
                    },
                }
            },
            colors: ['#00ABC9'],
            dataLabels: {
                enabled: true,
                offsetY: -20,
                style: {
                    fontSize: '12px',
                    colors: ["#304758"]
                }
            },
            stroke: {
                curve: 'straight'
            },
            xaxis: {
                categories: ['bufr', 'grib', 'json', 'xml', 'png', 'other'],
            },
            yaxis: {
                min: 0,
                labels: {
                    show: false
                },
                axisBorder: {
                    show: false
                },
                axisTicks: {
                    show: false
                }
            }
        };

        // Reactive variables

        // Server information
        const serverLink = ref('http://localhost:5050');
        const token = ref('')
        const connectedToDownloader = ref(false);

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
        const configuredTopicIsPending = ref(false);
        const topicDialogTitle = ref('Create New Topic');
        const isTopicNew = ref(true);
        const previousTopic = ref('');
        const previousTarget = ref('');
        const editActiveTarget = ref(false);
        const form = ref(false);

        // Topic metric monitoring dialog
        const showTopicMonitorDialog = ref(false);
        const monitorDialogTitle = ref('');
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
                serverLink: serverLink.value,
                token: token.value,
                connectedToDownloader: connectedToDownloader.value,
                activeTopics: activeTopics.value,
                pendingTopics: pendingTopics.value
            }
        });

        // Build subscription URL from the server link
        const subscribeLink = computed(() => {
            return `${serverLink.value}/subscriptions`;
        });

        // Check if the active topic configuration can be saved
        const canSaveActiveChanges = computed(() => {
            return targetToAdd.value !== previousTarget.value && targetToAdd.value !== '' && !editActiveTarget.value;
        });

        // Check if the topic has metrics to display
        // (If there are no keys, there is no Prometheus data for the topic)
        const topicHasMetrics = computed(() => {
            return Object.keys(topicMetrics.value).length > 0;
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
                serverLink.value = storedSettings.serverLink || 'http://localhost:5050';
                token.value = storedSettings.token || '';
                connectedToDownloader.value = storedSettings.connectedToDownloader || false;
                activeTopics.value = storedSettings.activeTopics || [];
                pendingTopics.value = storedSettings.pendingTopics || [];
            } catch (error) {
                handleError('Error Loading Settings', `There was an issue loading the settings or topics you selected (${error.message}). Please try reloading the application.`);
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
            try {
                const response = await fetch(subscribeLink.value, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': 'Bearer ' + token.value
                    }
                });

                if (!response.ok) {
                    // Show a readable error and disconnect
                    let message;
                    if (HTTP_CODES[response.status] == 'Unauthorized') {
                        message = 'Unauthorized. Please check the API token.';
                    } else {
                        const readableError = HTTP_CODES[response.status] || response.statusText;
                        message = `There was a problem getting the subscribed topics: ${readableError}`;
                    }
                    handleError('Error Listing Topics', message);
                    connectedToDownloader.value = false;
                    return;
                }

                const data = await response.json();

                // Process the data before displaying the table
                activeTopics.value = processTopicData(data);

                // Display the table of active/pending topics
                connectedToDownloader.value = true;
            }
            catch (error) {
                handleError('Server Error', `There was a problem connecting to the server (${error.message}). Please check the server is running and the settings are correct.`);
                connectedToDownloader.value = false;
            }
        };

        // Get download metrics by querying Prometheus /metrics endpoint
        const getMetrics = async () => {

            // Build the full URL for Prometheus metrics
            const metricsLink = `${serverLink.value}/metrics`;

            try {
                const response = await fetch(metricsLink, {
                    method: 'GET',
                    headers: {
                        'Accept': 'text/plain',
                        'Authorization': 'Bearer ' + token.value
                    },
                });

                if (!response.ok) {
                    const readableError = HTTP_CODES[response.status] || response.statusText;
                    // Display the error message from server response, if available
                    handleError('Error Fetching Metrics', `There was a problem fetching the metrics of this topic: ${readableError}`);
                    return;
                }

                const data = await response.text();

                // Parse the Prometheus text data into an object
                metrics.value = parsePrometheusText(data);
            }
            catch (error) {
                handleError('Error Fetching Metrics', `There was a problem connecting to the server (${error.message}). Please check the server is running and the settings are correct.`);
            }
        };

        // Get the data from the server, such as topics, their associated
        // targets, and the current status of the server
        const getServerData = async () => {
            // Start the button loading animation
            connectingToServer.value = true;

            try {
                // Use various endpoints to get the data
                await getTopicList();
                if (!connectedToDownloader.value) {
                    handleError('Connection Error', 'Failed to connect to the downloader. Please verify the server link and token are correct.');
                    connectingToServer.value = false;
                    return;
                }
                await getMetrics();
                // If the connection is successful, update the last sync time
                if (connectedToDownloader.value) {
                    lastSyncTime.value = new Date().toLocaleTimeString();
                }
            } catch (error) {
                handleError('Server Error', `There was a problem getting server data (${error.message}). Please check the server is running and the settings are correct.`);
            } finally {
                // Stop the button loading animation
                connectingToServer.value = false;
            }
        };

        // Clear the server data and reset the connection status
        const clearServerData = () => {
            connectedToDownloader.value = false;
            activeTopics.value = [];
        };

        // Add the topic and target to the downloader using the /add endpoint
        const addToSubscription = async (item) => {
            // Start the button loading animation for this topic
            makingServerRequest.value[item.topic] = true;

            // The topic, in particular the wildcards (+,#), must be URI encoded
            const encodedTopic = encodeURIComponent(item.topic);

            // Build the request body
            const data = {
                topic: encodedTopic,
                target: item.target
            };

            try {
                const response = await fetch(subscribeLink.value, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token.value
                    },
                    body: JSON.stringify(data)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    const readableError = HTTP_CODES[response.status] || response.statusText;
                    // Display the error message from server response, if available
                    const message = errorData.error || readableError;
                    handleError('Error Adding Topic', message);
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
            } catch (error) {
                const message = `There was a problem connecting to the server (${error.message}). Please check the server is running and the settings are correct.`;
                handleError('Server Error', message);
                makingServerRequest.value[item.topic] = false;
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
            const deleteLink = `${subscribeLink.value}/${encodedTopic}`;

            try {
                const response = await fetch(deleteLink, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': 'Bearer ' + token.value
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    const readableError = HTTP_CODES[response.status] || response.statusText;
                    // Display the error message from server response, if available
                    const message = errorData.error || readableError;
                    handleError('Error Removing Topic', message);
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
            } catch (error) {
                handleError('Server Error', `There was a problem connecting to the server (${error.message}). Please check the server is running and the settings are correct.`);
                makingServerRequest.value[topic] = false;
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
        const configureTopic = (state, item) => {
            configuredTopicIsPending.value = state === 'pending';

            showTopicConfigDialog.value = true;

            if (!item) {
                isTopicNew.value = true;
                topicDialogTitle.value = 'Create New Topic';
            }
            else {
                isTopicNew.value = false;
                topicDialogTitle.value = 'Edit Topic';
            }

            // Save the original plugin name and filetype
            previousTopic.value = item?.topic;
            previousTarget.value = item?.target;

            populateFields(item);
        };

        const configureActiveTarget = async () => {
            // First check if the content is valid
            const { valid } = await form.value.validate();
            if (!valid) {
                return;
            }

            // Save the new target
            editActiveTarget.value = false;
        }

        // Adds or updates the topic, both in the list of active topics and pending topics
        const saveTopic = async () => {
            // First check if the content is valid
            const { valid } = await form.value.validate();
            if (!valid) {
                return;
            }

            const isActive = topicFound(topicToAdd.value, activeTopics.value);

            if (isActive) {
                // To update the topic's target, we must first remove it and then add it back
                await removeFromSubscription(topicToAdd.value);

                const updatedItem = {
                    topic: topicToAdd.value,
                    target: targetToAdd.value
                };

                await addToSubscription(updatedItem);

                // Reset the input fields and close the dialog
                topicToAdd.value = '';
                targetToAdd.value = '';
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

        // Make the names of metrics human readable
        const makeReadable = (metricName) => {
            return metricName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        };

        // Build an array suitable for the bar charts
        const buildSeries = (metricName) => {
            const data = [];

            // We must ensure the array is populated in the same
            // order as the x-axis categories
            for (const key of chartOptions.xaxis.categories) {
                data.push(topicMetrics.value[metricName]?.[key] || 0);
            }

            return [{
                name: makeReadable(metricName),
                data: data
            }];
        };

        // Add metric totals (e.g. total downloaded files) to topic metric data
        const appendTotals = (data) => {
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
        const monitorTopic = async (selectedTopic) => {
            // Update to latest server data
            await getServerData();

            // Wipe the metrics clean for this topic
            topicMetrics.value = {};

            // Aggregate all data from topics that intersect with the selected one
            Object.keys(metrics.value).forEach(topic => {

                if (!topicsIntersect(selectedTopic, topic)) {
                    return;
                }

                const topicData = metrics.value[topic];

                // Iterate over each metric within the topic data
                Object.keys(topicData).forEach(metricName => {
                    const metricValue = topicData[metricName];

                    // Directly aggregate numbers if no further labels are present
                    if (typeof metricValue === 'number') {
                        topicMetrics.value[metricName] = (topicMetrics.value[metricName] || 0) + metricValue;
                    }

                    // If file type labels present, the data will be an object 
                    else if (typeof metricValue === 'object' && metricValue) {
                        // Initialize metric container if not present
                        topicMetrics.value[metricName] = topicMetrics.value[metricName] || {};

                        // Aggregate data for each file type or label within the metric
                        Object.keys(metricValue).forEach(label => {
                            topicMetrics.value[metricName][label] = (topicMetrics.value[metricName][label] || 0) + metricValue[label];
                        });
                    }
                });
            });

            // Now finally totals to the metrics with additional labels
            // e.g. downloaded files by file type
            topicMetrics.value = appendTotals(topicMetrics.value);

            // Remove redundant metric key for the subscription status
            delete topicMetrics.value['topic_subscription_status'];

            // Display the metrics to the user
            monitorDialogTitle.value = `Download Metrics of ${selectedTopic}`;
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
                handleError('Error Adding Topic', `Topic ${toAdd.topic} is already subscribed to`);
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
                handleError('Error Removing Topic', `Topic ${topicToRemove.value} not found in pending topics, nothing to remove`);
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
            if (connectedToDownloader.value) {
                setInterval(getServerData, 5 * 60 * 1000);
            }
        });

        // Watch for changes in any of the user inputs, so that if they
        // navigate to the Explore page and return, their configuration is not lost
        watch(settings, () => {
            // As reactive objects aren't serialisable, we must deep copy it
            const settingsToStore = deepClone(settings.value);
            // Store the information in the electron API
            window.electronAPI.storeSettings(settingsToStore);
        }, { deep: true }); // Use deep watch to track nested array


        return {
            // Static variables
            rules,
            mdAndUp,
            lgAndUp,
            chartOptions,

            // Reactive variables
            serverLink,
            token,
            connectedToDownloader,
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
            configuredTopicIsPending,
            topicDialogTitle,
            editActiveTarget,
            form,
            showTopicMonitorDialog,
            monitorDialogTitle,
            topicMetrics,
            showRemoveWarningDialog,
            removalMessage,
            showErrorDialog,
            errorMessage,
            errorTitle,

            // Computed variables
            settings,
            canSaveActiveChanges,
            topicHasMetrics,

            // Methods
            processTopicData,
            getTopicList,
            getMetrics,
            getServerData,
            clearServerData,
            buildSeries,
            monitorTopic,
            topicFound,
            configureTopic,
            configureActiveTarget,
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
.equal-width th,
.equal-width td {
    width: 33%;
    word-break: break-word;
    /* Ensure long words wrap */
}

/* Misc. */
.sync-time {
    color: #666;
    opacity: 0.75;
    font-size: 1.1em;
}
</style>