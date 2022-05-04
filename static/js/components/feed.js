// how to get this to scroll without a fixed height

Vue.component( 'feed', {
    props: ['loadurl'],

    data: function() {
        return {
            data: [],
            selectedid: null,
            activeID: null,
            missing: false,
        }
    },
    created: function () {
        axios.get(this.loadurl)
            .then((res) => {
                this.data = res.data.data;
                this.selectedid = res.data.selectedid;
                this.missing = res.data.missing;
            })
            .catch(console.log);
    },
    methods: {
        handlePostClick: function(id) {
            //shouldnt happen because active posts aren't 'clickable'
            if (this.activeID === id){
                return;
            }
            this.missing = false;
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
            <div v-if="missing" class="box has-background-danger">
                <p class="content">could not find post!</p>
            </div>
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