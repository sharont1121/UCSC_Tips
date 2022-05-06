Vue.component('searchbar',{
    props: [],
    template: `
    <div class="field has-addons">
        <div class="control is-expanded">
            <input type="text" class="input is-small" placeholder="search posts">
        </div>
        <div class="control">
            <a class="button is-small">search</a>
        </div>
    </div>
    `,
})