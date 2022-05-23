/*
* --GLOBAL VAR REQUIREMENTS--
* MAP_PAGE_BASE_URL: str (probably link to map)
* PROFILE_PAGE_BASE_URL: str (probably to profile, but missing the id)
*
* --PROPS--
* data: {posts: {db.posts.ALL}, auth_user: {db.auth_user.[first_name, id]}, tag1-3: {db.tags.ALL}}
* 
* --EMITS--
* (on click) postActive: post_id
* (on rate) postRated: post_id
* (on unrate) postUnrated: post_id
*/
Vue.component(
    'post', {
        props: ['data', 'isActive'],
        data: function() {
            return {
                post: this.data.posts,
                tags: [this.data.tag1, this.data.tag2, this.data.tag3].filter(e=>Boolean(e.id)),
                user: this.data.auth_user,
                rating: this.data.rating,
                rated: this.data.rated === 1,
            }
        },
        methods: {
            handleClick: function(id) {
                if (this.isActive === false) {
                    this.$emit('postActive', id);
                }
            },
            postRated: function() {
                if(this.rated){
                    this.rating -= 1;
                    this.rated = false;
                    this.$emit("postUnrated", this.post.id);
                }
                else{
                    this.rating += 1;
                    this.rated = true;
                    this.$emit("postRated", this.post.id)
                }
                
            },
        },
        computed: {
            mapurl: function() {
                return MAP_PAGE_BASE_URL;
            },
            profileurl: function() {
                return PROFILE_PAGE_BASE_URL + "/" + this.user.id;
            },
            trimbodytext: function() {
                if(!this.post.body){
                    return "";
                }
                if(this.isActive || this.post.body.length <= 247){
                    return this.post.body;
                }
                space = this.post.body.lastIndexOf(' ', 247);
                space = Math.max(0,space);
                return this.post.body.slice(0,space) + "...";
            }
        },
        template: `
        <div class="feed-post" v-bind:class="{active: isActive}" v-bind:id="post.id">
            <div class="box has-background-grey-dark" style="height: 100%" v-on:click="handleClick(post.id)">
                <div class="columns is-vcentered">
                    <div vlas="column" v-if="tags == false"></div>
                    <div class="column" v-for="t in tags">
                        <tag :name="t.tag_name" :color="t.color"></tag>
                    </div>
                    <div class="column is-6" v-if="tags.length === 0"></div>
                    <div class="column is-6 columns is-vcentered is-mobile" v-if="isActive">
                        <div class="column is-flex-centered">
                            <a :href="mapurl" 
                            class="button is-round has-background-purple-blue has-text-white is-purple-blue  has-text-weight-semibold" 
                            >map</a>
                        </div>
                        <div class="column is-flex-centered">
                            <a :href="profileurl" class="has-text-white">
                                <div class="columns is-mobile p-0 m-0">
                                    <div class="image is-48x48 p-0">
                                        <img class="column is-rounded p-0" src="img/gambit.png">
                                    </div>
                                    <p class="column content">{{user.first_name}}</p>
                                </div>
                            </a>
                        </div>
                        <div class="column is-flex-centered">
                            <div class="icon-text">
                                <span :class="rated ? 'has-text-primary' : 'has-text-white'" v-on:click="postRated()">
                                    <i class="fa fa-lg fa-star"></i>
                                </span>
                                <span class="has-text-white">&times {{rating}}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="block">
                    <p class="title has-text-white">{{post.title}}</p>
                </div>
                <div class="divider is-white"></div>
                <div class="container">
                    <div class="columns">
                        <div class="column">
                            <p class="content has-text-grey-light">
                                {{trimbodytext}}
                            </p>
                        </div>
                        <div v-if="post.image_url" class="column is-6-mobile is-offset-3-mobile p-0">
                            <div class="box is-shadowless is-clipped p-0 m-2">
                                <div class="image is-square">
                                    <img class="has-fit-cover has-background-grey-dark" :src="post.image_url">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `
    }
);
