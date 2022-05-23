/*
* emits: selected (file) when a file is selected
* emits: cancel when a file is canceled
*/

Vue.component('imageselector', {
    props: [],
    data: function () {
       return { 
           selected_image_data: null,
           file_name: "no file selected"
        }
    },
    methods: {
        selected: function(event) {
            file = event.target.files[0];
            this.file_name = file.name;
            reader = new FileReader();
            reader.addEventListener("load", (event)=>{
                this.selected_image_data = reader.result;
            });
            reader.readAsDataURL(file);

            this.$emit("selected", file);
        },
        cancel: function() {
            this.file_name = "no file selected",
            this.selected_image_data = null,
            this.$emit("cancel");
        }
    },
    template: `
    <div class="columns">
        <div class="column">
            <div class="file is-primary">
                <label class="file-label">
                    <input 
                        class="file-input"
                        type="file"
                        accepts="image/png, image/jpeg"
                        @change="selected($event)"
                        >
                    <span class="file-cta">
                        <span class="file-icon">
                            <i class="fa fa-upload"></i>
                        </span>
                        <span class="file-label">
                            select an image...
                        </span>
                    </span>
                </label>
                <span class="file-label mx-4">
                    <div v-if="selected_image_data" class="message">
                        <div class="message-header">
                            <p>{{file_name}}</p>
                            <button class="delete" @click="cancel()"></button>
                        </div>
                        <div class="message-body">
                            <div class="image is-128x128">
                                <img :src="selected_image_data"/>
                            </div>
                        </div>
                    </div>
                    <div v-else class="content"> 
                            no image selected...
                    </div>
                </span>
            </div>
        </div>
        
    </div>
    `
});