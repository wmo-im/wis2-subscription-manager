<template>
    <v-row class="justify-center">
        <v-col cols=12 class="max-form-width">
            <v-card>
                <v-card-title class="big-title">WIS2 Subscription Configuration</v-card-title>

                <v-form>
                    <v-card-item class="py-0">
                        <v-card-title>Global broker</v-card-title>
                        <v-select label="Please choose a broker" :items="brokerList" variant="solo-filled"
                            v-model="selectedBroker"></v-select>
                    </v-card-item>

                    <v-card-item class="py-0">
                        <v-card-title>Topics</v-card-title>
                        <v-row>
                            <v-col cols="10">
                                <v-text-field label="Please enter one or more topics" variant="solo-filled"
                                    v-model="topicEntry" @keyup.enter="addTopic" :disabled="!isBrokerSelected">
                                </v-text-field>
                            </v-col>
                            <v-col cols="2">
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
                            <v-checkbox-btn color="#003DA5" v-model="downloadBoolean"
                                :disabled="!isBrokerSelected"></v-checkbox-btn>
                        </v-row>
                        <v-row v-if="downloadBoolean === true" align="center">
                            <v-col cols="auto">
                                <v-btn prepend-icon="mdi-folder-download" color="#003DA5" variant="flat"
                                    @click="selectDirectory">Select a
                                    folder</v-btn>
                            </v-col>
                            <v-col cols="auto">
                                <v-chip label v-if="selectedDirectory">{{ truncatedDirectory }}</v-chip>
                            </v-col>
                        </v-row>
                    </v-card-item>


                    <v-card-item>
                        <div class="d-flex justify-center">
                            <v-btn v-if="!subscribePressed" :disabled="!canSubscribe" @click="toggleSubscription"
                                color="#003DA5" variant="flat" class="ma-1" block>Subscribe</v-btn>
                            <v-btn v-if="subscribePressed" @click="toggleSubscription" color="#E09D00" variant="flat"
                                class="ma-1" block>Cancel Subscription</v-btn>
                        </div>
                    </v-card-item>

                </v-form>
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
                        <v-container>
                            {{ backendStatus }}
                        </v-container>
                    </v-card>
                </v-card-item>
            </v-card>
        </v-col>
    </v-row>
</template>

<script>
import { defineComponent, ref, computed } from 'vue';
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
        const brokerList = ref(['France Global Broker', 'China Global Broker']);
        const selectedBroker = ref('');
        const topicEntry = ref('')
        const topicsList = ref([]);
        const selectedDirectory = ref('');
        const downloadBoolean = ref(false);
        const subscribePressed = ref(false);
        const backendStatus = ref('');

        // Static variables
        const brokerURLMapping = {
            'France Global Broker': 'globalbroker.meteo.fr',
            'China Global Broker': 'gb.wis.cma.cn'
        };

        // Computed

        // Maps selected broker from the drop down to the actual URL
        const brokerURL = computed(() => {
            return brokerURLMapping[selectedBroker.value] || ""
        })

        // Checks if the global broker has been selected
        const isBrokerSelected = computed(() => {
            return selectedBroker.value !== ""
        });

        // Checks if the global broker has been selected and at
        // least one topic has been added
        const canSubscribe = computed(() => {
            return isBrokerSelected.value && topicsList.value.length > 0
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

        // Toggles the subscription process depending on whether the user
        // intends to start a subscription or cancel a subscription
        const toggleSubscription = async () => {
            // When subscribe/cancel button pressed, change boolean state
            subscribePressed.value = !subscribePressed.value;

            try {
                // Construct data to be sent
                const data = {
                    broker: brokerURL.value,
                    topics: Array.from(topicsList.value), // Convert Proxy to regular array
                    downloadDirectory: selectedDirectory.value,
                    shouldSubscribe: subscribePressed.value
                };

                console.log('Data sent to backend: ', data)

                // Start or kill backend process
                window.electronAPI.handleSubscription(data);
                
                // Listen to response from backend
                window.electronAPI.onSubscriptionResponse((event, response) => {
                    console.log('Backend response:', response);
                    backendStatus.value = response.status
                });
            }
            catch (error) {
                console.error('Error subscribing: ', error);
                backendStatus.value = 'Error occurred with backend subscriber';
            }
        };


        return {
            brokerList,
            selectedBroker,
            brokerURL,
            topicEntry,
            topicsList,
            selectedDirectory,
            isBrokerSelected,
            canSubscribe,
            truncatedDirectory,
            downloadBoolean,
            addTopic,
            removeTopic,
            selectDirectory,
            subscribePressed,
            backendStatus,
            toggleSubscription
        }
    }
})

</script>

<style scoped></style>