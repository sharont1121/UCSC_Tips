
function get_starting_posts() {
    axios.get(LOAD_POSTS_URL)
}

// This will be the object that will contain the Vue attributes
// and be used to initialize it.
const app = {};


// Given an empty app object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
function init(app) {

    // This is the Vue data.
    app.data = {
        posts: [],
    };

    app.enumerate = (a) => {
        // This adds an _idx field to each element of the array.
        let k = 0;
        a.map((e) => {e._idx = k++;});
        return a;
    };
    app.split_posts = (num, col) => {
        return app.vue.data.posts.some((e,i)=>{
            i % num == col
        });

    }
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
        axios.get(LOAD_POSTS_URL)
            .then((res) => {
                app.vue.posts.push(...app.enumerate(res.data.posts));
            })
    };

    // Call to the initializer.
    app.init();
};

// This takes the (empty) app object, and initializes it,
// putting all the code i
init(app);