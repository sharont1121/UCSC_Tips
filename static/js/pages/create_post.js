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

    };

    app.enumerate = (a) => {
        // This adds an _idx field to each element of the array.
        let k = 0;
        a.map((e) => {e._idx = k++;});
        return a;
    };

    app.add_tip = function () {
        axios.post(add_tip_url,
            {
                title: app.vue.add_title,
                body: app.vue.add_body,
                tag1_name: app.vue.add_tag1,
                tag2_name: app.vue.add_tag2,
                tag3_name: app.vue.add_tag3,
            }).then(function (response) {
            // console.log(response.data.id);
            app.reset_form();
        });

    };

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