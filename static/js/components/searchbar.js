Vue.component('searchbar',{
    props: ["search"],
    data: function() {
        return {
            search_text: STARTING_SEARCH || "",
            focus: false,
            tag_text: "",
            selected_tags: [],
        }
    },
    methods: {
        submit: function() {
            this.focus = false;
            search = this.search_text.trim();
            this.$emit('search', {text: search});
        },
        reset: function() {
            this.focus = false;
            this.search_text = "";
            this.$emit('search', {text: ""});
            this.selected_tags = [];
        },
        gainFocus: function() {
            this.focus = true;
        },
        loseFocus: function() {
            this.focus = false;
        },
        handleTagSubmit: function() {
            if (this.tag_text === "") {return}
            if (this.selected_tags.includes(this.tag_text)){return}
            this.selected_tags.push(this.tag_text);
            this.tag_text = "";
        },
    },
    template: `
    <div @mouseover="focus = true" @mouseleave="focus = false" style="position: relative;">
        <form @submit.prevent="submit" class="field has-addons mb-0">
            <div class="control is-expanded has-icons-left">
                <input @focus="gainFocus" v-model="search_text" type="text" class="input is-small is-rounded is-grey-dark has-text-white has-background-grey-dark has-text-grey-light" placeholder="search posts" style="z-index: 3">
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
        <div 
            class="card has-background-grey-dark px-3" 
            v-bind:style="{height: focus ? '10rem' : '0'}"  
            style="top: 15px; position: absolute; width: calc(100% - 132px); z-index: 2; transition: height 0.2s ease-out; overflow: hidden;" 
            ><br>
            <div class="columns">
                <div class="column">
                    <fieldset :disabled="selected_tags.length > 2">
                        <form @submit.prevent="handleTagSubmit()" class="field has-addons">
                            <div class="control">
                                <input v-model="tag_text" v-bind:class="{disabled: selected_tags.length > 2}" class="input is-small is-rounded" name="tag-search" placeholder="search tags" type="text">
                            </div>
                            <div class="control">
                                <button class="button is-small is-grey has-text-white is-rounded">add</button> 
                            </div>
                        </form>
                    </fieldset>
                </div>
                <div class="column">
                    <tag v-for="t in selected_tags" :name="t" :key="'tag-'+t" color="RGB(0,0,0,0.3)"></tag>
                </div>
            </div>
        </div>
    </div>
    `,
})