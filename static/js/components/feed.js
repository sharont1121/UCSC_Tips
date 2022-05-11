// how to get this to scroll without a fixed height

const POSTS_PER_LOAD = 10;

Vue.component( 'feed', {
    props: ['loadurl'],

    data: function() {
        params = Q.get_query();
        STARTING_SEARCH = params["search"];
        STARTING_TAGS = params["tags"];
        return {
            data: [],
            min_post: 0,
            selectedid: null,
            activeID: null,
            missing: false,
            isOne: false,
            search: STARTING_SEARCH,
            tags: STARTING_TAGS,
            locked: false,
        }
    },
    created: function () {
        axios.get(this.loadurl, {params: {
            min: this.min_post, 
            max: this.min_post+POSTS_PER_LOAD,
        }})
        .then((res) => {
            this.data = res.data.data;
            this.min_post += this.data.length;
            this.selectedid = res.data.selectedid;
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
        load_more_posts: function() {
            axios.get(LOAD_POSTS_BASE_URL, {params: {
                min: this.min_post, 
                max: this.min_post+POSTS_PER_LOAD, 
                search: this.search ? this.search : null,
                tags: this.tags
            }})
            .then((res) => {
                filtered = this.filter_duplicates(res.data.data);
                this.data.push(...filtered);
                this.min_post += res.data.data.length;
                this.selectedid = res.data.selectedid;
                this.missing = res.data.missing;
                if (filtered.length !== 0) {
                    this.locked = false;
                }
            })
            .catch(console.log);
        },
        handlePostClick: function(id) {
            //shouldnt happen because active posts aren't 'clickable'
            if (this.activeID === id){
                return;
            }
            this.missing = false;
            this.activeID = id;
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
            this.isOne = this.$el.offsetWidth < 1024;
        },
        handleSearch: function(search_obj) {
            let search_text = search_obj.text;
            let tags = JSON.stringify(search_obj.tags);
            if (tags == false) {
                tags = null;
            }

            this.min_post = 0;
            this.data = [];

            //maybe some sort of loading thingy
            axios.get(LOAD_POSTS_BASE_URL, { params: {
                min: this.min_post, 
                max: this.min_post + POSTS_PER_LOAD, 
                search: search_text ? search_text : null,
                tags: tags,
            }})
            .then((res) => {
                this.$el.scroll({top: 0, left: 0});
                this.data = res.data.data;
                this.selectedid = res.data.selectedid;
                this.missing = res.data.missing;
                this.search = search_text;
                this.min_post += res.data.data.length;
                new_url = new URL(`${window.location.origin}${window.location.pathname}`) //construct url without any params
                if(search_text){
                    new_url.searchParams.append("search", search_text);
                }
                if(tags){
                    new_url.searchParams.append("tags", tags)
                }
                window.history.pushState({},"", new_url);
            })
            .catch(console.log)
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
            <searchbar v-on:search="handleSearch($event)" > </searchbar>
        </div>
        <div class="section py-0">
            <div v-if="missing" class="box has-background-danger">
                <p class="content">could not find post!</p>
            </div>
            <div class="feed-grid" v-bind:class="{'is-one': isOne}">
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