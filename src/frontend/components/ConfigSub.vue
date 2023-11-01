<template>
    <v-row>
        <v-col cols=12>
            <v-card>
                <v-card-title class="big-title">WIS2 Subscription Configuration</v-card-title>

                <v-form>
                    <v-card-item>
                        <v-card-title>Global broker</v-card-title>
                        <v-select label="Please choose a broker" :items="brokerList"
                            variant="solo-filled" v-model="selectedBroker"></v-select>
                    </v-card-item>

                    <v-card-item>
                        <v-card-title>Topics</v-card-title>

                    </v-card-item>

                    <v-card-item>
                        <v-card-title>Download location</v-card-title>
                    </v-card-item>

                    <v-row justify="end">
                        <v-btn>Subscribe</v-btn>
                    </v-row>

                </v-form>
            </v-card>
        </v-col>
    </v-row>

    <v-row>
        <v-col cols="12">
            <v-card>
                <v-card-title class="big-title">
                    Notifications
                </v-card-title>
                <v-container>
                    <v-card variant="tonal">
                        <p>Example console text</p>
                        <p>Example console text</p>
                        <p>Example console text</p>
                    </v-card>
                </v-container>
            </v-card>
        </v-col>
    </v-row>
</template>

<script>
import { defineComponent, ref, computed } from 'vue';
import { VCard, VCardTitle, VCardText, VCardItem, VForm, VBtn, VListGroup, VSelect } from 'vuetify/lib/components/index.mjs';

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
        VSelect
    },
    setup() {
        
        // Reactive variables
        const brokerList = ref(['France Global Broker', 'China Global Broker']);
        const selectedBroker = ref("");
        const chosenTopics = ref([]);
        const downloadLocation = ref("");

        // Methods
        const logInputs = () => {
            console.log("Selected broker", selectedBroker.value)
        };

        return {
            brokerList,
            selectedBroker,
            chosenTopics,
            downloadLocation,
            logInputs
        }

    }
})

</script>

<style scoped></style>