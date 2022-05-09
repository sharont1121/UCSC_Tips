Vue.component('searchbar',{
    props: ["search", "start"],
    data: function() {
        return {
            search_text: STARTING_SEARCH || "",
        }
    },
    methods: {
        submit: function() {

            search = this.search_text.trim();
            this.$emit('search', {text: search});
        },
        reset: function() {

            this.search_text = "";
            this.$emit('search', {text: ""});
        }
    },
    template: `
    <form @submit.prevent="submit" class="field has-addons">
        <div class="control is-expanded has-icons-left">
            <input type="text" class="input is-small is-rounded is-grey-dark has-text-white has-background-grey-dark has-text-grey-light" placeholder="search posts" v-model="search_text">
            <span class="icon is-left is-grey-light">
                <i class="fa fa-lg fa-search"></i>
            </span>
        </div>
        <div class="control">
            <a @click="reset" class="button is-small is-grey has-text-white is-rounded">reset</a>
        </div>
        <div class="control">
            <a @click="submit" class="button is-small is-purple-blue has-text-white is-rounded">search</a>
        </div>
    </form>
    `,
})