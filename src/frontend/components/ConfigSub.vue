<template>
    <v-row class="justify-center">
        <v-col cols=12 class="max-form-width">
            <v-card>
                <v-row dense>
                    <v-col cols="auto">
                        <v-card-title class="big-title">WIS2 Subscription Configuration</v-card-title>
                    </v-col>
                    <v-spacer />
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
        const showNameDialog = ref(false);
        const deleteLoadingBoolean = ref(false);
        const syncLoadingBoolean = ref(false);
        const topicEntry = ref('')
        const topicsList = ref([]);
        const showConfigWarningDialog = ref(false);
        const showTopicDialog = ref(false);
        const showAddTopicDialog = ref(false);
        const topicToAdd = ref('');
        const showTopicWarningDialog = ref(false);
        const topicToDelete = ref('');

        // Methods

        // Load the saved information from the electron API
        const loadSettings = async () => {
            try {
                const settings =  await window.electronAPI.loadSettings();
                if (settings) {
                    topicsList.value = settings.topics;
                }
            }
            catch (error) {
                console.error('Error loading settings: ', error);
            }
        }

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
        const removeTopic = (topic) => {
            const index = topicsList.value.indexOf(topic);
            if (index > -1) {
                /// Create a shallow copy first
                let updatedTopicsList = [...topicsList.value];

                // Remove the item at the specified index
                updatedTopicsList.splice(index, 1);

                // Reassign the topic list to the updated one
                topicsList.value = updatedTopicsList;
            }
        };

        // Store topic to delete and open confirmation dialog
        const confirmTopicDelete = (topic) => {
            topicToDelete.value = topic;
            showTopicWarningDialog.value = true;
        };

        // Manage topics for existing subscription
        const manageTopics = async (topic, action) => {
            if (action === 'add') {
                // Add topic to topic list so it appears in the UI
                topicsList.value.push(topic);
                // Send topic to backend to add to subscription
                const data = {
                    topic: topic,
                    action: 'add'
                }
                await window.electronAPI.manageTopics(data);
                // Now close the add topic dialog
                showAddTopicDialog.value = false;
            }
            else if (action === 'delete') {
                // Start loading animation of delete button
                deleteLoadingBoolean.value = true;
                // Remove from topic list so it no longer shows in the UI
                topicsList.value.splice(topicsList.value.indexOf(topic), 1);
                // Send topic to backend to delete from subscription
                const data = {
                    topic: topic,
                    action: 'delete'
                }
                await window.electronAPI.manageTopics(data);
                // Close warning dialog
                showTopicWarningDialog.value = false;
                // Stop loading animation
                deleteLoadingBoolean.value = false;
            }
        };

        onMounted(() => {
            // Get settings from GDC or previous usage of configuration page
            loadSettings();
        });

        // Watch for changes in any of the user inputs, so that if they
        // navigate to the Explore page and return, their configuration is not lost
        watch(topicsList, () => {
            const settings = {
                topics: Array.from(topicsList.value), 
            };
            console.log("Storing settings:", settings);
            // Store the information in the electron API
            window.electronAPI.storeSettings(settings);
        }, { deep: true }); // Use deep watch to track nested array

        return {
            // Static variables
            rules,

            // Reactive variables
            showNameDialog,
            deleteLoadingBoolean,
            syncLoadingBoolean,
            topicEntry,
            topicsList,
            showConfigWarningDialog,
            showTopicDialog,
            showAddTopicDialog,
            topicToAdd,
            showTopicWarningDialog,
            topicToDelete,

            // Methods
            addTopic,
            removeTopic,
            confirmTopicDelete,
            manageTopics
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