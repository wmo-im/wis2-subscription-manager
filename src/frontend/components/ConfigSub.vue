<template>
    <v-row>
        <v-col cols=12>
            <v-card>
                <v-card-title class="big-title">WIS2 Subscription Configuration</v-card-title>

                <v-form>
                    <v-card-item>
                        <v-card-title>Global Broker</v-card-title>
                        <v-select label="Please choose a broker" :items="['France Global Broker', 'China Global Broker']"
                            variant="solo-filled"></v-select>
                    </v-card-item>

                    <v-card-item>
                        <v-card-title>Topics</v-card-title>

                    </v-card-item>
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
import { defineComponent, computed } from 'vue';
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
        //
    }
})

</script>

<style scoped></style>