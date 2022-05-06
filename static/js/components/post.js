
Vue.component(
    'post', {
        props: ['data', 'isActive'],
        data: function() {
            return {
                post: this.data.posts,
                tags: [this.data.tag1, this.data.tag2, this.data.tag3].filter(e=>Boolean(e.id)),
                user: this.data.auth_user,
        }
        },
        methods: {
            handleClick: function(id) {
                if (this.isActive === false) {
                    // ---- this chunk of code replaces
                    let vars = window.location.search.replaceAll(/[&]?selectedid=[\d]+/g, "");
                    console.log(vars);
                    if(vars && vars !== '?'){
                        vars = vars + '&';
                    }
                    else{
                        vars = '?';
                    }
                    window.history.replaceState({},"", `${window.location.pathname}${vars}selectedid=${id}`)
                    this.$emit('postActive', id);
                }
            },
            getMapUrl: function() {
                return "todo!";
            },
            postRated: function() {
                console.log("how do we do this!!!");
                //axios.post()
            },
        },
        computed: {
            mapurl: function() {
                return this.$parent.mapurl;
            },
            profileurl: function() {
                return this.$parent.profileurl + "/" + this.user.id;
            },
            trimbodytext: function() {
                
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
                    <div class="column" v-for="t in tags">
                        <tag :name="t.tag_name" :color="t.color"></tag>
                    </div>
                    <div class="column is-6 columns is-vcentered is-mobile" v-if="isActive">
                        <div class="column is-flex-centered">
                            <a class="button is-round has-background-purple-blue has-text-white has-text-weight-semibold" :href="mapurl">map</a>
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
                                <span class="has-text-white has-text-right" v-on:click="postRated()">
                                    <i class="fa fa-lg fa-star"></i>
                                </span>
                                <span class="has-text-white has-text-right">&times {{post.rating}}</span>
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
                        <div class="column is-6-mobile is-offset-3-mobile p-0"">
                            <div class="box is-shadowless is-clipped p-0 m-2">
                                <div class="image is-square">
                                    <img class="has-fit-cover has-background-grey-dark" src="img/roman.jpg">
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
