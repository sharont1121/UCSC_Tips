
// This will be the object that will contain the Vue attributes
// and be used to initialize it.
const app = {};


// Given an empty app object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
function init(app) {
    // This is the Vue data.
    app.data = {
        LOAD_URL: LOAD_POSTS_BASE_URL,
        RATE_URL: RATE_URL,
        PARAMS: PARAMS,
        
    };

    // We form the dictionary of all methods, so we can assign them
    // to the Vue app in a single blow.

    // This creates the Vue instance.
    app.vue = new Vue({
        el: "#vue-target",
        data: app.data,
        methods:  {
            newpostactive: function(id) {
                let url = new URL(window.location.href);
                if(url.searchParams.has("selectedid")){
                    url.searchParams.delete("selectedid");
                }
                url.searchParams.append("selectedid", id);
                window.history.replaceState({},"", url);
            },
            newfeedloaded: function( {search_text: search_text, tags: tags} ){
                new_url = new URL(`${window.location.origin}${window.location.pathname}`) //construct url without any params
                if(search_text){
                    new_url.searchParams.append("search", search_text);
                }
                if(tags){
                    new_url.searchParams.append("tags", JSON.stringify(tags))
                }
                window.history.pushState({},"", new_url);

            }
        },
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