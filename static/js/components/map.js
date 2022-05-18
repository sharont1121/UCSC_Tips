let app = {};


// Given an empty app object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
let init = (app) => {
    // This is the Vue data that is kept in synch.
    app.data = {
        // Complete as you see fit.
        posts: [],
    };

    app.enumerate = (a) => {
        // This adds an _idx field to each element of the array.
        let k = 0;
        a.map((e) => { e._idx = k++; });
        return a;
    };

    app.init_map = function () {
        const coord = { lat: 36.9927, lng: -122.0593 };
        // The map, centered at UCSC
        const map = new google.maps.Map(document.getElementById("map"), {
            zoom: 15,
            center: coord,
        });
        // The marker, positioned at UCSC
        const marker = new google.maps.Marker({
            position: coord,
            map: map,
        });
    }

    app.methods = {
        // TODO
    };

    // This creates the Vue instance.
    app.vue = new Vue({
        el: "#map",
        data: app.data,
        methods: app.methods
    });

    // And this initializes it.
    app.init = () => {
        // Put here any initialization code.
        // Typically this is a server GET call to load the data.
        // Now we do an actual server call, using axios.
        axios.get(MAP_PAGE_BASE_URL).then(function (response) {
            app.vue.posts = response.data.posts;
            // app.enumerate(app.vue.posts);
        })
        app.init_map();
    };

    // Call to the initializer.
    app.init();
};

init(app);
