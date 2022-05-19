// This will be the object that will contain the Vue attributes
// and be used to initialize it.
const app = {};


// Given an empty app object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
let init = (app) => {

    // This is the Vue data.
    app.data = {
        add_title: "",
        add_body: "",
        add_tag1: '',
        add_tag2: '',
        add_tag3: '',
        upload_url: null,
        fetching_url: false,
        uploading_image: false,
        file_url: null,
        file_path: null,
        file: null,
    };

    app.enumerate = (a) => {
        // This adds an _idx field to each element of the array.
        let k = 0;
        a.map((e) => {e._idx = k++;});
        return a;
    };

    app.upload_text = function () {
        return axios.post(add_tip_url,
            {
                title: this.add_title,
                body: this.add_body,
                tag1_name: this.add_tag1,
                tag2_name: this.add_tag2,
                tag3_name: this.add_tag3,
            });
    }

    app.add_tip = function () {

        if (!this.file){
            console.log("ping");
            this.upload_text().then(()=>{
                app.reset_form();
            })
            return;
        }
        // Uploads the file, using the low-level interface.
        let req = new XMLHttpRequest();
        // We listen to the load event = the file is uploaded, and we call upload_complete.
        // That function will notify the server `of the location of the image.
        req.addEventListener("load", () => {
            this.upload_text().then( (response) => {
                    axios.post(upload_complete_url, {

                        post_id: response.data.id,
                        image_url: this.file_url
                    }).then(()=>{
                        app.reset_form();
                    })
            });
        });
        // TODO: if you like, add a listener for "error" to detect failure.
        req.open("PUT", this.upload_url, true);
        req.send(this.file);
    };

    app.get_upload_url = function (event) {
        this.upload_url = null;
        const input = event.target;
        this.file = input.files[0];
        if (this.file) {
            this.fetching_url = true;
            let file_type = this.file.type;
            let file_name = this.file.name;
            // Requests the upload URL.
            axios.post(obtain_gcs_upload_url, {
                action: "PUT",
                mimetype: file_type,
                file_name: file_name
            }).then((res)=>{
                this.get_gcs_res = res
                this.upload_url = res.data.signed_url;
                this.file_path = res.data.file_path;
                this.fetching_url = false;
                this.file_url = api_endpoint + '/' + this.file_path;
                console.log(this);
                
            }) 
        }
    }
    app.reset_form = function () {
        app.vue.add_title = "";
        app.vue.add_body = "";
        app.vue.add_tag1 = "";
        app.vue.add_tag2 = "";
        app.vue.add_tag3 = "";
    };

    // We form the dictionary of all methods, so we can assign them
    // to the Vue app in a single blow.
    app.methods = {
        add_tip: app.add_tip,
        get_upload_url: app.get_upload_url,
        upload_text: app.upload_text,
    };

    // This creates the Vue instance.
    app.vue = new Vue({
        el: "#vue-target",
        data: app.data,
        methods: app.methods
    });

    // And this initializes it.
    // Generally, this will be a network call to the server to
    // load the data.
    // For the moment, we 'load' the data from a string.
    app.init = () => {

    };

    // Call to the initializer.
    app.init();
};

// This takes the (empty) app object, and initializes it,
// putting all the code i
init(app);