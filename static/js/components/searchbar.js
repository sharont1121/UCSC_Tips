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
        }
    },
    template: `
    <form @submit.prevent="submit" class="field has-addons">
        <div class="control is-expanded">
            <input type="text" class="input is-small is-rounded" placeholder="search posts" v-model="search_text">
        </div>
        <div class="control">
            <a @click="submit" class="button is-small is-rounded">search</a>
        </div>
    </form>
    `,
})