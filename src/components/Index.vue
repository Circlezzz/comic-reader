<template>
  <v-app :style="backgroundColor">
    <v-container>
      <v-layout align-center row fill-height>
        <v-flex xl6 offset-xl3>
          <v-card>
            <v-img src="/green-aurora-boreali.jpg" aspect-ratio="2.75"></v-img>

            <v-card-title primary-title>
              <div>
                <h3 class="headline mb-0">Comic Reader</h3>
                <div>ver 0.1.0</div>
              </div>
            </v-card-title>

            <v-card-actions>
              <v-btn flat color="green darken-3" @click="importFiles">Import Comic</v-btn>
              <v-btn flat color="green darken-3" @click="showAbout">About</v-btn>
            </v-card-actions>
          </v-card>

        </v-flex>
      </v-layout>
    </v-container>

    <div class="text-xl-center">
      <v-dialog v-model="aboutDialog" width="500">
        <v-card>
          <v-card-title class="headline green darken-3 white--text" primary-title>
            <strong>About</strong>
          </v-card-title>

          <v-card-text>
            Made with Electron and vue.js.
            <br>v0.1.0 --- 2019.6.26
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="green darken-3" flat @click="aboutDialog = false">OK</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </v-app>
</template>

<script>
const ipc = require("electron").ipcRenderer;

export default {
  data() {
    return {
      backgroundColor: {
        backgroundColor: "#FFFFFF"
      },
      aboutDialog: false
    };
  },
  methods: {
    importFiles: function() {
      ipc.send("open-file-dialog", "Index.vue");
    },
    showAbout: function() {
      this.aboutDialog = true;
    }
  },
  mounted() {
    ipc.on("new-image-buffer-index", (event, buffer) => {
      // this.comic_img = buffer;
      this.$store.commit("putComicData", buffer);
      this.$router.push("/slide");
    });
    this.backgroundColor.backgroundColor = this.$store.state.backgroundColor;
  }
};
</script>

<style>
::-webkit-scrollbar {
  width: 0px;
}
</style>
