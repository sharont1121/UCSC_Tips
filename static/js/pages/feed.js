
// This will be the object that will contain the Vue attributes
// and be used to initialize it.
const app = {};


// Given an empty app object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
function init(app) {
    // This is the Vue data.
    app.data = {
        data: [],
        min: 0,
        max: 10,
        LOAD_URL: LOAD_POSTS_BASE_URL,
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
                let vars = window.location.search.replaceAll(/[&]?selectedid=[\d]+/g, "");
                if(vars && vars !== '?'){
                    vars = vars + '&';
                }
                else{
                    vars = '?';
                }
                window.history.replaceState({},"", `${window.location.pathname}${vars}selectedid=${id}`)
            },
            newfeedloaded: function( {search_text: search_text, tags: tags} ){
                new_url = new URL(`${window.location.origin}${window.location.pathname}`) //construct url without any params
                if(search_text){
                    new_url.searchParams.append("searchstr", search_text);
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