
function get_starting_posts() {
    return axios.get(LOAD_POSTS_URL)
}

function get_specific_post(post_id) {
    return axios.get( LOAD_POSTS_URL, {params: {selectedid: post_id} });
}

function get_more_posts(min, max) {
    return axios.get(LOAD_POSTS_URL, {params: {min: min, max: max}})
}

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
        selectedid: null,
        missing: false,
    };

    app.enumerate = (a) => {
        // This adds an _idx field to each element of the array.
        let k = 0;
        a.map((e) => {e._idx = k++;});
        return a;
    };

    // We form the dictionary of all methods, so we can assign them
    // to the Vue app in a single blow.
    app.methods = {
        
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