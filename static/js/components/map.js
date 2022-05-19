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

    app.decorate = (a) => {
        a.map((e) => {
            e._state = { posts: "clean" };
            e._server_vals = { posts: e.posts };
        });
        return a;
    };

    app.init_map = function (posts) {
        const ucsc_coord = { lat: 36.9927, lng: -122.0593 };
        // const ucsc_coord = { lat: posts[0].lat, lng: posts[0].lng };
        // The map, centered at UCSC
        const map = new google.maps.Map(document.getElementById("map"), {
            zoom: 15,
            center: ucsc_coord,
        });

        for (var i = 0; i < app.vue.posts.length; i++) {
            let lng = posts[i].lng
            let lat = posts[i].lat
            const c = { lat: lat, lng: lng };
            const marker = new google.maps.Marker({
                position: c,
                map: map,
                title: posts[i].title,
            });
        }

        // The marker, positioned at UCSC
        const ucsc_marker = new google.maps.Marker({
            // color: 'yellow',
            position: ucsc_coord,
            map: map,
            title: "UCSC is here!"
        });
    }

    app.methods = {
        // TODO
    };

    // This creates the Vue instance.
    app.vue = new Vue({
        el: "#vue-target",
        data: app.data,
        methods: app.methods
    });

    // And this initializes it.
    app.init = () => {
        // Put here any initialization code.
        // Typically this is a server GET call to load the data.
        // Now we do an actual server call, using axios.
        axios.get(map_load_url).then(function (response) {
            app.vue.posts = app.decorate(app.enumerate(response.data.posts));
            // app.enumerate(app.vue.posts);
            let posts = app.decorate(app.enumerate(response.data.posts));
            app.vue.posts = posts
            app.init_map(posts);
        })

    };

    // Call to the initializer.
    app.init();
};

init(app);
