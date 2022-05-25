const UCSC_COORD = { lat: 36.9927, lng: -122.0593 };
let app = {};


// Given an empty app object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
let init = (app) => {
    // This is the Vue data that is kept in synch.
    app.data = {
        // Complete as you see fit.
        posts: [],
        pid: -1,
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

    app.reset_center = function (map, center) {
        map.addListener("center_changed", () => {

            // 3 seconds after the center of the map has changed, pan back to Center Marker UCSC.
            window.setTimeout(() => {
                map.panTo(center.getPosition());
            }, 3000);
        });
    }

    app.reset_zoom = function (map, center) {
        center.addListener("click", () => {
            map.setZoom(15);
            map.setCenter(center.getPosition());
        });
    }
    app.load_post = function (id) {
        let vars = window.location.search.replaceAll(/[&]?selectedid=[\d]+/g, "");
        console.log(vars);
        if (vars && vars !== '?') {
            vars = vars + '&';
        }
        else {
            vars = '?';
        }

        let url = window.location.toString();
        let add_path = "feed" + vars + "selectedid=" + id;
        return url.replace(/map/, add_path);
    };

    app.get_pop_up_string = function (post) {
        let href = app.load_post(post.id)
        let view_details = "See More Details..."
        let title = post.title
        let body = ""
        if (post.body.length > 300) {
            body = post.body.slice(0, 300) + "... "
        }
        const contentString =
            '<div class="content has-text-black">' +
            // '<div id="siteNotice">' +
            // "</div>" +
            '<h1 id="firstHeading" class="firstHeading">' + title + '</h1>' +
            '<div id="bodyContent">' +
            "<p class=\"has-text-justified\">" +
            body +
            "</p>" +
            '<a href=\"' + href + '\"> <b>' + view_details +
            "</b></a> " +
            "</div>" +
            "</div>";
        return contentString
    }

    app.init_map = function (posts, p_idx = -1) {

        let zoom = 15
        let center_coord = { lat: 36.9927, lng: -122.0593 };

        if (p_idx >= 0 && p_idx < posts.length) {
            center_coord = { lat: posts[p_idx].lat, lng: posts[p_idx].lng };
            zoom = 17
        }
        // const ucsc_coord = { lat: posts[0].lat, lng: posts[0].lng };
        // The map, centered at UCSC
        const map = new google.maps.Map(document.getElementById("map"), {
            zoom: zoom,
            center: center_coord,
        });

        let ucsc_icon = "http://maps.google.com/mapfiles/kml/paddle/ylw-stars.png"
        // The center marker, positioned at UCSC
        const ucsc_marker = new google.maps.Marker({
            // color: 'yellow',
            position: UCSC_COORD,
            map: map,
            title: "UCSC is here!",
            icon: ucsc_icon,
        });

        for (var i = 0; i < app.vue.posts.length; i++) {
            let p = posts[i]
            let lng = p.lng
            let lat = p.lat
            const c = { lat: lat, lng: lng };
            const marker = new google.maps.Marker({
                position: c,
                map: map,
                title: p.title,
            });
            const infowindow = new google.maps.InfoWindow({
                content: app.get_pop_up_string(p),
            });
            marker.addListener("click", () => {
                infowindow.open({
                    anchor: marker,
                    map,
                    shouldFocus: false,
                    zoom: 15
                });
            });

        }
        // app.reset_center(map, ucsc_marker)   // Use this if you want the map focus on UCSC
        app.reset_zoom(map, ucsc_marker)
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
        // axios.get(MAP_PAGE_BASE_URL).then(function (response) {
        //     
        // })
        app.vue.pid = parseInt(PID)
        axios.get(MAP_LOAD_URL).then(function (response) {
            app.vue.posts = app.decorate(app.enumerate(response.data.posts));

            // app.enumerate(app.vue.posts);
            let posts = app.decorate(app.enumerate(response.data.posts));
            app.vue.posts = posts



            let p_idx = -1
            for (var i = 0; i < posts.length; i++) {
                if (posts[i].id == app.vue.pid) {
                    p_idx = posts[i]._idx
                }
            }
            // app.vue.p_idx = p_idx
            app.init_map(posts, p_idx);
        })

    };

    // Call to the initializer.
    app.init();
};

init(app);
