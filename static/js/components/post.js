
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
            <div class="box has-background-grey-dark" v-on:click="handleClick(post.id)">
                <div class="columns">
                    <div class="column is-4">
                        <tag name="tag 0" color="red"></tag>
                    </div>
                    <div class="column is-4">
                        <tag name="tag 0" color="red"></tag>
                    </div>
                    <div class="column is-4">
                        <tag name="tag 0" color="red"></tag>
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
);
