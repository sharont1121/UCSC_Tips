// how to get this to scroll without a fixed height

Vue.component( 'feed', {
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
            console.log(is_one)
            if (is_one == false) {
                setTimeout( () => {
                    const e = document.getElementById(id);
                    const h = e.offsetTop - this.$el.offsetTop - 20;
                    this.$el.scroll({
                        top: h,
                        left: 0,
                        behavior: "auto",
                    });
                }, 1)
            }
            
        },
    },
    template: `
    <div style="height: 100%; overflow-y: scroll;">
        <div class="section">
            <div class="feed-grid" >
                <post 
                    v-for="p in posts" 
                    v-bind:isActive="p.id === activeid" 
                    v-bind:key="p.id"
                    v-on:postActive="handlePostClick($event)" 
                    v-bind:post="p" >
                </post>
            </div>
        </div>
    </div>
    `
});