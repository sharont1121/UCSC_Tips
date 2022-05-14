// how to get this to scroll without a fixed height

const POSTS_PER_LOAD = 10;

Vue.component( 'feed', {
    props: ['loadurl', 'params', 'isone'],

    data: function() {
        const parsed_params = JSON.parse(this.params);
        return {
            data: [],
            min_post: 0,
            activeid: parsed_params["selectedid"],
            missing: false,
            search: parsed_params["search"],
            tags: parsed_params["tags"],
            userid: parsed_params["userid"],
            locked: false,
        }
    },
    created: function () {
        this._get().then((res) => {
            this.$el.scroll({top:0, left: 0})
            this.data = res.data.data;
            this.min_post += this.data.length;
            this.activeid = res.data.selectedid;
            this.missing = res.data.missing;
        })
        .catch(console.log);
    },
    mounted: function() {
        this.handleResize();
        window.addEventListener('resize', this.handleResize);
    },
    unmounted: function() {
        window.removeEventListener('resize',this.handleResize);
    },
    methods: {
        filter_duplicates: function(data){
            ids = {}
            for (let i of this.data){
                ids[i.posts.id] = true;
            }
            return data.filter((e)=>{
                return !(e.posts.id in ids);
            })
        },
        _get() {
            return axios.get(this.loadurl, {params: {
                min: this.min_post, 
                max: this.min_post+POSTS_PER_LOAD, 
                search: this.search ? this.search : null,
                userid: this.userid ? this.userid : null,
                tags: this.tags ? JSON.stringify(this.tags) : null,
                selectedid: this.activeid,
            }});
        },
        load_more_posts: function() {
            this._get().then((res) => {
                filtered = this.filter_duplicates(res.data.data);
                this.data.push(...filtered);
                this.min_post += res.data.data.length;
                this.activeid = res.data.selectedid;
                this.missing = res.data.missing;
                if (filtered.length !== 0) {
                    this.locked = false;
                }
            })
            .catch(console.log);
        },
        handlePostClick: function(id) {
            //shouldnt happen because active posts aren't 'clickable'
            if (this.activeid === id){
                return;
            }
            this.missing = false;
            this.activeid = id;
            console.log(this.activeid);
            this.$emit('newpostactive', id);
            setTimeout( () => {
                const e = document.getElementById(id);
                const h = e.offsetTop - this.$el.offsetTop - 5;
                this.$el.scroll({
                    top: h,
                    left: 0,
                    behavior: "auto",
                });
            }, 1)            
        },
        handleResize: function () {
            this.is_one = this.$el.offsetWidth < 1024;
        },
        handleSearch: function(search_obj) {
            this.search = search_obj.text;
            this.tags = search_obj.tags;
            if (this.tags == false) {
                this.tags = null;
            }

            this.min_post = 0;
            this.data = [];

            //maybe some sort of loading thingy
            this._get().then((res) => {
                this.$el.scroll({top: 0, left: 0});
                this.data = res.data.data;
                this.activeid = res.data.selectedid;
                this.missing = res.data.missing;
                this.min_post += res.data.data.length;
                this.$emit('newfeedloaded', {search_text: this.search, tags: this.tags})
            })
        },
        handleScroll: function({target: {scrollTop, scrollTopMax}}) {
            if (scrollTop + 300 > scrollTopMax){
                if(this.locked === false){
                    this.locked = true;
                    this.load_more_posts();
                }
            }
        }
    },
    template: `
    <div @scroll="handleScroll" style="height: 100%; overflow-y: scroll;">
        <div class="section py-3">
            <searchbar @search="handleSearch($event)" :searchstr="this.search" :tagslist="this.tags"> </searchbar>
        </div>
        <div class="section py-0">
            <div v-if="this.missing" class="box has-background-danger">
                <p class="content">could not find post!</p>
            </div>
            <div class="feed-grid" v-bind:class="{'is-one': isone == true}">
                <post 
                    v-for="p in this.data" 
                    :data="p" 
                    :isActive="p.posts.id === activeid" 
                    :key="p.posts.id"
                    @postActive="handlePostClick($event)" 
                    >
                </post>
            </div>
        </div>
    </div>
    `
});