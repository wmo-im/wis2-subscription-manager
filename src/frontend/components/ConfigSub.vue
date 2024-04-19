<template>
    <v-row class="justify-center">
        <v-col cols=12 class="max-form-width">
            <v-card>
                <v-card-title class="big-title">WIS2 Subscription Configuration</v-card-title>
                <span v-if="connectionStatus" class="text-right">
                    Last synchronized: {{ lastSyncTime }}
                </span>
                <v-card-text>Connect to your WIS2 Downloader backend, configure topics, and monitor
                    downloads.</v-card-text>
                <v-col cols="1" />

                <v-row>
                    <v-col cols="12">
                        <v-card-title class="sub-title">Downloader Server Information</v-card-title>
                        <v-card-text>
                            <v-row>
                                <v-col cols="3">
                                    <v-text-field v-model="host" label="Server Host"></v-text-field>
                                </v-col>
                                <v-col cols="2">
                                    <v-text-field v-model="port" label="Server Port"></v-text-field>
                                </v-col>
                                <v-col cols="2">
                                    <v-text-field v-model="username" label="Username"></v-text-field>
                                </v-col>
                                <v-col cols="2">
                                    <v-text-field v-model="password" label="Password"></v-text-field>
                                </v-col>
                                <v-col cols="2">
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

                <v-row>
                    <v-col cols="12">
                        <v-card-title class="sub-title">Currently Subscribed Topics</v-card-title>
                        <v-card-text>The topics actively subscribed to by the downloader.</v-card-text>
                        <v-card-item>
                            <v-table v-if="connectionStatus" :hover="true">
                                <thead>
                                    <tr>
                                        <th scope="row">
                                            <p v-if="activeTopics.length > 0">Topic</p>
                                            <p v-else>No topics are currently subscribed to</p>
                                        </th>
                                        <th scope="row">Associated Sub-Directory</th>
                                        <th scope="row" class="text-right"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="item in activeTopics" :key="item.topic" @click="configureTopic(item)"
                                        class="clickable-row">
                                        <td>
                                            {{ item.topic }}
                                        </td>
                                        <td>
                                            {{ item.target }}
                                        </td>
                                        <td class="row-buttons">

                                        </td>
                                    </tr>
                                </tbody>
                            </v-table>
                        </v-card-item>
                    </v-col>
                </v-row>

                <v-row v-if="connectionStatus">
                    <v-col cols="12">
                        <v-card-title class="sub-title">Topics To Add</v-card-title>
                        <v-card-text>Pending topics that aren't currently subscribed to by the downloader.</v-card-text>

                        <v-card-item>
                            <v-table v-if="connectionStatus" :hover="true">
                                <thead>
                                    <tr>
                                        <th scope="row">
                                            <p v-if="pendingTopics.length > 0">Topic to Add</p>
                                            <p v-else>No topics have been added</p>
                                        </th>
                                        <th scope="row">Associated Sub-Directory</th>
                                        <th scope="row" class="text-right"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="item in pendingTopics" :key="item.topic" @click="configureTopic(item)"
                                        class="clickable-row">
                                        <td class="medium-title">
                                            {{ item.topic }}
                                        </td>
                                        <td class="medium-title">
                                            {{ item.target }}
                                        </td>
                                        <td class="text-right">
                                            <v-btn class="mr-5" append-icon="mdi-update" color="#003DA5" variant="flat"
                                                @click.stop="addToSubscription(item)">
                                                Update
                                            </v-btn>
                                            <v-btn append-icon="mdi-delete" color="error" variant="flat"
                                                @click.stop="removeTopicFromPending(item)">Delete</v-btn>
                                        </td>
                                    </tr>
                                </tbody>
                            </v-table>
                        </v-card-item>
                    </v-col>
                </v-row>

            </v-card>
        </v-col>
    </v-row>
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

        // The topic and associated target to be added
        const topicToAdd = ref('')
        const targetToAdd = ref('')

        // The topic to remove
        const topicToDelete = ref('');

        // Loading animation when connecting to the server
        const connectingToServer = ref(false);

        // Last time the frontend was synced with the backend
        const lastSyncTime = ref(new Date().toLocaleTimeString());

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
        }

        // Add a topic and its associated target to the list of pending topics
        const addTopicToPending = () => {

            const toAdd = {
                topic: topicToAdd.value,
                target: targetToAdd.value
            };

            // Check if the topic is already in the list of active topics
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
        const removeTopicFromPending = (topic) => {

            // Remove it from the array if it can be found
            const topicCanBeRemoved = topicFound(topicToRemove, pendingTopics.value);

            if (!topicCanBeRemoved) {
                catalogueError.value = "Topic not found in subscription";
                return;
            }

            let updatedTopics = [...pendingTopics.value]

            updatedTopics = updatedTopics.filter(item => item !== topicToRemove);

            pendingTopics.value = updatedTopics;
        }

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
            topicToDelete,
            connectingToServer,
            lastSyncTime,
            serverError,

            // Computed variables
            settings,
            serverLink,

            // Methods
            processTopicData,
            getTopicList,
            getServerData,
            topicFound,
            addToSubscription,
            addTopicToPending,
            removeTopicFromPending
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