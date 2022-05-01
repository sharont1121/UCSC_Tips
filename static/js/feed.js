
function get_starting_posts() {
    axios.get(LOAD_POSTS_URL)
}

Vue.component(
    'post', {
        props: ['post', 'isActive'],

        methods: {
            handleClick: function(id) {
                isActive = true;
                this.$emit('postActive', id);
            }
        },
        template: `
        <div class="feed-post" v-bind:class="{active: isActive}" v-bind:id="post.id">
            <div class="box" v-on:click="handleClick(post.id)">
                <div class="block">
                    <p class="title">{{post.title}}</p>
                </div>
                <div class="container">
                    <div class="columns">
                        <div class="column">
                            <p class="content">
                                {{post.body}}
                            </p>
                        </div>
                        <div class="column is-6-mobile is-offset-3-mobile p-0" style="background-color: gray;">
                            <div class="box is-shadowless is-clipped p-0">
                                <div class="image is-square">
                                    <img src="favicon.ico" style="background-color: red;">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `
    }
)

Vue.component('feed',{
    props: ['posts', "activeid"],
    data: function() {
        return {
            activeID: this.activeid
        }
    },
    methods: {
        handlePostClick: function(id) {
            this.activeID = id;
            is_one = getComputedStyle(this.$el).getPropertyValue("--is-one");
            if (is_one == false) {
                setTimeout( () => {
                    let e = document.getElementById(id);
                    let h = e.getBoundingClientRect().top + window.scrollY;
                    window.scroll({
                        top: h,
                        left: 0,
                        behavior:"auto",
                    });
                }, 1)
            }
            
        }
    },
    template: `
    <div>
        <div class="feed-grid">
            <post 
                v-for="p in posts" 
                v-bind:isActive="p.id === activeID" 
                v-on:postActive="handlePostClick($event)" 
                v-bind:key="p.id"
                 v-bind:post="p">
            </post>
        </div>
    </div>
    `
})


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
        scrollToPost: function (id) {

        }
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