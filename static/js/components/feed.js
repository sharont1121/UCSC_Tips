// how to get this to scroll without a fixed height

Vue.component( 'feed', {
    props: ['data', "selectedid"],

    data: function() {
        return {
            activeID: null
        }
    },

    methods: {
        handlePostClick: function(id) {
            //shouldnt happen because active posts aren't 'clickable'
            if (this.activeID === id){
                return;
            }
            this.activeID = id;
                setTimeout( () => {
                    const e = document.getElementById(id);
                    const h = e.offsetTop - this.$el.offsetTop - 20;
                    this.$el.scroll({
                        top: h,
                        left: 0,
                        behavior: "auto",
                    });
                }, 1)            
        },
    },
    template: `
    <div style="height: 100%; overflow-y: scroll;">
        <div class="section">
            <div class="feed-grid" >
                <post 
                    v-for="p in data" 
                    v-bind:isActive="p.posts.id === (activeID == null ? selectedid : activeID)" 
                    v-bind:key="p.posts.id"
                    v-on:postActive="handlePostClick($event)" 
                    v-bind:data="p" >
                </post>
            </div>
        </div>
    </div>
    `
});