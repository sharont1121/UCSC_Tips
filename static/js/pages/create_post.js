// This will be the object that will contain the Vue attributes
// and be used to initialize it.
const app = {};

const default_lat = 36.9927;
const default_lng = -122.0593;


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
        lat: default_lat,
        lng: default_lng,

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
                lat: this.lat,
                lng: this.lng,
            });
    }


    app.init_map = function () {
        const ucsc_default_coord = { lat: default_lat, lng: default_lng };
        // The map, centered at UCSC
        const map = new google.maps.Map(document.getElementById("map"), {
            zoom: 15,
            center: ucsc_default_coord,
        });

        // Add default center marker
        let marker = new google.maps.Marker({
                position: ucsc_default_coord,
                map: map,
            });

        // Configure the click listener.
        map.addListener("click", (mapsMouseEvent) => {
        marker.setMap(null);
        marker =  new google.maps.Marker({
                position: mapsMouseEvent.latLng,
                map: map,
            });

        set_coordinate = mapsMouseEvent.latLng.toJSON()

        // Set coordinate Vue variables with the clicked location's coordinate
        app.vue.lat = set_coordinate.lat;
        app.vue.lng = set_coordinate.lng;
        });
    }

    app.load_created_post = function(id) {
        let vars = window.location.search.replaceAll(/[&]?selectedid=[\d]+/g, "");
        console.log(vars);
        if(vars && vars !== '?'){
            vars = vars + '&';
        }
        else{
            vars = '?';
        }

        let url = window.location.toString();
        let add_path = "feed" + vars + "selectedid=" + id;
        window.location = url.replace(/create_post/, add_path);
    };


    app.add_tip = function () {
        if (this.add_title == "" || this.add_body == "" || !this.file ) {
            alert("Please enter a title, description and image for your post before submitting.");
        }
        // Uploads the file, using the low-level interface.
        let req = new XMLHttpRequest();
        // We listen to the load event = the file is uploaded, and we call upload_complete.
        // That function will notify the server `of the location of the image.
        let post_id;
        req.addEventListener("load", () => {
            this.upload_text().then( (response) => {
                    post_id = response.data.id;
                    axios.post(upload_complete_url, {

                        post_id: response.data.id,
                        image_url: this.file_url
                    }).then(()=>{
                        app.reset_form();
                        app.load_created_post(post_id);
                    })
            });
        });
        // TODO: if you like, add a listener for "error" to detect failure.
        req.open("PUT", this.upload_url, true);
        req.send(this.file);
<<<<<<< HEAD

=======
        
>>>>>>> d5eb3f006c0dde2aa6df72247b8acf0856e90e0f

    };

    app.get_upload_url = function (file) {
        this.file = file;
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
    app.reset_image = function() {
        this.fetching_url = false;
        this.uploading_image = false;
        this.file_url = null;
        this.file_path = null;
        this.file = null;
    }
    app.reset_form = function () {
        app.vue.add_title = "";
        app.vue.add_body = "";
        app.vue.add_tag1 = "";
        app.vue.add_tag2 = "";
        app.vue.add_tag3 = "";
        app.vue.upload_url = null,
        this.reset_image();
        app.vue.lat = default_lat;
        app.vue.lng = default_lng;

    };



    // We form the dictionary of all methods, so we can assign them
    // to the Vue app in a single blow.
    app.methods = {
        add_tip: app.add_tip,
        get_upload_url: app.get_upload_url,
        upload_text: app.upload_text,
        reset_image: app.reset_image,
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
        app.init_map();
    };

    // Call to the initializer.
    app.init();
};

// This takes the (empty) app object, and initializes it,
// putting all the code i
init(app);