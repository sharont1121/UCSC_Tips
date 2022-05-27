
// This will be the object that will contain the Vue attributes
// and be used to initialize it.
const app = {};


// Given an empty app object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
function init(app) {
    // This is the Vue data.
    app.data = {
        LOAD_URL: LOAD_URL,
        RATE_URL: RATE_URL,
        PARAMS: PARAMS,

        upload_url: null,
        fetching_url: false,
        uploading_image: false,
        file_url: null,
        file_path: null,
        file: null,
    };

     app.newfeedloaded = function( {search_text: search_text, tags: tags} ) {
           let new_url = new URL(`${window.location.origin}${window.location.pathname}`) //construct url without any params
            if(search_text){
                new_url.searchParams.append("search", search_text);
            }
            if(tags){
                new_url.searchParams.append("tags", JSON.stringify(tags))
            }
            window.history.pushState({},"", new_url);
    };

    app.newpostactive = function(id) {
        let url = new URL(window.location.href);
        if(url.searchParams.has("selectedid")){
            url.searchParams.delete("selectedid");
        }
        url.searchParams.append("selectedid", id);
        window.history.replaceState({},"", url);
    };

    app.methods ={
        newfeedloaded: app.newfeedloaded,
        newpostactive: app.newpostactive,
    };


    // This creates the Vue instance.
    app.vue = new Vue({
        el: "#vue-target",
        data: app.data,
        methods: app.methods,
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