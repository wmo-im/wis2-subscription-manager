<template>
    <v-row align="center">
        <v-col :cols="(12 - barSize) / 2">
            <v-divider />
        </v-col>
        <v-col :cols="barSize">
            <v-btn @click="searchCatalogue" append-icon="mdi-cloud-search" color="#003DA5" variant="flat" size="large"
                block :disabled="!catalogueBoolean" :loading="loadingBoolean">Browse the Catalogue</v-btn>
        </v-col>
        <v-col :cols="(12 - barSize) / 2">
            <v-divider />
        </v-col>
    </v-row>
</template>

<script>
export default {
    name: 'SearchBar',
    props: {
        searchCatalogue: Function,
        catalogueBoolean: Boolean,
        loadingBoolean: Boolean,
        barSize: Number
    }
}
</script>