
Vue.component(
    'post', {
        props: ['post', 'isActive'],

        methods: {
            handleClick: function(id) {
                if (this.isActive === false) {
                    this.$emit('postActive', id);
                }
            }
        },
        template: `
        <div class="feed-post" v-bind:class="{active: isActive}" v-bind:id="post.id">
            <div class="box has-background-grey-dark" v-on:click="handleClick(post.id)">
                <div class="columns">
                    <div class="column">
                        <tag name="tag 0" color="red"></tag>
                    </div>
                    <div class="column">
                        <tag name="tag 0" color="red"></tag>
                    </div>
                    <div class="column">
                        <tag name="tag 0" color="red"></tag>
                    </div>
                    <div class="column is-6 columns" v-if="isActive">
                        <div class="column">
                            <a class="button is-round has-background-grey has-text-white has-text-weight-semibold">map</a>
                        </div>
                        <div class="column">
                            <div class="icon-text">
                                <span class="has-text-warning">
                                    <i class="fa fa-lg fa-star"></i>
                                </span>
                                <span class="has-text-white">&times 26</span>
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
                                {{post.body}}
                            </p>
                        </div>
                        <div class="column is-6-mobile is-offset-3-mobile p-0"">
                            <div class="box is-shadowless is-clipped p-0">
                                <div class="image is-square">
                                    <img class="has-background-grey-dark" src="favicon.ico">
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
