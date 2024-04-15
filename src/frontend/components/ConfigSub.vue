<template>
    <v-row class="justify-center">
        <v-col cols=12 class="max-form-width">
            <v-card>
                <v-col cols="auto">
                    <v-card-title class="big-title">WIS2 Subscription Configuration</v-card-title>
                </v-col>
                <v-spacer />

                <v-row>
                    <v-col cols="12">
                        <v-card-title class="sub-title">Downloader Server Information</v-card-title>
                        <v-card-text>
                            <v-row>
                                <v-col cols="4">
                                    <v-text-field v-model="host" label="Server Host"></v-text-field>
                                </v-col>
                                <v-col cols="3">
                                    <v-text-field v-model="port" label="Server Port"></v-text-field>
                                </v-col>
                                <v-col cols="1"/>
                                <v-col cols="3">
                                    <v-btn color="#003DA5" size="x-large" block @click="getServerData" :loading="connectingToServer">Connect</v-btn>
                                </v-col>
                            </v-row>
                        </v-card-text>
                    </v-col>

                </v-row>

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

        // Static variables
        const rules = {};

        // Reactive variables

        // Server information, port is optional
        const host = ref('127.0.0.1');
        const port = ref('');
        // The topics (as keys) and their associated sub-directorys (as values)
        const topics = ref({});

        // The topic and associated directory to be added
        const topicToAdd = ref('')
        const directoryToAdd = ref('')

        // The topic to remove
        const topicToDelete = ref('');

        // Loading animation when connecting to the server
        const connectingToServer = ref(false);

        // Computed
        const serverInfo = computed(() => {
            return {
                host: host.value,
                port: port.value
            }
        });

        // Methods

        const processServerData = (data) => {
            // TODO: extract the relevant data from the server
            return data;
        }

        // Get the data from the server, such as topics, their associated
        // directories, and the current status of the server
        const getServerData = async () => {
            // Start the button loading animation
            connectingToServer.value = true;
            try {
                const data = await window.electronAPI.getServerData(serverInfo.value);
                console.log('Server data:', data);
                // Process this data
                processServerData(data);
            }
            catch (error) {
                console.error('Error getting server data:', error);
            }
            // Stop the button loading animation
            connectingToServer.value = false;
        }

        // Load the saved information from the electron API
        const loadSettings = async () => {
            try {
                const settings = await window.electronAPI.loadSettings();
                if (settings) {
                    serverInfo.value = settings.serverInfo;
                    topics.value = settings.topics;
                }
            }
            catch (error) {
                console.error('Error loading settings: ', error);
            }
        }

        const addTopicAndDirectory = () => {
            topics.value[topicToAdd.value] = directoryToAdd.value;
            // Clear the input fields
            topicToAdd.value = '';
            directoryToAdd.value = '';
        };

        onMounted(() => {
            // Get settings from GDC or previous usage of configuration page
            loadSettings();
        });

        // Watch for changes in any of the user inputs, so that if they
        // navigate to the Explore page and return, their configuration is not lost
        watch(topics, () => {
            const settings = {
                serverInfo: serverInfo.value,
                topics: topics.value
            };
            console.log("Storing settings:", settings);
            // Store the information in the electron API
            window.electronAPI.storeSettings(settings);
        }, { deep: true }); // Use deep watch to track nested array

        return {
            // Static variables
            rules,

            // Reactive variables
            host,
            port,
            topics,
            topicToAdd,
            directoryToAdd,
            topicToDelete,
            connectingToServer,

            // Computed variables
            serverInfo,

            // Methods
            getServerData,
            processServerData,
            addTopicAndDirectory,
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