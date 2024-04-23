<template>
    <v-row class="justify-center">
        <v-col cols=12 class="max-form-width">
            <v-card min-height="700px">
                <v-toolbar>
                    <v-toolbar-title class="big-title">WIS2 Subscription Dashboard</v-toolbar-title>
                    <v-toolbar-items class="sync-time pa-5">
                        <p v-if="connetionStatus">Last synchronized: <b>{{ lastSyncTime }}</b></p>
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
                                    <v-btn v-if="!connectionStatus" color="#003DA5" size="x-large" block
                                        @click="getServerData" :loading="connectingToServer">Connect</v-btn>
                                    <v-btn v-if="connectionStatus" color="#E09D00" size="x-large" block
                                        @click="clearServerData" :loading="connectingToServer">Disconnect</v-btn>
                                </v-col>
                            </v-row>
                        </v-card-text>
                    </v-col>
                </v-row>
                {{ serverError }}

                <transition name="slide-y-transition">
                    <v-card-item v-if="connectionStatus">
                        <v-row>
                            <v-col cols="12">
                                <v-card-title>Currently Subscribed Topics</v-card-title>
                                <v-card-subtitle>Topics actively subscribed to by the downloader</v-card-subtitle>
                                <v-card-item>
                                    <v-table :hover="true">
                                        <thead>
                                            <tr v-if="connectionStatus">
                                                <th scope="row" class="topic-column">
                                                    <p v-if="pendingTopics.length > 0" class="medium-title">Topic</p>
                                                    <p v-else class="medium-title text-center">No topics are currently
                                                        active
                                                    </p>
                                                </th>
                                                <th scope="row" class="directory-column">
                                                    <p v-if="pendingTopics.length > 0" class="medium-title">
                                                        Sub-Directory
                                                    </p>
                                                </th>
                                                <th scope="row" class="button-column">
                                                    <p v-if="pendingTopics.length > 0" class="medium-title">Actions</p>
                                                </th>
                                            </tr>
                                            <tr v-if="!connectionStatus">
                                                <th scope="row" class="topic-column">
                                                    <p class="medium-title text-center">Connection to server not
                                                        established
                                                    </p>
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
                                                    <!-- TODO: Statistics, Remove -->
                                                </td>
                                            </tr>
                                        </tbody>
                                    </v-table>
                                </v-card-item>
                            </v-col>
                        </v-row>

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
                                                    <v-btn v-else block color="#64BF40" @click="configureTopic()">Add A
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
                                                        variant="flat" @click.stop="addToSubscription(item)">
                                                        Activate
                                                    </v-btn>
                                                    <v-btn append-icon="mdi-delete" color="error" variant="flat"
                                                        @click.stop="confirmRemoval(item.topic, 'pending')">Remove</v-btn>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </v-table>
                                    <v-col />
                                    <v-btn v-if="pendingTopics.length > 0" block color="#64BF40"
                                        @click="configureTopic()">Add A
                                        New Topic</v-btn>
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
                <v-col cols="12">
                    <v-row>
                        <v-col cols="12">
                            <v-text-field v-model="topicToAdd" label="Topic" />
                        </v-col>
                    </v-row>

                    <v-row>
                        <v-col cols="12">
                            <v-text-field v-model="targetToAdd" label="Associated Sub-Directory" />
                        </v-col>
                    </v-row>

                    <v-row>
                        <v-col cols="12">
                            <v-btn color="#003DA5" variant="flat" block @click="saveTopic">Save</v-btn>
                        </v-col>
                    </v-row>
                </v-col>
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
                    <v-btn color="error" variant="flat" block @click="removeTopicFromPending">Yes</v-btn>
                </v-col>
                <v-col cols="6">
                    <v-btn color="black" variant="flat" block @click="showRemoveWarningDialog = false">No</v-btn>
                </v-col>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import { defineComponent, ref, computed, onMounted, watch } from 'vue';
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
        // Deep clone function to avoid reference issues between model and default model
        function deepClone(obj) {
            return JSON.parse(JSON.stringify(obj));
        }

        // Static variables
        const rules = {};

        const HTTP_CODES = {
            200: 'OK',
            201: 'Created',
            202: 'Accepted',
            204: 'No Content',
            400: 'Bad Request',
            401: 'Unauthorized',
            403: 'Forbidden',
            404: 'Not Found',
            405: 'Method Not Allowed',
            406: 'Not Acceptable',
            409: 'Conflict',
            500: 'Internal Server Error',
            501: 'Not Implemented',
            503: 'Service Unavailable',
            504: 'Gateway Timeout'
        };

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

        // The topic and associated target to be added/deleted
        const topicToAdd = ref('')
        const targetToAdd = ref('')
        const topicToRemove = ref('');

        // Loading animation when connecting to the server
        const connectingToServer = ref(false);

        // Last time the frontend was synced with the backend
        const lastSyncTime = ref(new Date().toLocaleTimeString());

        // Dialog stuff
        const showTopicConfigDialog = ref(false);
        const topicDialogTitle = ref('Create New Topic');
        const previousTopic = ref('');
        const previousTarget = ref('');
        const showRemoveWarningDialog = ref(false);
        const removalMessage = ref('');

        // Errors
        const serverError = ref('');

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
                    const readableError = HTTP_CODES[response.status] || response.statusText;
                    serverError.value = `Error connecting to server: ${readableError}`;
                }

                const data = await response.json();
                console.log('Server topic data:', data);

                // Process the data before displaying the table
                activeTopics.value = processTopicData(data);
            }
            catch (error) {
                serverError.value = error;
            }
        };

        // Get the data from the server, such as topics, their associated
        // targets, and the current status of the server
        const getServerData = async () => {
            // Start the button loading animation
            connectingToServer.value = true;

            // Use various endpoints to get the data
            await getTopicList();

            // Display the table of active/pending topics
            connectionStatus.value = true;

            // Update the last sync time
            lastSyncTime.value = new Date().toLocaleTimeString();

            // Stop the button loading animation
            connectingToServer.value = false;
        };

        // Interval to refresh data every 5 minutes
        if (connectionStatus.value) {
            setInterval(getServerData, 300000);
        };

        // Clear the server data and reset the connection status
        const clearServerData = () => {
            connectionStatus.value = false;
            activeTopics.value = [];
        };

        // Add the topic and target to the downloader using the /add endpoint
        const addToSubscription = async (item) => {
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
                    const readableError = HTTP_CODES[response.status] || response.statusText;
                    serverError.value = `Error connecting to server: ${readableError}`;
                }

                topicToRemove.value = item.topic;
                removeTopicFromPending();

                // Update the active topics
                await getTopicList();
            }
            catch (error) {
                serverError.value = error;
            }
        };

        // Local interaction

        // Check if the topic is found in the list of topic items
        const topicFound = (topicToFind, topicList) => {
            return topicList.some(item => item.topic === topicToFind);
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

        // Adds or updates the topic
        const saveTopic = () => {

            const exists = topicFound(previousTopic.value, pendingTopics.value);

            if (exists) {
                updateTopicInPending();
            }
            else {
                addTopicToPending();
            }

            // Close the dialog
            showTopicConfigDialog.value = false;
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
                serverError.value = 'Topic is already subscribed to';
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
            // If the connection is already established, get the topic list
            if (connectionStatus.value) {
                getServerData();
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

            // Reactive variables
            host,
            port,
            username,
            password,
            connectionStatus,
            activeTopics,
            pendingTopics,
            topicToAdd,
            targetToAdd,
            topicToRemove,
            connectingToServer,
            lastSyncTime,
            showTopicConfigDialog,
            topicDialogTitle,
            showRemoveWarningDialog,
            removalMessage,
            serverError,

            // Computed variables
            settings,
            serverLink,

            // Methods
            processTopicData,
            getTopicList,
            getServerData,
            clearServerData,
            topicFound,
            configureTopic,
            saveTopic,
            addToSubscription,
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

.sync-time {
    color: #666;
    opacity: 0.75;
    font-size: 1.1em;
}
</style>